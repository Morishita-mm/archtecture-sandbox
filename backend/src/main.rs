mod models;
mod gemini;

use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Json, Router,
};
use models::{ArchitectureDiagram, ChatRequest}; // 必要な型をインポート
use tower_http::cors::{Any, CorsLayer};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;
use std::time::Duration;

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://user:password@db:5432/arch_db".to_string());

    println!("Connecting to database...");
    
    // 接続プールの作成 (最大5接続、タイムアウト3秒)
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    println!("Database connected successfully!");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    // .with_state(pool) でDBプールを全ハンドラに共有します
    let app = Router::new()
        .route("/", get(|| async { "Hello, Architecture!" }))
        .route("/api/evaluate", post(evaluate_architecture))
        .route("/api/chat", post(handle_chat))
        // TODO: /api/projects などの保存用ルートを追加します ▼
        .layer(cors)
        .with_state(pool); 

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Backend listening on 0.0.0.0:8080");
    axum::serve(listener, app).await.unwrap();
}

// --- ハンドラ関数 ---
async fn evaluate_architecture(
    Json(payload): Json<serde_json::Value>,
) -> Json<serde_json::Value> {
    println!("Evaluating with Gemini...");
    match gemini::evaluate_with_gemini(&payload).await {
        Ok(ai_response_text) => {
            let clean_text = ai_response_text
                .replace("```json", "")
                .replace("```", "")
                .trim()
                .to_string();
            match serde_json::from_str::<serde_json::Value>(&clean_text) {
                Ok(json) => Json(json),
                Err(_) => Json(serde_json::json!({
                    "score": 0, "feedback": clean_text, "status": "partial_success"
                }))
            }
        }
        Err(e) => {
            eprintln!("Gemini Error: {}", e);
            Json(serde_json::json!({ "score": 0, "feedback": "Error", "status": "error" }))
        }
    }
}

async fn handle_chat(
    Json(payload): Json<ChatRequest>,
) -> Json<serde_json::Value> {
    println!("Chat request for scenario: {}", payload.scenario_id);
    match gemini::chat_with_customer(&payload).await {
        Ok(reply) => Json(serde_json::json!({ "reply": reply, "status": "success" })),
        Err(e) => {
            eprintln!("Chat Error: {}", e);
            Json(serde_json::json!({ "reply": "Error", "status": "error" }))
        }
    }
}