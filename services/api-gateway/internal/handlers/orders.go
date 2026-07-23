package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/middleware"
	"github.com/myorg/api-gateway/internal/models"
)

func ListOrders(w http.ResponseWriter, r *http.Request) {
	role := middleware.GetUserRole(r)
	userID := middleware.GetUserID(r)

	var rows *sql.Rows
	var err error
	if role == "admin" || role == "superadmin" {
		rows, err = database.DB.Query("SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders ORDER BY created_at DESC")
	} else {
		rows, err = database.DB.Query("SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC", userID)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		rows.Scan(&o.ID, &o.OrderNumber, &o.UserID, &o.Status, &o.PaymentStatus, &o.GrandTotal, &o.CreatedAt)
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, orders)
}

func CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Items []struct {
			ProductID string `json:"product_id"`
			Quantity  int    `json:"quantity"`
		} `json:"items"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Items) == 0 {
		writeError(w, http.StatusBadRequest, "order must have at least one item")
		return
	}
	if len(req.Items) > 100 {
		writeError(w, http.StatusBadRequest, "too many items (max 100)")
		return
	}

	for _, item := range req.Items {
		if !database.ValidateUUID(item.ProductID) {
			writeError(w, http.StatusBadRequest, "invalid product_id format")
			return
		}
	}

	userID := middleware.GetUserID(r)

	tx, err := database.DB.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback()

	var orderID, orderNumber string
	orderNumber = fmt.Sprintf("ORD-%d", time.Now().UnixMilli())
	err = tx.QueryRow(
		"INSERT INTO orders (order_number, user_id, status, payment_status, grand_total) VALUES ($1,$2,'pending','unpaid',0) RETURNING id, order_number",
		orderNumber, userID,
	).Scan(&orderID, &orderNumber)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create order")
		return
	}

	var grandTotal float64
	for _, item := range req.Items {
		if item.Quantity <= 0 || item.Quantity > 1000 {
			continue
		}
		var pName string
		var pPrice float64
		var currentStock int
		err := tx.QueryRow("SELECT name, selling_price, stock FROM products WHERE id=$1 AND deleted_at IS NULL", item.ProductID).Scan(&pName, &pPrice, &currentStock)
		if err != nil {
			continue
		}
		if currentStock < item.Quantity {
			tx.Rollback()
			writeError(w, http.StatusConflict, fmt.Sprintf("insufficient stock for product %s", item.ProductID))
			return
		}

		subtotal := pPrice * float64(item.Quantity)
		grandTotal += subtotal
		tx.Exec(
			"INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5,$6)",
			orderID, item.ProductID, pName, item.Quantity, pPrice, subtotal,
		)
		tx.Exec(
			"UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
			item.Quantity, item.ProductID,
		)
	}

	tx.Exec("UPDATE orders SET grand_total=$1 WHERE id=$2", grandTotal, orderID)
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit order")
		return
	}

	database.AuditLog(userID, "create_order", "orders", orderID, nil, nil)

	writeJSON(w, http.StatusCreated, models.OrderDetail{
		Order: models.Order{ID: orderID, OrderNumber: orderNumber, UserID: userID, Status: "pending", PaymentStatus: "unpaid", GrandTotal: grandTotal},
	})
}

func GetOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid order id")
		return
	}

	role := middleware.GetUserRole(r)
	userID := middleware.GetUserID(r)

	var o models.Order
	err := database.DB.QueryRow(
		"SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders WHERE id=$1", id,
	).Scan(&o.ID, &o.OrderNumber, &o.UserID, &o.Status, &o.PaymentStatus, &o.GrandTotal, &o.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	if role != "admin" && role != "superadmin" && o.UserID != userID {
		writeError(w, http.StatusForbidden, "access denied")
		return
	}

	rows, err := database.DB.Query("SELECT id, order_id, product_id, product_name, quantity, unit_price, subtotal FROM order_items WHERE order_id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()
	items := []models.OrderItem{}
	for rows.Next() {
		var item models.OrderItem
		rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.ProductName, &item.Quantity, &item.UnitPrice, &item.Subtotal)
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, models.OrderDetail{Order: o, Items: items})
}

func UpdateOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid order id")
		return
	}

	var body struct {
		Status        string `json:"status"`
		PaymentStatus string `json:"payment_status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	validStatuses := map[string]bool{"pending": true, "confirmed": true, "processing": true, "shipped": true, "delivered": true, "cancelled": true, "refunded": true}
	validPayment := map[string]bool{"unpaid": true, "paid": true, "partial": true, "refunded": true, "failed": true}

	if body.Status != "" && !validStatuses[body.Status] {
		writeError(w, http.StatusBadRequest, "invalid status value")
		return
	}
	if body.PaymentStatus != "" && !validPayment[body.PaymentStatus] {
		writeError(w, http.StatusBadRequest, "invalid payment_status value")
		return
	}

	if body.Status != "" {
		database.DB.Exec("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2", body.Status, id)
	}
	if body.PaymentStatus != "" {
		database.DB.Exec("UPDATE orders SET payment_status=$1, updated_at=NOW() WHERE id=$2", body.PaymentStatus, id)
		if body.PaymentStatus == "paid" {
			database.DB.Exec("UPDATE orders SET paid_at=NOW() WHERE id=$1", id)
		}
	}

	database.AuditLog(middleware.GetUserID(r), "update_order", "orders", id, nil, body)

	writeJSON(w, http.StatusOK, map[string]string{"message": "updated"})
}
