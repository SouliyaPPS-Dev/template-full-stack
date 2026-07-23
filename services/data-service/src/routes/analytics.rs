use axum::Json;
use serde_json::{json, Value};

pub async fn summary() -> Json<Value> {
    Json(json!({
        "total_revenue": 0,
        "total_orders": 0,
        "total_products": 0,
        "total_customers": 0,
    }))
}
