use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub sku: Option<String>,
    pub category_id: Option<String>,
    pub selling_price: f64,
    pub cost_price: f64,
    pub stock: i32,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProduct {
    pub name: String,
    pub slug: String,
    pub sku: Option<String>,
    pub category_id: Option<String>,
    pub selling_price: f64,
    pub cost_price: Option<f64>,
    pub stock: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Order {
    pub id: String,
    pub order_number: String,
    pub user_id: String,
    pub status: String,
    pub payment_status: String,
    pub grand_total: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrder {
    pub user_id: String,
    pub items: Vec<OrderItem>,
}

#[derive(Debug, Deserialize)]
pub struct OrderItem {
    pub product_id: String,
    pub quantity: i32,
    pub unit_price: f64,
}
