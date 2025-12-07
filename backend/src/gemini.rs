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
  objective: "Evaluate if the user's design meets the SPECIFIC SCENARIO requirements."
  language: "Japanese"

# ... constraints (tool_limitations, available_components) は変更なし ...
# ... (省略) ...

# 評価ルール（シナリオ依存）
evaluation_logic:
  - "Compare the 'user_design_data' against the 'scenario_requirements' defined in the input JSON."
  - "If Scenario is 'Internal Tool' (Low Traffic) and user uses Load Balancer/Cache -> Mark as OVER-ENGINEERING (Lower score)."
  - "If Scenario is 'SNS App' (High Traffic) and user has Single Server -> Mark as CRITICAL FAILURE (Lower score)."
  - "Always explain WHY based on the scenario's traffic/budget."

# 出力フォーマット
output_format:
  format: "JSON"
  schema:
    score: "Integer (0-100)"
    feedback: "String (Markdown. ### Headers. Explain 'Scenario Fit'.)"
    improvement: "String (Markdown. Suggest changes to fit the scenario.)"

# 入力データ構造
input_data_structure:
  scenario: "Contains specific requirements (Users, Traffic, Budget)"
  nodes: "List of architecture components"
  edges: "List of connections"

# 実際の入力データ
input_json:
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