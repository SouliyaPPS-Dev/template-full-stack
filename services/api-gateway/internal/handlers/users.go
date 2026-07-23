package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/myorg/api-gateway/internal/database"
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
