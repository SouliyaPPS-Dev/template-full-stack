package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateLimiter struct {
	mu      sync.Mutex
	clients map[string][]time.Time
	limit   int
	window  time.Duration
	stopCh  chan struct{}
}

func NewRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		clients: make(map[string][]time.Time),
		limit:   limit,
		window:  window,
		stopCh:  make(chan struct{}),
	}
	go rl.cleanup()
	return rl
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			now := time.Now()
			windowStart := now.Add(-rl.window)
			for key, timestamps := range rl.clients {
				valid := make([]time.Time, 0, len(timestamps))
				for _, t := range timestamps {
					if t.After(windowStart) {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(rl.clients, key)
				} else {
					rl.clients[key] = valid
				}
			}
			rl.mu.Unlock()
		case <-rl.stopCh:
			return
		}
	}
}

func (rl *rateLimiter) Stop() {
	close(rl.stopCh)
}

func (rl *rateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	timestamps := rl.clients[key]
	valid := make([]time.Time, 0, len(timestamps))
	for _, t := range timestamps {
		if t.After(windowStart) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rl.limit {
		rl.clients[key] = valid
		return false
	}

	rl.clients[key] = append(valid, now)
	return true
}

func RateLimit(limiter *rateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
				parts := strings.Split(fwd, ",")
				if len(parts) > 0 {
					ip = strings.TrimSpace(parts[0])
				}
			}
			if ip == "" || ip == "::1" || ip == "127.0.0.1" {
				ip = "local"
			}
			if !limiter.Allow(ip) {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "60")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error":"rate limit exceeded, try again later"}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
