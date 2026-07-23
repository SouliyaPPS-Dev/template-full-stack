package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/middleware"
	"github.com/myorg/api-gateway/internal/models"
)

func ListUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.EmailVerified, &u.IsActive, &u.CreatedAt)
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, users)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "user id is required")
		return
	}

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users WHERE id=$1",
		id,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
	}
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

	role := req.Role
	if role == "" {
		role = "user"
	}
	if role != "user" && role != "staff" && role != "admin" && role != "superadmin" {
		writeError(w, http.StatusBadRequest, "invalid role")
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
		"INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id",
		req.Email, string(hashedPassword), req.FullName, req.Phone, role,
	).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	adminID := middleware.GetUserID(r)
	database.AuditLog(adminID, "create_user", "users", userID, nil, nil)

	var user models.User
	database.DB.QueryRow(
		"SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users WHERE id=$1",
		userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)

	writeJSON(w, http.StatusCreated, user)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
		IsActive *bool  `json:"is_active"`
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

	if req.Role != "" && req.Role != "user" && req.Role != "staff" && req.Role != "admin" && req.Role != "superadmin" {
		writeError(w, http.StatusBadRequest, "invalid role")
		return
	}

	// Prevent removing last admin
	if req.Role != "" && req.Role != "admin" && req.Role != "superadmin" {
		var currentRole string
		database.DB.QueryRow("SELECT role FROM users WHERE id=$1", id).Scan(&currentRole)
		if currentRole == "admin" || currentRole == "superadmin" {
			var adminCount int
			database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role IN ('admin','superadmin')").Scan(&adminCount)
			if adminCount <= 1 {
				writeError(w, http.StatusBadRequest, "cannot remove the last admin")
				return
			}
		}
	}

	var user models.User
	query := "UPDATE users SET full_name=$1, phone=$2, updated_at=NOW()"
	args := []interface{}{req.FullName, req.Phone}
	argIdx := 3

	if req.Role != "" {
		query += ", role=$" + strconv.Itoa(argIdx)
		args = append(args, req.Role)
		argIdx++
	}
	if req.IsActive != nil {
		query += ", is_active=$" + strconv.Itoa(argIdx)
		args = append(args, *req.IsActive)
		argIdx++
	}

	query += " WHERE id=$" + strconv.Itoa(argIdx) + " RETURNING id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at"
	args = append(args, id)

	err := database.DB.QueryRow(query, args...).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	adminID := middleware.GetUserID(r)
	database.AuditLog(adminID, "update_user", "users", id, nil, nil)

	writeJSON(w, http.StatusOK, user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "user id is required")
		return
	}

	// Prevent deleting self
	currentUserID := middleware.GetUserID(r)
	if currentUserID == id {
		writeError(w, http.StatusBadRequest, "cannot delete yourself")
		return
	}

	// Prevent deleting last admin
	var role string
	err := database.DB.QueryRow("SELECT role FROM users WHERE id=$1", id).Scan(&role)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	if role == "admin" || role == "superadmin" {
		var adminCount int
		database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role IN ('admin','superadmin')").Scan(&adminCount)
		if adminCount <= 1 {
			writeError(w, http.StatusBadRequest, "cannot delete the last admin")
			return
		}
	}

	_, err = database.DB.Exec("DELETE FROM users WHERE id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete user")
		return
	}

	database.AuditLog(currentUserID, "delete_user", "users", id, nil, nil)

	writeJSON(w, http.StatusOK, map[string]string{"message": "user deleted"})
}

func DashboardStats(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{}

	var productCount, orderCount, userCount, categoryCount int
	database.DB.QueryRow("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").Scan(&productCount)
	database.DB.QueryRow("SELECT COUNT(*) FROM orders").Scan(&orderCount)
	database.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	database.DB.QueryRow("SELECT COUNT(*) FROM categories").Scan(&categoryCount)

	var totalRevenue float64
	database.DB.QueryRow("SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE payment_status='paid'").Scan(&totalRevenue)

	var pendingOrders int
	database.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE status='pending'").Scan(&pendingOrders)

	stats["total_products"] = productCount
	stats["total_orders"] = orderCount
	stats["total_users"] = userCount
	stats["total_categories"] = categoryCount
	stats["total_revenue"] = totalRevenue
	stats["pending_orders"] = pendingOrders

	writeJSON(w, http.StatusOK, stats)
}

func GetSettings(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT setting_key, setting_value::text FROM system_settings")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	settings := []models.Setting{}
	for rows.Next() {
		var s models.Setting
		var val string
		rows.Scan(&s.Key, &val)
		json.Unmarshal([]byte(val), &s.Value)
		settings = append(settings, s)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, settings)
}
