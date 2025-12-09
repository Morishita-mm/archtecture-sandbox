#![allow(clippy::collapsible_if)]

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;

use crate::domain::model::chat::ChatRequest;

#[derive(Deserialize)]
struct ArchitectureDefs {
    categories: Vec<Category>,
}

#[derive(Deserialize)]
struct Category {
    items: Vec<Item>,
}

#[derive(Deserialize)]
struct Item {
    #[serde(rename = "type")] // JSONの "type" フィールドをマッピング
    type_name: String,
}

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

// --- プロンプト生成関数 ---
fn build_system_prompt() -> String {
    // 1. プロンプトテンプレートを読み込む (コンパイル時に埋め込み)
    let template = include_str!("system_prompt.txt");

    // 2. フロントエンドのJSON定義を読み込む (相対パスに注意)
    // backend/src/infrastructure/gemini/client.rs から見たパス
    // -> ../../../../frontend/src/constants/architecture_defs.json
    let json_str = include_str!("../../../../frontend/src/constants/architecture_defs.json");
    
    // 3. JSONをパースしてコンポーネントリストを作る
    let defs: ArchitectureDefs = serde_json::from_str(json_str)
        .expect("Failed to parse architecture_defs.json");

    let mut components = String::new();
    for category in defs.categories {
        for item in category.items {
            // YAMLのリスト形式 "- Name" に整形
            components.push_str(&format!("    - \"{}\"\n", item.type_name));
        }
    }

    // 4. テンプレート内のプレースホルダーを置換
    template.replace("{{AVAILABLE_COMPONENTS}}", &components)
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
    let system_prompt = build_system_prompt();
    println!("--- System Prompt (Head) --- \n{}...\n--------------------------", system_prompt);

    // プロンプト結合
    let prompt = format!("{}\n{}", system_prompt, json_data);

    let request_body = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: prompt }],
        }],
    };

    let client = Client::new();
    let res = client.post(&url).json(&request_body).send().await?;

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

pub async fn chat_with_customer(req: &ChatRequest) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
    // モデル指定: latest を使用
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    // シナリオごとの「裏設定」定義
    let hidden_context = match req.scenario_id.as_str() {
        "internal_tool" => {
            "
            あなたは「社内勤怠管理ツール」の発注担当者（総務部）です。
            ITには詳しくありません。
            【裏要件】
            - 予算はとにかく安く済ませたい。
            - 朝9時に社員50人が一斉にアクセスするが、それ以外は誰も使わない。
            - データは消えると困るが、数分止まるくらいなら許容できる。
            - セキュリティ（社外からのアクセス禁止）は気にしている。
        "
        }
        "sns_app" => {
            "
            あなたは「次世代SNSアプリ」のスタートアップCEOです。
            野心的で、急成長を想定しています。
            【裏要件】
            - 世界中からアクセスがある想定。
            - とにかく「サクサク動く（低レイテンシ）」ことが最重要。
            - 24時間365日止まってはいけない（可用性重視）。
            - 予算はある程度確保している。
        "
        }
        _ => "あなたは一般的なシステムの顧客です。",
    };

    // システムプロンプトの構築
    let system_instruction = format!(
        r#"
        {}
        ユーザー（システムアーキテクト）からの質問に対して、上記の立場・要件に基づいて回答してください。
        回答は短潔に、かつ自然な会話口調で行ってください。
        自分からアーキテクチャの答え（「ロードバランサーを使って」など）は言わないでください。あくまで「要望」を伝えてください。
        "#,
        hidden_context
    );

    // --- 修正箇所: ここから ---
    // 以前のエラー原因だった「不要なcontentsベクタの作成」を削除しました。
    // いきなり full_prompt の作成に入ります。

    let mut full_prompt = String::new();
    full_prompt.push_str(&system_instruction); // ここで参照を使用
    full_prompt.push_str("\n\n--- 会話履歴 ---\n");

    for msg in &req.messages {
        let speaker = if msg.role == "user" {
            "Architect"
        } else {
            "Client"
        };
        full_prompt.push_str(&format!("{}: {}\n", speaker, msg.content));
    }
    full_prompt.push_str("Client: "); // 続きを促す

    // リクエストボディの作成
    let request_body = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part { text: full_prompt }],
        }],
    };
    // --- 修正箇所: ここまで ---

    // HTTPリクエスト
    let client = Client::new();
    let res = client.post(&url).json(&request_body).send().await?;

    // エラーハンドリング
    let status = res.status();
    if !status.is_success() {
        let error_body = res.text().await?;
        eprintln!("Gemini Chat API Error! Status: {}", status);
        eprintln!("Error Body: {}", error_body);
        return Err(format!("Gemini API error: {}", status).into());
    }

    let body_text = res.text().await?;
    let response_json: GeminiResponse = serde_json::from_str(&body_text)?;

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

    Err("No response".into())
}
