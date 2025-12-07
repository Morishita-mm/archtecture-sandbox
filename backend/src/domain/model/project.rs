use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// --- Value Objects (値オブジェクト) ---
// ドメイン固有の型を定義し、取り違えを防ぎます

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProjectId(pub Uuid);

impl ProjectId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

// 図データの中身も、単なるJSONではなく型として定義します
// これにより「ノードには必ず座標が必要」といったルールを強制できます
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagram {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub type_label: String, // "role"だと予約語っぽいので変更
    pub position: Position,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub source: String,
    pub target: String,
}

// チャット履歴も型定義
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatLog {
    pub role: String,
    pub content: String,
}

// --- Entity (エンティティ) ---
// 同一性(ID)を持ち、ライフサイクルを持つオブジェクト

#[derive(Debug, Clone)]
pub struct Project {
    pub id: ProjectId,
    pub title: String,
    pub scenario_id: String,
    pub last_modified: DateTime<Utc>,
    
    // JSONBの中身をラップしたValue Object
    pub diagram: Diagram,
    pub chat_history: Vec<ChatLog>,
    
    // 評価結果はまだ必須ではないためOptionにするなどの柔軟性を持たせる
    // 今回は簡易化のため serde_json::Value のままにするか、型定義するか判断が必要
    // 安全性重視なら型定義すべきですが、今は一旦 Value で逃げます（後で厳格化可能）
    pub evaluation: Option<serde_json::Value>,
}

impl Project {
    // コンストラクタ（再構築用）
    pub fn new(
        id: ProjectId,
        title: String,
        scenario_id: String,
        diagram: Diagram,
        chat_history: Vec<ChatLog>,
    ) -> Self {
        Self {
            id,
            title,
            scenario_id,
            last_modified: Utc::now(),
            diagram,
            chat_history,
            evaluation: None,
        }
    }

    // ドメインロジックの例:
    // 「タイトルを変更する」という操作をメソッドとして定義
    // これにより、「どこでタイトルが書き換わったか」が追跡しやすくなります
    pub fn change_title(&mut self, new_title: String) {
        if !new_title.is_empty() {
            self.title = new_title;
            self.last_modified = Utc::now();
        }
    }
}