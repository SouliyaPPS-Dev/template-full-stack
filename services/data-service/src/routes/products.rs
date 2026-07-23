use axum::{Json, http::StatusCode};
use serde_json::{json, Value};
use uuid::Uuid;
use chrono::Utc;

use crate::models::{Product, CreateProduct};

pub async fn list() -> Json<Value> {
    let products: Vec<Product> = vec![];
    Json(json!({ "data": products, "total": products.len() }))
}

pub async fn get(
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Value>, StatusCode> {
    Err(StatusCode::NOT_FOUND)
}

pub async fn create(
    Json(input): Json<CreateProduct>,
) -> (StatusCode, Json<Value>) {
    let product = Product {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        category_id: input.category_id,
        selling_price: input.selling_price,
        cost_price: input.cost_price.unwrap_or(0.0),
        stock: input.stock.unwrap_or(0),
        is_active: true,
        created_at: Utc::now(),
    };
    (StatusCode::CREATED, Json(json!(product)))
}

pub async fn update(
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(input): Json<CreateProduct>,
) -> Json<Value> {
    Json(json!({ "id": id, "name": input.name }))
}

pub async fn delete(
    axum::extract::Path(id): axum::extract::Path<String>,
) -> StatusCode {
    StatusCode::NO_CONTENT
}
