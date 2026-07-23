package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"github.com/myorg/api-gateway/internal/config"
)

var DB *sql.DB

func Connect(cfg *config.Config) {
	var err error
	DB, err = sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB.SetMaxOpenConns(cfg.MaxOpenConns)
	DB.SetMaxIdleConns(cfg.MaxIdleConns)
	DB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	log.Println("Connected to PostgreSQL")
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}

func AuditLog(userID, action, targetTable, targetID string, oldValues, newValues interface{}) {
	if DB == nil {
		return
	}
	go func() {
		_, err := DB.Exec(
			`INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES ($1, $2, $3, $4)`,
			nilIfEmpty(userID), action, nilIfEmpty(targetTable), nilIfEmpty(targetID),
		)
		if err != nil {
			log.Printf("audit log error: %v", err)
		}
	}()
}

func nilIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func ValidateUUID(id string) bool {
	if len(id) != 36 {
		return false
	}
	for i, c := range id {
		if c == '-' {
			if i != 8 && i != 13 && i != 18 && i != 23 {
				return false
			}
			continue
		}
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return false
		}
	}
	return true
}

func QueryCount(query string, args ...interface{}) (int, error) {
	var count int
	err := DB.QueryRow(query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("query count failed: %w", err)
	}
	return count, nil
}
