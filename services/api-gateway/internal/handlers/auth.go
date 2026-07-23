package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/myorg/api-gateway/internal/config"
	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/middleware"
	"github.com/myorg/api-gateway/internal/models"
)

func Register(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		req.Email = strings.ToLower(strings.TrimSpace(req.Email))
		req.FullName = sanitizeString(req.FullName)
		req.Phone = sanitizeString(req.Phone)

		if !validateEmail(req.Email) {
			writeError(w, http.StatusBadRequest, "invalid email format")
			return
		}
		if !validatePassword(req.Password) {
			writeError(w, http.StatusBadRequest, "password must be 8-128 characters")
			return
		}
		if req.FullName == "" {
			writeError(w, http.StatusBadRequest, "full_name is required")
			return
		}

		var exists bool
		database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", req.Email).Scan(&exists)
		if exists {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to process password")
			return
		}

		var userID string
		err = database.DB.QueryRow(
			"INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES ($1, $2, $3, $4, 'user', true) RETURNING id",
			req.Email, string(hashedPassword), req.FullName, req.Phone,
		).Scan(&userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to create user")
			return
		}

		token, err := middleware.GenerateJWT(cfg, userID, "user")
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to generate token")
			return
		}

		database.AuditLog(userID, "register", "users", userID, nil, nil)

		writeJSON(w, http.StatusCreated, models.AuthResponse{
			AccessToken: token,
			TokenType:   "bearer",
			User: models.User{
				ID:       userID,
				Email:    req.Email,
				FullName: req.FullName,
				Role:     "user",
				IsActive: true,
			},
		})
	}
}

func Login(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		req.Email = strings.ToLower(strings.TrimSpace(req.Email))

		if !validateEmail(req.Email) || req.Password == "" {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		var user models.User
		var passwordHash string
		err := database.DB.QueryRow(
			"SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at, password_hash FROM users WHERE email=$1",
			req.Email,
		).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt, &passwordHash)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		if !user.IsActive {
			writeError(w, http.StatusForbidden, "account is disabled")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		token, err := middleware.GenerateJWT(cfg, user.ID, user.Role)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to generate token")
			return
		}

		database.AuditLog(user.ID, "login", "users", user.ID, nil, nil)

		writeJSON(w, http.StatusOK, models.AuthResponse{
			AccessToken: token,
			TokenType:   "bearer",
			User:        user,
		})
	}
}

func Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users WHERE id=$1",
		userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.FullName = sanitizeString(req.FullName)
	req.Phone = sanitizeString(req.Phone)

	if req.FullName == "" {
		writeError(w, http.StatusBadRequest, "full_name is required")
		return
	}

	var user models.User
	err := database.DB.QueryRow(
		"UPDATE users SET full_name=$1, phone=$2, updated_at=NOW() WHERE id=$3 RETURNING id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at",
		req.FullName, req.Phone, userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	writeJSON(w, http.StatusOK, user)
}
