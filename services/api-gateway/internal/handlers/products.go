package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/models"
)

func ListProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, slug, COALESCE(sku,''), COALESCE(category_id::text,''), selling_price, cost_price, stock, COALESCE(images,'[]')::text, is_active FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		var imagesJSON string
		rows.Scan(&p.ID, &p.Name, &p.Slug, &p.SKU, &p.CategoryID, &p.SellingPrice, &p.CostPrice, &p.Stock, &imagesJSON, &p.IsActive)
		json.Unmarshal([]byte(imagesJSON), &p.Images)
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, products)
}

func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	p.Name = sanitizeString(p.Name)
	p.Slug = sanitizeString(p.Slug)
	p.SKU = sanitizeString(p.SKU)

	if p.Name == "" || p.Slug == "" {
		writeError(w, http.StatusBadRequest, "name and slug are required")
		return
	}
	if p.SellingPrice < 0 {
		writeError(w, http.StatusBadRequest, "selling_price must be non-negative")
		return
	}
	if p.Stock < 0 {
		writeError(w, http.StatusBadRequest, "stock must be non-negative")
		return
	}

	imagesJSON, _ := json.Marshal(p.Images)
	var catID interface{}
	if p.CategoryID != "" {
		catID = p.CategoryID
	}
	var productID string
	err := database.DB.QueryRow(
		"INSERT INTO products (name, slug, sku, category_id, selling_price, cost_price, stock, images, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
		p.Name, p.Slug, p.SKU, catID, p.SellingPrice, p.CostPrice, p.Stock, string(imagesJSON), p.IsActive,
	).Scan(&productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create product")
		return
	}

	database.AuditLog("", "create_product", "products", productID, nil, p)

	p.ID = productID
	writeJSON(w, http.StatusCreated, p)
}

func GetProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	var p models.Product
	var imagesJSON string
	err := database.DB.QueryRow(
		"SELECT id, name, slug, COALESCE(sku,''), COALESCE(category_id::text,''), selling_price, cost_price, stock, COALESCE(images,'[]')::text, is_active FROM products WHERE id=$1 AND deleted_at IS NULL", id,
	).Scan(&p.ID, &p.Name, &p.Slug, &p.SKU, &p.CategoryID, &p.SellingPrice, &p.CostPrice, &p.Stock, &imagesJSON, &p.IsActive)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	json.Unmarshal([]byte(imagesJSON), &p.Images)
	writeJSON(w, http.StatusOK, p)
}

func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	p.Name = sanitizeString(p.Name)
	p.Slug = sanitizeString(p.Slug)
	p.SKU = sanitizeString(p.SKU)

	imagesJSON, _ := json.Marshal(p.Images)
	var catID interface{}
	if p.CategoryID != "" {
		catID = p.CategoryID
	}
	_, err := database.DB.Exec(
		"UPDATE products SET name=$1, slug=$2, sku=$3, category_id=$4, selling_price=$5, cost_price=$6, stock=$7, images=$8, is_active=$9, updated_at=NOW() WHERE id=$10 AND deleted_at IS NULL",
		p.Name, p.Slug, p.SKU, catID, p.SellingPrice, p.CostPrice, p.Stock, string(imagesJSON), p.IsActive, id,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update")
		return
	}

	database.AuditLog("", "update_product", "products", id, nil, p)

	p.ID = id
	writeJSON(w, http.StatusOK, p)
}

func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	_, err := database.DB.Exec("UPDATE products SET deleted_at=NOW() WHERE id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}

	database.AuditLog("", "delete_product", "products", id, nil, nil)

	writeJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}
