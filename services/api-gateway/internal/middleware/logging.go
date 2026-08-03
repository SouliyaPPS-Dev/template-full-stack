package middleware

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

// AccessLog emits a single-line JSON log entry per request with method, path,
// status, latency, request id and client info — much more useful for
// debugging and dashboards than chi's default logger.
func AccessLog(next http.Handler) http.Handler {
	logger := log.New(os.Stdout, "", 0)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)

		entry := map[string]interface{}{
			"level":       "info",
			"ts":          start.UTC().Format(time.RFC3339Nano),
			"method":      r.Method,
			"path":        r.URL.Path,
			"status":      sw.status,
			"duration_ms": float64(time.Since(start).Microseconds()) / 1000.0,
			"remote_ip":   r.RemoteAddr,
			"request_id":  chimiddleware.GetReqID(r.Context()),
			"user_agent":  r.Header.Get("User-Agent"),
		}
		b, err := json.Marshal(entry)
		if err != nil {
			logger.Printf("access-log marshal error: %v", err)
			return
		}
		logger.Println(string(b))
	})
}
