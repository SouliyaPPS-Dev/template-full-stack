use axum::{Json, http::StatusCode};
use serde_json::{json, Value};
use uuid::Uuid;
use chrono::Utc;

use crate::models::{Order, CreateOrder};

pub async fn list() -> Json<Value> {
    let orders: Vec<Order> = vec![];
    Json(json!({ "data": orders, "total": orders.len() }))
}

pub async fn create(
    Json(input): Json<CreateOrder>,
) -> (StatusCode, Json<Value>) {
    let order = Order {
        id: Uuid::new_v4().to_string(),
        order_number: format!("ORD-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
        user_id: input.user_id,
        status: "pending".to_string(),
        payment_status: "unpaid".to_string(),
        grand_total: 0.0,
        created_at: Utc::now(),
    };
    (StatusCode::CREATED, Json(json!(order)))
}
