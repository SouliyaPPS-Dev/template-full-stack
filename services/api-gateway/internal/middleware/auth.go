package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/myorg/api-gateway/internal/config"
)

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UserRoleKey contextKey = "user_role"
)

func GetUserID(r *http.Request) string {
	if v := r.Context().Value(UserIDKey); v != nil {
		return v.(string)
	}
	return ""
}

func GetUserRole(r *http.Request) string {
	if v := r.Context().Value(UserRoleKey); v != nil {
		return v.(string)
	}
	return ""
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func GenerateJWT(cfg *config.Config, userID, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"iss":  config.JWTIssuer,
		"aud":  config.JWTAudience,
		"exp":  now.Add(cfg.JWTExpiry).Unix(),
		"iat":  now.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(cfg.JWTSecret)
}

func extractToken(r *http.Request) string {
	authType := r.Header.Get("X-Auth-Type")

	if authType == "admin" {
		if cookie, err := r.Cookie("admin_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
		if cookie, err := r.Cookie("auth_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
	} else if authType == "user" {
		if cookie, err := r.Cookie("auth_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
		if cookie, err := r.Cookie("admin_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
	} else {
		if cookie, err := r.Cookie("auth_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
		if cookie, err := r.Cookie("admin_token"); err == nil && cookie.Value != "" {
			return cookie.Value
		}
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}
	return ""
}

func Auth(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractToken(r)
			if tokenStr == "" {
				writeError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			claims, err := validateJWT(cfg, tokenStr)
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}
			userID := fmt.Sprintf("%v", claims["sub"])
			role := fmt.Sprintf("%v", claims["role"])
			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UserRoleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role := GetUserRole(r)
		if role != "admin" && role != "superadmin" && role != "staff" {
			writeError(w, http.StatusForbidden, "admin access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ParseTokenWithoutExpiry validates JWT signature but skips expiry/claims validation (for refresh)
func ParseTokenWithoutExpiry(cfg *config.Config, tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return cfg.JWTSecret, nil
	}, jwt.WithoutClaimsValidation())
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token claims")
}

func validateJWT(cfg *config.Config, tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return cfg.JWTSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if iss, ok := claims["iss"].(string); !ok || iss != config.JWTIssuer {
			return nil, fmt.Errorf("invalid issuer")
		}
		if aud, ok := claims["aud"].(string); !ok || aud != config.JWTAudience {
			return nil, fmt.Errorf("invalid audience")
		}
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}
