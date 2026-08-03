package models

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

type Quotation struct {
	ID              string  `json:"id"`
	QuotationNumber string  `json:"quotation_number"`
	UserID          string  `json:"user_id"`
	Status          string  `json:"status"`
	GrandTotal      float64 `json:"grand_total"`
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

type QuotationDetail struct {
	Quotation
	Items []QuotationItem `json:"items"`
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

type SettingItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type SettingsUpdateRequest struct {
	Settings []SettingItem `json:"settings"`
}
