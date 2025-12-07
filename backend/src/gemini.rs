use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;

// --- Gemini APIのリクエスト形式 (構造体定義) ---
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
}

#[derive(Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize)]
struct Part {
    text: String,
}

// --- Gemini APIのレスポンス形式 (構造体定義) ---
#[derive(Deserialize, Debug)]
struct GeminiResponse {
    candidates: Option<Vec<Candidate>>,
}

#[derive(Deserialize, Debug)]
struct Candidate {
    content: Option<CandidateContent>,
}

#[derive(Deserialize, Debug)]
struct CandidateContent {
    parts: Option<Vec<PartResponse>>,
}

#[derive(Deserialize, Debug)]
struct PartResponse {
    text: String,
}

// --- 評価関数 ---
pub async fn evaluate_with_gemini(json_data: &Value) -> Result<String, Box<dyn std::error::Error>> {
    // APIキーの取得
    // コンテナ内の環境変数 GEMINI_API_KEY を読み込みます
    let api_key = env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    // プロンプトの作成
let yaml_prompt_template = r#"
system_context:
  role: "Senior System Architect & Educator"
  objective: "Evaluate the user's system architecture diagram based on specific constraints."
  language: "Japanese"

# アプリケーションの制約（重要）
constraints:
  tool_limitations:
    - "This is a simple visual modeler."
    - "Users CANNOT configure internal settings (e.g., config files, instance types, replication modes, backup policies)."
    - "Users CAN only define TOPOLOGY (placement of nodes and connections)."
  
  # 現在のパレットにあるコンポーネントのみを定義
  available_components:
    - "Client (User)"
    - "Load Balancer (LB)"
    - "API Server"
    - "RDBMS (Postgres)"
    - "Cache (Redis)"
    # 将来拡張する場合はここに追加
  
  instruction:
    - "Do NOT suggest adding components that are NOT in the 'available_components' list (e.g., CDN, Message Queue, Lambda)."
    - "Do NOT criticize missing internal configurations (e.g., 'password is not set', 'backup is not enabled')."
    - "Assume standard/default configurations are applied internally."

# 評価ルール
evaluation_rules:
  scalability:
    - "Evaluate based on NODE REDUNDANCY."
    - "Single Server/DB node -> Risk of bottleneck. Suggest adding another node of the same type (Horizontal Scaling)."
    - "Presence of Load Balancer -> Good for scalability."
  
  availability:
    - "Identify Single Points of Failure (SPOF)."
    - "If only 1 DB node exists -> Low Availability. Suggest adding a standby DB node visually."
  
  consistency:
    - "If Cache is used, mention potential consistency lag (briefly)."
    - "If single DB, consistency is high (ACID)."

# 出力フォーマット
output_format:
  format: "JSON"
  schema:
    score: "Integer (0-100)"
    feedback: "String (Markdown. Use '###' for headers. Do NOT use '**text**' for headers. Keep it concise.)"
    improvement: "String (Markdown. Suggest visual changes: 'Add another API Server node', 'Place Cache between Server and DB'.)"

# ユーザー入力データ
user_design_data:
"#;

    // プロンプト結合
    let prompt = format!(
        "{}\n{}", 
        yaml_prompt_template, 
        json_data
    );

    let request_body = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: prompt }],
        }],
    };

    let client = Client::new();
    let res = client.post(&url)
        .json(&request_body)
        .send()
        .await?;

    // --- エラーハンドリングとデバッグ出力 ---

    // 1. ステータスコードチェック
    let status = res.status();
    if !status.is_success() {
        let error_body = res.text().await?;
        eprintln!("Gemini API Error! Status: {}", status);
        eprintln!("Error Body: {}", error_body);
        return Err(format!("Gemini API error: {}", status).into());
    }

    // 2. 生レスポンスの取得と表示
    let body_text = res.text().await?;
    println!("Gemini Raw Response Body: {}", body_text);

    // 3. パース
    let response_json: GeminiResponse = serde_json::from_str(&body_text)?;

    // テキスト抽出
    if let Some(candidates) = response_json.candidates {
        if let Some(first) = candidates.first() {
            if let Some(content) = &first.content {
                if let Some(parts) = &content.parts {
                    if let Some(part) = parts.first() {
                        return Ok(part.text.clone());
                    }
                }
            }
        }
    }

    Err("Failed to parse Gemini response: No candidates found".into())
}