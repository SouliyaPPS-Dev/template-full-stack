package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/middleware"
	"github.com/myorg/api-gateway/internal/models"
)

func ListQuotations(w http.ResponseWriter, r *http.Request) {
	role := middleware.GetUserRole(r)
	userID := middleware.GetUserID(r)

	var rows *sql.Rows
	var err error
	if role == "admin" || role == "superadmin" {
		rows, err = database.DB.Query("SELECT id, quotation_number, COALESCE(user_id,''), status, grand_total FROM quotations ORDER BY created_at DESC")
	} else {
		rows, err = database.DB.Query("SELECT id, quotation_number, COALESCE(user_id,''), status, grand_total FROM quotations WHERE user_id=$1 ORDER BY created_at DESC", userID)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	quotations := []models.Quotation{}
	for rows.Next() {
		var q models.Quotation
		rows.Scan(&q.ID, &q.QuotationNumber, &q.UserID, &q.Status, &q.GrandTotal)
		quotations = append(quotations, q)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}
	writeJSON(w, http.StatusOK, quotations)
}

func CreateQuotation(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req struct {
		RefNo string `json:"ref_no"`
		Notes string `json:"notes"`
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
		writeError(w, http.StatusBadRequest, "quotation must have at least one item")
		return
	}

	for _, item := range req.Items {
		if !database.ValidateUUID(item.ProductID) {
			writeError(w, http.StatusBadRequest, "invalid product_id format")
			return
		}
	}

	tx, err := database.DB.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback()

	var qID, qNumber string
	qNumber = fmt.Sprintf("QUO-%d", 1)
	err = tx.QueryRow(
		"INSERT INTO quotations (quotation_number, user_id, ref_no, date, status, grand_total) VALUES ($1,$2,$3,CURRENT_DATE,'draft',0) RETURNING id, quotation_number",
		qNumber, userID, req.RefNo,
	).Scan(&qID, &qNumber)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create")
		return
	}

	var total float64
	for _, item := range req.Items {
		if item.Quantity <= 0 || item.Quantity > 10000 {
			continue
		}
		var pName string
		var pPrice float64
		err := tx.QueryRow("SELECT name, selling_price FROM products WHERE id=$1 AND deleted_at IS NULL", item.ProductID).Scan(&pName, &pPrice)
		if err != nil {
			continue
		}
		amount := pPrice * float64(item.Quantity)
		total += amount
		tx.Exec(
			"INSERT INTO quotation_items (quotation_id, product_id, product_name, quantity, unit_price, amount) VALUES ($1,$2,$3,$4,$5,$6)",
			qID, item.ProductID, pName, item.Quantity, pPrice, amount,
		)
	}
	tx.Exec("UPDATE quotations SET grand_total=$1 WHERE id=$2", total, qID)
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	database.AuditLog(userID, "create_quotation", "quotations", qID, nil, nil)

	writeJSON(w, http.StatusCreated, models.Quotation{ID: qID, QuotationNumber: qNumber, UserID: userID, Status: "draft", GrandTotal: total})
}
