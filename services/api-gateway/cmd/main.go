package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB
var jwtSecret []byte

func init() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		b := make([]byte, 32)
		if _, err := rand.Read(b); err != nil {
			log.Fatal("Failed to generate JWT secret:", err)
		}
		secret = hex.EncodeToString(b)
		log.Println("WARNING: No JWT_SECRET set. Using random secret (tokens won't survive restart).")
	}
	jwtSecret = []byte(secret)
}

// ── Rate Limiter ───────────────────────────────────────────────
type rateLimiter struct {
	mu       sync.Mutex
	clients  map[string][]time.Time
	limit    int
	window   time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		clients: make(map[string][]time.Time),
		limit:   limit,
		window:  window,
	}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	timestamps := rl.clients[key]
	valid := make([]time.Time, 0, len(timestamps))
	for _, t := range timestamps {
		if t.After(windowStart) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rl.limit {
		rl.clients[key] = valid
		return false
	}

	rl.clients[key] = append(valid, now)
	return true
}

var loginLimiter = newRateLimiter(10, time.Minute)
var registerLimiter = newRateLimiter(5, time.Minute)

func rateLimitMiddleware(limiter *rateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
				ip = strings.Split(fwd, ",")[0]
			}
			if !limiter.allow(strings.TrimSpace(ip)) {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "60")
				http.Error(w, `{"error":"rate limit exceeded, try again later"}`, http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// ── Models ─────────────────────────────────────────────────────
type User struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	FullName      string `json:"full_name"`
	Phone         string `json:"phone"`
	Role          string `json:"role"`
	EmailVerified bool   `json:"email_verified"`
	IsActive      bool   `json:"is_active"`
	CreatedAt     string `json:"created_at"`
}

type AuthResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	User        User   `json:"user"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Product struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Slug         string   `json:"slug"`
	SKU          string   `json:"sku"`
	CategoryID   string   `json:"category_id"`
	SellingPrice float64  `json:"selling_price"`
	CostPrice    float64  `json:"cost_price"`
	Stock        int      `json:"stock"`
	Images       []string `json:"images"`
	IsActive     bool     `json:"is_active"`
}

type Order struct {
	ID            string  `json:"id"`
	OrderNumber   string  `json:"order_number"`
	UserID        string  `json:"user_id"`
	Status        string  `json:"status"`
	PaymentStatus string  `json:"payment_status"`
	GrandTotal    float64 `json:"grand_total"`
	CreatedAt     string  `json:"created_at"`
}

type Quotation struct {
	ID              string  `json:"id"`
	QuotationNumber string  `json:"quotation_number"`
	UserID          string  `json:"user_id"`
	Status          string  `json:"status"`
	GrandTotal      float64 `json:"grand_total"`
}

type Category struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ImageURL string `json:"image_url"`
	IsActive bool   `json:"is_active"`
}

type Setting struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

type OrderItem struct {
	ID          string  `json:"id"`
	OrderID     string  `json:"order_id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Subtotal    float64 `json:"subtotal"`
}

type OrderDetail struct {
	Order
	Items []OrderItem `json:"items"`
}

type QuotationDetail struct {
	Quotation
	Items []QuotationItem `json:"items"`
}

type QuotationItem struct {
	ID          string  `json:"id"`
	QuotationID string  `json:"quotation_id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	Unit        string  `json:"unit"`
	UnitPrice   float64 `json:"unit_price"`
	Amount      float64 `json:"amount"`
}

// ── Validation helpers ─────────────────────────────────────────
func validateEmail(email string) bool {
	if len(email) < 5 || len(email) > 255 {
		return false
	}
	at := strings.LastIndex(email, "@")
	if at < 1 || at == len(email)-1 {
		return false
	}
	dot := strings.LastIndex(email[at:], ".")
	return dot > 1
}

func validatePassword(pw string) bool {
	return len(pw) >= 8 && len(pw) <= 128
}

func sanitizeString(s string) string {
	s = strings.TrimSpace(s)
	if len(s) > 500 {
		s = s[:500]
	}
	return s
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

// ── Database ───────────────────────────────────────────────────
func initDB() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://app_user:app_pass@localhost:5432/app_main?sslmode=disable"
	}
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	log.Println("Connected to PostgreSQL")
}

// ── JWT ────────────────────────────────────────────────────────
func generateJWT(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func validateJWT(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

// ── Middleware ──────────────────────────────────────────────────
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		claims, err := validateJWT(parts[1])
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		r.Header.Set("X-User-ID", fmt.Sprintf("%v", claims["sub"]))
		r.Header.Set("X-User-Role", fmt.Sprintf("%v", claims["role"]))
		next.ServeHTTP(w, r)
	})
}

func adminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role := r.Header.Get("X-User-Role")
		if role != "admin" && role != "superadmin" {
			writeError(w, http.StatusForbidden, "admin access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func bodySizeLimit(next http.Handler) http.Handler {
	return http.MaxBytesHandler(next, 1<<20) // 1MB
}

// ── Auth Handlers ──────────────────────────────────────────────
func registerHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
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
	db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", req.Email).Scan(&exists)
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
	err = db.QueryRow(
		"INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES ($1, $2, $3, $4, 'user', true) RETURNING id",
		req.Email, string(hashedPassword), req.FullName, req.Phone,
	).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	token, err := generateJWT(userID, "user")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	writeJSON(w, http.StatusCreated, AuthResponse{
		AccessToken: token,
		TokenType:   "bearer",
		User: User{
			ID:       userID,
			Email:    req.Email,
			FullName: req.FullName,
			Role:     "user",
			IsActive: true,
		},
	})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if !validateEmail(req.Email) || req.Password == "" {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	var user User
	var passwordHash string
	err := db.QueryRow(
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

	token, err := generateJWT(user.ID, user.Role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	writeJSON(w, http.StatusOK, AuthResponse{
		AccessToken: token,
		TokenType:   "bearer",
		User:        user,
	})
}

func meHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")

	var user User
	err := db.QueryRow(
		"SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users WHERE id=$1",
		userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func updateMeHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")

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

	var user User
	err := db.QueryRow(
		"UPDATE users SET full_name=$1, phone=$2, updated_at=NOW() WHERE id=$3 RETURNING id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at",
		req.FullName, req.Phone, userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.Role, &user.EmailVerified, &user.IsActive, &user.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// ── Product Handlers ───────────────────────────────────────────
func listProductsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, slug, COALESCE(sku,''), COALESCE(category_id::text,''), selling_price, cost_price, stock, COALESCE(images,'[]')::text, is_active FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	products := []Product{}
	for rows.Next() {
		var p Product
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

func createProductHandler(w http.ResponseWriter, r *http.Request) {
	var p Product
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
	err := db.QueryRow(
		"INSERT INTO products (name, slug, sku, category_id, selling_price, cost_price, stock, images, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
		p.Name, p.Slug, p.SKU, catID, p.SellingPrice, p.CostPrice, p.Stock, string(imagesJSON), p.IsActive,
	).Scan(&productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create product")
		return
	}

	p.ID = productID
	writeJSON(w, http.StatusCreated, p)
}

func getProductHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var p Product
	var imagesJSON string
	err := db.QueryRow(
		"SELECT id, name, slug, COALESCE(sku,''), COALESCE(category_id::text,''), selling_price, cost_price, stock, COALESCE(images,'[]')::text, is_active FROM products WHERE id=$1 AND deleted_at IS NULL", id,
	).Scan(&p.ID, &p.Name, &p.Slug, &p.SKU, &p.CategoryID, &p.SellingPrice, &p.CostPrice, &p.Stock, &imagesJSON, &p.IsActive)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	json.Unmarshal([]byte(imagesJSON), &p.Images)
	writeJSON(w, http.StatusOK, p)
}

func updateProductHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var p Product
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
	_, err := db.Exec(
		"UPDATE products SET name=$1, slug=$2, sku=$3, category_id=$4, selling_price=$5, cost_price=$6, stock=$7, images=$8, is_active=$9, updated_at=NOW() WHERE id=$10 AND deleted_at IS NULL",
		p.Name, p.Slug, p.SKU, catID, p.SellingPrice, p.CostPrice, p.Stock, string(imagesJSON), p.IsActive, id,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update")
		return
	}
	p.ID = id
	writeJSON(w, http.StatusOK, p)
}

func deleteProductHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	_, err := db.Exec("UPDATE products SET deleted_at=NOW() WHERE id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}

// ── Category Handlers ──────────────────────────────────────────
func listCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, slug, COALESCE(image_url,''), is_active FROM categories ORDER BY sort_order")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	categories := []Category{}
	for rows.Next() {
		var c Category
		rows.Scan(&c.ID, &c.Name, &c.Slug, &c.ImageURL, &c.IsActive)
		categories = append(categories, c)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, categories)
}

func createCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var c Category
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
	err := db.QueryRow(
		"INSERT INTO categories (name, slug, image_url, is_active) VALUES ($1,$2,$3,$4) RETURNING id",
		c.Name, c.Slug, c.ImageURL, c.IsActive,
	).Scan(&catID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create")
		return
	}
	c.ID = catID
	writeJSON(w, http.StatusCreated, c)
}

func getCategoryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var c Category
	err := db.QueryRow(
		"SELECT id, name, slug, COALESCE(image_url,''), is_active FROM categories WHERE id=$1", id,
	).Scan(&c.ID, &c.Name, &c.Slug, &c.ImageURL, &c.IsActive)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func updateCategoryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var c Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	_, err := db.Exec(
		"UPDATE categories SET name=$1, slug=$2, image_url=$3, is_active=$4, updated_at=NOW() WHERE id=$5",
		c.Name, c.Slug, c.ImageURL, c.IsActive, id,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update")
		return
	}
	c.ID = id
	writeJSON(w, http.StatusOK, c)
}

func deleteCategoryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	_, err := db.Exec("DELETE FROM categories WHERE id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}

// ── Order Handlers ─────────────────────────────────────────────
func listOrdersHandler(w http.ResponseWriter, r *http.Request) {
	role := r.Header.Get("X-User-Role")
	userID := r.Header.Get("X-User-ID")

	var rows *sql.Rows
	var err error
	if role == "admin" || role == "superadmin" {
		rows, err = db.Query("SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders ORDER BY created_at DESC")
	} else {
		rows, err = db.Query("SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC", userID)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		var o Order
		rows.Scan(&o.ID, &o.OrderNumber, &o.UserID, &o.Status, &o.PaymentStatus, &o.GrandTotal, &o.CreatedAt)
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, orders)
}

func createOrderHandler(w http.ResponseWriter, r *http.Request) {
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

	// Always use the authenticated user ID — never accept from request body
	userID := r.Header.Get("X-User-ID")

	tx, err := db.Begin()
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
		err := tx.QueryRow("SELECT name, selling_price FROM products WHERE id=$1 AND deleted_at IS NULL", item.ProductID).Scan(&pName, &pPrice)
		if err != nil {
			continue
		}
		subtotal := pPrice * float64(item.Quantity)
		grandTotal += subtotal
		tx.Exec(
			"INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5,$6)",
			orderID, item.ProductID, pName, item.Quantity, pPrice, subtotal,
		)
	}

	tx.Exec("UPDATE orders SET grand_total=$1 WHERE id=$2", grandTotal, orderID)
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit order")
		return
	}

	writeJSON(w, http.StatusCreated, OrderDetail{
		Order: Order{ID: orderID, OrderNumber: orderNumber, UserID: userID, Status: "pending", PaymentStatus: "unpaid", GrandTotal: grandTotal},
	})
}

func getOrderHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	role := r.Header.Get("X-User-Role")
	userID := r.Header.Get("X-User-ID")

	var o Order
	err := db.QueryRow(
		"SELECT id, order_number, user_id, status, payment_status, grand_total, created_at FROM orders WHERE id=$1", id,
	).Scan(&o.ID, &o.OrderNumber, &o.UserID, &o.Status, &o.PaymentStatus, &o.GrandTotal, &o.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	// Non-admin users can only view their own orders
	if role != "admin" && role != "superadmin" && o.UserID != userID {
		writeError(w, http.StatusForbidden, "access denied")
		return
	}

	rows, err := db.Query("SELECT id, order_id, product_id, product_name, quantity, unit_price, subtotal FROM order_items WHERE order_id=$1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()
	items := []OrderItem{}
	for rows.Next() {
		var item OrderItem
		rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.ProductName, &item.Quantity, &item.UnitPrice, &item.Subtotal)
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, OrderDetail{Order: o, Items: items})
}

func updateOrderHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
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
		db.Exec("UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2", body.Status, id)
	}
	if body.PaymentStatus != "" {
		db.Exec("UPDATE orders SET payment_status=$1, updated_at=NOW() WHERE id=$2", body.PaymentStatus, id)
		if body.PaymentStatus == "paid" {
			db.Exec("UPDATE orders SET paid_at=NOW() WHERE id=$1", id)
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "updated"})
}

// ── User Handlers (admin) ─────────────────────────────────────
func listUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, email, full_name, COALESCE(phone,''), role, email_verified, is_active, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var u User
		rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.EmailVerified, &u.IsActive, &u.CreatedAt)
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}

	writeJSON(w, http.StatusOK, users)
}

// ── Quotation Handlers ────────────────────────────────────────
func listQuotationsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, quotation_number, COALESCE(user_id,''), status, grand_total FROM quotations ORDER BY created_at DESC")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()
	quotations := []Quotation{}
	for rows.Next() {
		var q Quotation
		rows.Scan(&q.ID, &q.QuotationNumber, &q.UserID, &q.Status, &q.GrandTotal)
		quotations = append(quotations, q)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "query error")
		return
	}
	writeJSON(w, http.StatusOK, quotations)
}

func createQuotationHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefNo string `json:"ref_no"`
		Notes string `json:"notes"`
		Items []struct {
			ProductID string  `json:"product_id"`
			Quantity  int     `json:"quantity"`
			UnitPrice float64 `json:"unit_price"`
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

	tx, err := db.Begin()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback()

	var qID, qNumber string
	qNumber = fmt.Sprintf("QUO-%d", time.Now().UnixMilli())
	err = tx.QueryRow(
		"INSERT INTO quotations (quotation_number, ref_no, date, status, grand_total) VALUES ($1,$2,CURRENT_DATE,'draft',0) RETURNING id, quotation_number",
		qNumber, req.RefNo,
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
		tx.QueryRow("SELECT name FROM products WHERE id=$1 AND deleted_at IS NULL", item.ProductID).Scan(&pName)
		amount := item.UnitPrice * float64(item.Quantity)
		total += amount
		tx.Exec(
			"INSERT INTO quotation_items (quotation_id, product_id, product_name, quantity, unit_price, amount) VALUES ($1,$2,$3,$4,$5,$6)",
			qID, item.ProductID, pName, item.Quantity, item.UnitPrice, amount,
		)
	}
	tx.Exec("UPDATE quotations SET grand_total=$1 WHERE id=$2", total, qID)
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	writeJSON(w, http.StatusCreated, Quotation{ID: qID, QuotationNumber: qNumber, Status: "draft", GrandTotal: total})
}

// ── Dashboard ──────────────────────────────────────────────────
func dashboardStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{}

	var productCount, orderCount, userCount, categoryCount int
	db.QueryRow("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").Scan(&productCount)
	db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&orderCount)
	db.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&categoryCount)

	var totalRevenue float64
	db.QueryRow("SELECT COALESCE(SUM(grand_total),0) FROM orders WHERE payment_status='paid'").Scan(&totalRevenue)

	var pendingOrders int
	db.QueryRow("SELECT COUNT(*) FROM orders WHERE status='pending'").Scan(&pendingOrders)

	stats["total_products"] = productCount
	stats["total_orders"] = orderCount
	stats["total_users"] = userCount
	stats["total_categories"] = categoryCount
	stats["total_revenue"] = totalRevenue
	stats["pending_orders"] = pendingOrders

	writeJSON(w, http.StatusOK, stats)
}

func getSettingsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT setting_key, setting_value::text FROM system_settings")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	settings := []Setting{}
	for rows.Next() {
		var s Setting
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

// ── Main ───────────────────────────────────────────────────────
func main() {
	initDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "api-gateway"})
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Auth — rate limited
		r.Group(func(r chi.Router) {
			r.Use(rateLimitMiddleware(loginLimiter))
			r.Post("/auth/register", registerHandler)
			r.Post("/auth/login", loginHandler)
		})

		// Public read-only
		r.Get("/settings", getSettingsHandler)
		r.Get("/products", listProductsHandler)
		r.Get("/categories", listCategoriesHandler)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware)
			r.Use(bodySizeLimit)
			r.Get("/auth/me", meHandler)
			r.Put("/auth/me", updateMeHandler)

			r.With(adminOnly).Post("/products", createProductHandler)
			r.Get("/products/{id}", getProductHandler)
			r.With(adminOnly).Put("/products/{id}", updateProductHandler)
			r.With(adminOnly).Delete("/products/{id}", deleteProductHandler)

			r.With(adminOnly).Post("/categories", createCategoryHandler)
			r.Get("/categories/{id}", getCategoryHandler)
			r.With(adminOnly).Put("/categories/{id}", updateCategoryHandler)
			r.With(adminOnly).Delete("/categories/{id}", deleteCategoryHandler)

			r.Get("/orders", listOrdersHandler)
			r.Post("/orders", createOrderHandler)
			r.Get("/orders/{id}", getOrderHandler)
			r.With(adminOnly).Put("/orders/{id}", updateOrderHandler)

			r.With(adminOnly).Get("/users", listUsersHandler)

			r.Get("/quotations", listQuotationsHandler)
			r.Post("/quotations", createQuotationHandler)

			r.With(adminOnly).Get("/dashboard/stats", dashboardStatsHandler)
		})
	})

	log.Printf("API Gateway running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
