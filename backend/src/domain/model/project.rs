use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// 切り出したモジュールをインポート
use super::diagram::Diagram;
use super::chat::ChatLog;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProjectId(pub Uuid);

impl ProjectId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

// Entity
#[derive(Debug, Clone)]
pub struct Project {
    pub id: ProjectId,
    pub title: String,
    pub scenario_id: String,
    pub last_modified: DateTime<Utc>,
    
    pub diagram: Diagram,       // 外部ファイル定義を使用
    pub chat_history: Vec<ChatLog>, // 外部ファイル定義を使用
    
    pub evaluation: Option<serde_json::Value>,
}

impl Project {
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

    pub fn change_title(&mut self, new_title: String) {
        if !new_title.is_empty() {
            self.title = new_title;
            self.last_modified = Utc::now();
        }
    }
}

// テストコードは diagram::Diagram を使うように微修正が必要ですが、
// コンパイラが教えてくれるので後述します。
#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::model::diagram::{Diagram, Node, Edge}; // インポート追加

    fn create_dummy_diagram() -> Diagram {
        Diagram { nodes: vec![], edges: vec![] }
    }
    
    // ... (以下のテストコードはそのまま) ...
    // ※ 先ほど書いたテストコードはそのままで動くはずですが、
    // use super::*; で diagram が見えなくなる可能性があるため、
    // 必要に応じて上記 use を追加してください。
}