package handlers

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/myorg/api-gateway/internal/database"
)

func findPgDump() string {
	if path, err := exec.LookPath("pg_dump"); err == nil {
		return path
	}
	candidates := []string{
		"/opt/homebrew/opt/postgresql@17/bin/pg_dump",
		"/opt/homebrew/opt/postgresql@18/bin/pg_dump",
		"/opt/homebrew/Cellar/postgresql@17/17.9/bin/pg_dump",
		"/opt/homebrew/Cellar/postgresql@18/18.4/bin/pg_dump",
		"/usr/local/opt/postgresql@17/bin/pg_dump",
		"/usr/local/bin/pg_dump",
		"/usr/bin/pg_dump",
		"/Library/PostgreSQL/17/bin/pg_dump",
		"/Library/PostgreSQL/16/bin/pg_dump",
		"/Library/PostgreSQL/15/bin/pg_dump",
	}
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}
	return ""
}

func findPsql() string {
	if path, err := exec.LookPath("psql"); err == nil {
		return path
	}
	candidates := []string{
		"/opt/homebrew/opt/postgresql@17/bin/psql",
		"/opt/homebrew/opt/postgresql@18/bin/psql",
		"/opt/homebrew/Cellar/postgresql@17/17.9/bin/psql",
		"/opt/homebrew/Cellar/postgresql@18/18.4/bin/psql",
		"/usr/local/opt/postgresql@17/bin/psql",
		"/usr/local/bin/psql",
		"/usr/bin/psql",
		"/Library/PostgreSQL/17/bin/psql",
		"/Library/PostgreSQL/16/bin/psql",
		"/Library/PostgreSQL/15/bin/psql",
	}
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}
	return ""
}

func BackupDatabase(w http.ResponseWriter, r *http.Request) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		writeError(w, http.StatusInternalServerError, "DATABASE_URL not configured")
		return
	}

	pgDump := findPgDump()
	if pgDump == "" {
		backupViaGo(w, dsn)
		return
	}

	cmd := exec.Command(pgDump, "--no-owner", "--no-privileges", "--clean", "--if-exists", dsn)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create backup pipeline")
		return
	}

	if err := cmd.Start(); err != nil {
		writeError(w, http.StatusInternalServerError, "pg_dump failed: "+err.Error())
		return
	}

	filename := fmt.Sprintf("backup_%s.sql", time.Now().Format("2006-01-02_150405"))
	w.Header().Set("Content-Type", "application/sql")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	io.Copy(w, stdout)
	cmd.Wait()
}

func backupViaGo(w http.ResponseWriter, dsn string) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to connect for backup: "+err.Error())
		return
	}
	defer db.Close()

	filename := fmt.Sprintf("backup_%s.sql", time.Now().Format("2006-01-02_150405"))
	w.Header().Set("Content-Type", "application/sql")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	fmt.Fprintln(w, "-- GoBackup SQL dump")
	fmt.Fprintf(w, "-- Generated: %s\n\n", time.Now().Format(time.RFC3339))
	fmt.Fprintln(w, "SET statement_timeout = 0;")
	fmt.Fprintln(w, "SET lock_timeout = 0;")
	fmt.Fprintln(w, "SET client_encoding = 'UTF8';")
	fmt.Fprintln(w, "SET standard_conforming_strings = on;")
	fmt.Fprintln(w, "")

	tables := []string{
		"system_settings", "users", "categories", "products",
		"orders", "order_items", "cart_items",
		"quotations", "quotation_items", "quotation_history",
		"expenses", "expense_categories",
		"favorites", "notifications", "audit_logs",
		"inquiries", "inquiry_messages", "banners", "promotions",
		"user_roles", "user_sessions", "product_images",
	}

	for _, table := range tables {
		var exists bool
		db.QueryRow(`SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_schema = 'public' AND table_name = $1
		)`, table).Scan(&exists)
		if !exists {
			continue
		}

		fmt.Fprintf(w, "TRUNCATE TABLE %s CASCADE;\n", table)

		rows, err := db.Query(fmt.Sprintf("SELECT * FROM %s", table))
		if err != nil {
			continue
		}

		columns, _ := rows.Columns()
		types, _ := rows.ColumnTypes()

		for rows.Next() {
			values := make([]interface{}, len(columns))
			valuePtrs := make([]interface{}, len(columns))
			for i := range values {
				valuePtrs[i] = &values[i]
			}
			if err := rows.Scan(valuePtrs...); err != nil {
				continue
			}

			colList := strings.Join(columns, ", ")
			placeholders := make([]string, len(columns))
			vals := make([]string, len(columns))

			for i, val := range values {
				if val == nil {
					vals[i] = "NULL"
				} else {
					switch v := val.(type) {
					case []byte:
						vals[i] = escapeSQL(string(v))
					case string:
						vals[i] = escapeSQL(v)
					case bool:
						if v {
							vals[i] = "TRUE"
						} else {
							vals[i] = "FALSE"
						}
					case time.Time:
						vals[i] = fmt.Sprintf("'%s'", v.Format("2006-01-02 15:04:05-07:00"))
					default:
						vals[i] = fmt.Sprintf("%v", v)
					}
				}
				placeholders[i] = "$$" + vals[i] + "$$"
			}

			_ = types
			fmt.Fprintf(w, "INSERT INTO %s (%s) VALUES (%s);\n",
				table, colList, strings.Join(placeholders, ", "))
		}
		rows.Close()
		fmt.Fprintln(w)
	}

	fmt.Fprintln(w, "-- End of backup")
}

func escapeSQL(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "'", "''")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}

func ExportDatabase(w http.ResponseWriter, r *http.Request) {
	filename := fmt.Sprintf("export_%s.sql", time.Now().Format("2006-01-02_150405"))
	w.Header().Set("Content-Type", "application/sql")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	fmt.Fprintln(w, "-- SQL Export")
	fmt.Fprintf(w, "-- Generated: %s\n\n", time.Now().Format(time.RFC3339))
	fmt.Fprintln(w, "SET statement_timeout = 0;")
	fmt.Fprintln(w, "SET lock_timeout = 0;")
	fmt.Fprintln(w, "SET client_encoding = 'UTF8';")
	fmt.Fprintln(w, "SET standard_conforming_strings = on;")
	fmt.Fprintln(w, "")

	tables := []string{
		"system_settings", "users", "categories", "products",
		"orders", "order_items", "cart_items",
		"quotations", "quotation_items", "quotation_history",
		"expenses", "expense_categories",
		"favorites", "notifications", "audit_logs",
		"inquiries", "inquiry_messages", "banners", "promotions",
		"user_roles", "user_sessions", "product_images",
	}

	for _, table := range tables {
		var exists bool
		database.DB.QueryRow(`SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_schema = 'public' AND table_name = $1
		)`, table).Scan(&exists)
		if !exists {
			continue
		}

		rows, err := database.DB.Query(fmt.Sprintf("SELECT * FROM %s", table))
		if err != nil {
			continue
		}
		defer rows.Close()

		columns, _ := rows.Columns()
		colList := strings.Join(columns, ", ")

		fmt.Fprintf(w, "-- Table: %s\n", table)

		for rows.Next() {
			values := make([]interface{}, len(columns))
			valuePtrs := make([]interface{}, len(columns))
			for i := range values {
				valuePtrs[i] = &values[i]
			}
			if err := rows.Scan(valuePtrs...); err != nil {
				continue
			}

			placeholders := make([]string, len(columns))
			for i, val := range values {
				if val == nil {
					placeholders[i] = "NULL"
					continue
				}
				switch v := val.(type) {
				case []byte:
					placeholders[i] = fmt.Sprintf("'%s'", escapeSQL(string(v)))
				case string:
					placeholders[i] = fmt.Sprintf("'%s'", escapeSQL(v))
				case bool:
					if v {
						placeholders[i] = "TRUE"
					} else {
						placeholders[i] = "FALSE"
					}
				case time.Time:
					placeholders[i] = fmt.Sprintf("'%s'", v.Format("2006-01-02 15:04:05-07:00"))
				default:
					placeholders[i] = fmt.Sprintf("%v", v)
				}
			}

			fmt.Fprintf(w, "INSERT INTO %s (%s) VALUES (%s) ON CONFLICT DO NOTHING;\n",
				table, colList, strings.Join(placeholders, ", "))
		}
		fmt.Fprintln(w)
	}

	fmt.Fprintln(w, "-- End of export")
}

func ImportDatabase(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "failed to parse upload")
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "no file provided")
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to read file")
		return
	}

	sqlContent := string(content)
	statements := splitSQL(sqlContent)

	var executed, failed int
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		if _, err := database.DB.Exec(stmt); err != nil {
			failed++
			continue
		}
		executed++
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message":  "Import completed",
		"executed": executed,
		"failed":   failed,
	})
}

func splitSQL(sql string) []string {
	var statements []string
	var current strings.Builder
	lines := strings.Split(sql, "\n")

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "--") || trimmed == "" {
			continue
		}
		current.WriteString(line)
		current.WriteString("\n")
		if strings.HasSuffix(trimmed, ";") {
			statements = append(statements, current.String())
			current.Reset()
		}
	}
	if current.Len() > 0 {
		statements = append(statements, current.String())
	}
	return statements
}
