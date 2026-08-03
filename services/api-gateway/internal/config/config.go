package config

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port             string
	DatabaseURL      string
	JWTSecret        []byte
	CORSOrigins      []string
	CookieSecure     bool
	MaxOpenConns     int
	MaxIdleConns     int
	ConnMaxLifetime  time.Duration
	BodyMaxBytes     int64
	JWTExpiry        time.Duration
	GeneralRateLimit int
	RateWindow       time.Duration
}

const (
	JWTIssuer   = "api-gateway"
	JWTAudience = "template-app"
)

func envInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return n
		}
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
}

func Load() *Config {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		b := make([]byte, 32)
		if _, err := rand.Read(b); err != nil {
			log.Fatal("Failed to generate JWT secret:", err)
		}
		secret = hex.EncodeToString(b)
		log.Println("WARNING: No JWT_SECRET set. Using random secret (tokens won't survive restart).")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// CORS origins: comma-separated allowlist from env, defaults for local dev.
	origins := []string{"http://localhost:3000", "http://localhost:8081", "http://localhost:19006"}
	if v := os.Getenv("CORS_ORIGINS"); v != "" {
		origins = nil
		for _, o := range strings.Split(v, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				origins = append(origins, o)
			}
		}
	}

	jwtExpiry := 24 * time.Hour
	if v := os.Getenv("JWT_EXPIRY_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			jwtExpiry = time.Duration(n) * time.Hour
		}
	}

	return &Config{
		Port:             port,
		DatabaseURL:      dbURL,
		JWTSecret:        []byte(secret),
		CORSOrigins:      origins,
		CookieSecure:     envBool("COOKIE_SECURE", true),
		MaxOpenConns:     envInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:     envInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime:  5 * time.Minute,
		BodyMaxBytes:     1 << 20, // 1MB
		JWTExpiry:        jwtExpiry,
		GeneralRateLimit: envInt("GENERAL_RATE_LIMIT", 300),
		RateWindow:       time.Minute,
	}
}
