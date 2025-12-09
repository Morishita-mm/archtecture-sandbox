import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EvaluationResult } from "../types";

interface Props {
  result: EvaluationResult | null;
  onEvaluate: () => void;
  isLoading: boolean;
}

export const EvaluationPanel: React.FC<Props> = ({
  result,
  onEvaluate,
  isLoading,
}) => {
  // 1. まだ評価がない場合の表示
  if (!result) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyCardStyle}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🧐</div>
          <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>
            まだ評価結果がありません
          </h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            現在の設計が要件を満たしているか、AIアーキテクトに診断してもらいましょう。
          </p>
          <button
            onClick={onEvaluate}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? "#ccc" : "#2196F3",
              cursor: isLoading ? "wait" : "pointer",
            }}
          >
            {isLoading ? "AIが診断中..." : "現在の設計を評価する"}
          </button>
        </div>
      </div>
    );
  }

  // 2. 評価結果がある場合の表示
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 50) return "#FF9800";
    return "#F44336";
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>アーキテクチャ評価レポート</h2>
        <button onClick={onEvaluate} disabled={isLoading} style={retryButtonStyle}>
          {isLoading ? "再評価中..." : "🔄 再評価する"}
        </button>
      </div>

      <div style={scoreSectionStyle}>
        <div style={scoreLabelStyle}>総合スコア</div>
        <div style={{ ...scoreValueStyle, color: getScoreColor(result.score) }}>
          {result.score}
          <span style={{ fontSize: "24px", color: "#999" }}>/100</span>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>🤖 AIからのフィードバック</h3>
          <div style={markdownContainerStyle}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.feedback}
            </ReactMarkdown>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>💡 改善のための提案</h3>
          <div style={markdownContainerStyle}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.improvement}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle: React.CSSProperties = {
  padding: "30px",
  height: "100%",
  overflowY: "auto",
  backgroundColor: "#f5f7fa",
};

const emptyContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  backgroundColor: "#f5f7fa",
  padding: "20px",
};

const emptyCardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  maxWidth: "500px",
  width: "100%",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};

const scoreSectionStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const scoreLabelStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#666",
  marginBottom: "5px",
  fontWeight: "bold",
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: "64px",
  fontWeight: "bold",
  lineHeight: 1,
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const sectionStyle: React.CSSProperties = {};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "15px",
  color: "#333",
  borderLeft: "4px solid #2196F3",
  paddingLeft: "10px",
};

const markdownContainerStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e1e4e8",
  lineHeight: "1.7",
  color: "#24292e",
  fontSize: "15px",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 24px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "bold",
};

const retryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "white",
  color: "#666",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};