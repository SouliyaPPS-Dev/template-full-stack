package config

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       []byte
	CORSOrigins     []string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	BodyMaxBytes    int64
	JWTExpiry       time.Duration
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

	maxOpen := 25
	if v := os.Getenv("DB_MAX_OPEN_CONNS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxOpen = n
		}
	}

	maxIdle := 5
	if v := os.Getenv("DB_MAX_IDLE_CONNS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxIdle = n
		}
	}

	return &Config{
		Port:            port,
		DatabaseURL:     dbURL,
		JWTSecret:       []byte(secret),
		CORSOrigins:     []string{"http://localhost:3000", "http://localhost:8081", "http://localhost:19006", "http://10.30.242.232:8081"},
		MaxOpenConns:    maxOpen,
		MaxIdleConns:    maxIdle,
		ConnMaxLifetime: 5 * time.Minute,
		BodyMaxBytes:    1 << 20, // 1MB
		JWTExpiry:       30 * 24 * time.Hour,
	}
}
