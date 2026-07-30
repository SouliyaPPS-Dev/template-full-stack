package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/myorg/api-gateway/internal/config"
	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/middleware"
	"github.com/myorg/api-gateway/internal/models"
)

func setAuthCookie(w http.ResponseWriter, cfg *config.Config, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		MaxAge:   int(cfg.JWTExpiry.Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
}

func clearAuthCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
}

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

		setAuthCookie(w, cfg, token)

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

		setAuthCookie(w, cfg, token)

		writeJSON(w, http.StatusOK, models.AuthResponse{
			AccessToken: token,
			TokenType:   "bearer",
			User:        user,
		})
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	clearAuthCookie(w)
	writeJSON(w, http.StatusOK, map[string]string{"message": "logged out"})
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

func AdminLogin(cfg *config.Config) http.HandlerFunc {
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

		if user.Role != "admin" && user.Role != "superadmin" && user.Role != "staff" {
			writeError(w, http.StatusForbidden, "admin access required")
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

		database.AuditLog(user.ID, "admin_login", "users", user.ID, nil, nil)

		http.SetCookie(w, &http.Cookie{
			Name:     "admin_token",
			Value:    token,
			Path:     "/",
			MaxAge:   int(cfg.JWTExpiry.Seconds()),
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Secure:   false,
		})

		writeJSON(w, http.StatusOK, models.AuthResponse{
			AccessToken: token,
			TokenType:   "bearer",
			User:        user,
		})
	}
}

func RefreshToken(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w, http.StatusUnauthorized, "invalid authorization format")
			return
		}

		claims, err := middleware.ParseTokenWithoutExpiry(cfg, parts[1])
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		userID := fmt.Sprintf("%v", claims["sub"])
		role := fmt.Sprintf("%v", claims["role"])

		var exists bool
		var isActive bool
		database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id=$1), COALESCE((SELECT is_active FROM users WHERE id=$1), false)", userID).Scan(&exists, &isActive)
		if !exists {
			writeError(w, http.StatusUnauthorized, "user not found")
			return
		}
		if !isActive {
			writeError(w, http.StatusForbidden, "account is disabled")
			return
		}

		newToken, err := middleware.GenerateJWT(cfg, userID, role)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to generate token")
			return
		}

		writeJSON(w, http.StatusOK, models.AuthResponse{
			AccessToken: newToken,
			TokenType:   "bearer",
			User: models.User{
				ID: userID,
			},
		})
	}
}

func AdminLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "admin_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
	writeJSON(w, http.StatusOK, map[string]string{"message": "logged out"})
}
