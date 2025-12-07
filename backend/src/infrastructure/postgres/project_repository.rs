use async_trait::async_trait;
use sqlx::PgPool;
use std::error::Error;

use crate::domain::{
    model::{
        project::{Project, ProjectId},
        diagram::Diagram,
        chat::ChatLog
    },
    repository::project_repository::ProjectRepository,
};
pub struct PostgresProjectRepository {
    pool: PgPool,
}

impl PostgresProjectRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl ProjectRepository for PostgresProjectRepository {
    async fn save(&self, project: &Project) -> Result<(), Box<dyn Error>> {
        // ドメインモデル -> DB用データ(JSON) への変換
        // ここで変換エラーが起きても、それは技術的な問題なのでドメイン層は関知しない
        let diagram_json = serde_json::to_value(&project.diagram)?;
        let chat_json = serde_json::to_value(&project.chat_history)?;

        sqlx::query!(
            r#"
            INSERT INTO projects (id, title, scenario_id, diagram_data, chat_history, last_modified)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE
            SET title = EXCLUDED.title,
                scenario_id = EXCLUDED.scenario_id,
                diagram_data = EXCLUDED.diagram_data,
                chat_history = EXCLUDED.chat_history,
                last_modified = EXCLUDED.last_modified
            "#,
            project.id.0, // ProjectId(Uuid) -> Uuid
            project.title,
            project.scenario_id,
            diagram_json,
            chat_json,
            project.last_modified
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn find_by_id(&self, id: &ProjectId) -> Result<Option<Project>, Box<dyn Error>> {
        let row = sqlx::query!(
            r#"
            SELECT id, title, scenario_id, diagram_data, chat_history, evaluation, last_modified
            FROM projects
            WHERE id = $1
            "#,
            id.0
        )
        .fetch_optional(&self.pool)
        .await?;

        // データが見つかった場合、ドメインモデルに再構築する
        if let Some(r) = row {
            // DBのJSONB -> ドメインオブジェクト への変換
            // diagram_data が NULL の場合のハンドリング等は要件次第ですが、
            // ここではテーブル定義上データが入っている前提で変換します
            let diagram: Diagram = serde_json::from_value(r.diagram_data.unwrap_or(serde_json::json!({
                "nodes": [], "edges": []
            })))?;

            let chat_history: Vec<ChatLog> = serde_json::from_value(r.chat_history.unwrap_or(serde_json::json!([])))?;

            // evaluationはまだOption<Value>のまま
            let evaluation = r.evaluation;

            Ok(Some(Project {
                id: ProjectId(r.id),
                title: r.title,
                scenario_id: r.scenario_id,
                last_modified: r.last_modified,
                diagram,
                chat_history,
                evaluation,
            }))
        } else {
            Ok(None)
        }
    }
}