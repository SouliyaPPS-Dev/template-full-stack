package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/models"
)

func ListCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, slug, COALESCE(image_url,''), is_active FROM categories ORDER BY sort_order")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	categories := []models.Category{}
	for rows.Next() {
		var c models.Category
		rows.Scan(&c.ID, &c.Name, &c.Slug, &c.ImageURL, &c.IsActive)
		categories = append(categories, c)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, categories)
}

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	c.Name = sanitizeString(c.Name)
	c.Slug = sanitizeString(c.Slug)

	if c.Name == "" || c.Slug == "" {
		writeError(w, http.StatusBadRequest, "name and slug are required")
		return
	}

	var catID string
	err := database.DB.QueryRow(
		"INSERT INTO categories (name, slug, image_url, is_active) VALUES ($1,$2,$3,$4) RETURNING id",
		c.Name, c.Slug, c.ImageURL, c.IsActive,
	).Scan(&catID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create")
		return
	}

	database.AuditLog("", "create_category", "categories", catID, nil, c)

	c.ID = catID
	writeJSON(w, http.StatusCreated, c)
}

func GetCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid category id")
		return
	}

	var c models.Category
	err := database.DB.QueryRow(
		"SELECT id, name, slug, COALESCE(image_url,''), is_active FROM categories WHERE id=$1", id,
	).Scan(&c.ID, &c.Name, &c.Slug, &c.ImageURL, &c.IsActive)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func UpdateCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid category id")
		return
	}

	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	c.Name = sanitizeString(c.Name)
	c.Slug = sanitizeString(c.Slug)

	_, err := database.DB.Exec(
		"UPDATE categories SET name=$1, slug=$2, image_url=$3, is_active=$4, updated_at=NOW() WHERE id=$5",
		c.Name, c.Slug, c.ImageURL, c.IsActive, id,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update")
		return
	}

	database.AuditLog("", "update_category", "categories", id, nil, c)

	c.ID = id
	writeJSON(w, http.StatusOK, c)
}

func DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if !database.ValidateUUID(id) {
		writeError(w, http.StatusBadRequest, "invalid category id")
		return
	}

	var productCount int
	database.DB.QueryRow("SELECT COUNT(*) FROM products WHERE category_id=$1 AND deleted_at IS NULL", id).Scan(&productCount)
	if productCount > 0 {
		writeError(w, http.StatusConflict, "cannot delete category with associated products")
		return
	}

	_, err := database.DB.Exec("DELETE FROM categories WHERE id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}

	database.AuditLog("", "delete_category", "categories", id, nil, nil)

	writeJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}
