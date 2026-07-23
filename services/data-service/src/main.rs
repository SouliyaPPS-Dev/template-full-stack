use axum::{
    Router,
    routing::{get, post},
};
use tower_http::cors::{Any, CorsLayer};

mod handlers;
mod models;
mod routes;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(handlers::health))
        .route("/api/v1/products", get(routes::products::list).post(routes::products::create))
        .route("/api/v1/products/{id}", get(routes::products::get).put(routes::products::update).delete(routes::products::delete))
        .route("/api/v1/orders", get(routes::orders::list).post(routes::orders::create))
        .route("/api/v1/analytics/summary", get(routes::analytics::summary))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3002")
        .await
        .unwrap();

    println!("Data service running on :3002");
    axum::serve(listener, app).await.unwrap();
}
