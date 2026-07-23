use axum::{
    Router,
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::get,
};
use tower_http::cors::{AllowOrigin, Any, CorsLayer};

mod handlers;
mod models;
mod routes;

#[derive(Clone)]
struct AppState {}

async fn auth_middleware(
    State(_state): State<AppState>,
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let path = request.uri().path();

    let public_paths = ["/health", "/api/v1/products", "/api/v1/analytics/summary"];
    let is_public = public_paths.iter().any(|p| path.starts_with(p));
    let is_get = *request.method() == axum::http::Method::GET;

    if is_public && is_get {
        return Ok(next.run(request).await);
    }

    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token = &auth_header[7..];
    if token.is_empty() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(next.run(request).await)
}

#[tokio::main]
async fn main() {
    let allowed_origins = std::env::var("CORS_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:3000".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .collect::<Vec<_>>();

    let cors = CorsLayer::new()
        .allow_origin(
            allowed_origins
                .into_iter()
                .map(|o| o.parse().unwrap_or(AllowOrigin::default()))
                .collect::<Vec<_>>(),
        )
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
        ])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ACCEPT,
        ]);

    let state = AppState {};

    let app = Router::new()
        .route("/health", get(handlers::health))
        .route("/api/v1/products", get(routes::products::list).post(routes::products::create))
        .route(
            "/api/v1/products/{id}",
            get(routes::products::get)
                .put(routes::products::update)
                .delete(routes::products::delete),
        )
        .route("/api/v1/orders", get(routes::orders::list).post(routes::orders::create))
        .route("/api/v1/analytics/summary", get(routes::analytics::summary))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3002".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .unwrap();

    println!("Data service running on :{}", port);
    axum::serve(listener, app).await.unwrap();
}
