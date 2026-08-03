package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/models"
)

var allowedSettings = map[string]bool{
	"store_name":  true,
	"store_phone": true,
	"currency":    true,
	"tax_percent": true,
	"store_logo":  true,
}

func UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req models.SettingsUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Settings) == 0 {
		writeError(w, http.StatusBadRequest, "settings required")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "transaction failed")
		return
	}
	defer tx.Rollback()

	for _, item := range req.Settings {
		if !allowedSettings[item.Key] {
			continue
		}
		value := strings.TrimSpace(item.Value)
		if len(value) > 1_000_000 {
			writeError(w, http.StatusBadRequest, "setting value is too large")
			return
		}
		encoded, err := json.Marshal(value)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "encode failed")
			return
		}
		_, err = tx.Exec(
			`INSERT INTO system_settings (setting_key, setting_value, description)
			 VALUES ($1, $2::jsonb, '')
			 ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
			item.Key, string(encoded),
		)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "update failed")
			return
		}
	}
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "commit failed")
		return
	}

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
