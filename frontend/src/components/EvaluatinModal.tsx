import React from "react";
import ReactMarkdown from "react-markdown"; // 追加
import remarkGfm from "remark-gfm"; // 追加
import type { EvaluationResult } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: EvaluationResult | null;
}

export const EvaluationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  // スコアに応じた色分け
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 50) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2>アーキテクチャ評価結果</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={scoreContainerStyle}>
          <span>総合スコア:</span>
          <span
            style={{ ...scoreValueStyle, color: getScoreColor(result.score) }}
          >
            {result.score}
          </span>
          <span style={{ fontSize: "20px" }}>/ 100</span>
        </div>

        <div style={contentStyle}>
          <h3>🤖 AIからのフィードバック</h3>
          <div style={markdownContainerStyle}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.feedback}
            </ReactMarkdown>
          </div>

          <h3>💡 改善のための提案</h3>
          <div style={markdownContainerStyle}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.improvement}
            </ReactMarkdown>
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={buttonStyle}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles (CSS-in-JS for MVP) ---
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  width: "80%",
  maxWidth: "800px",
  maxHeight: "90vh",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  padding: "15px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
};

const scoreContainerStyle: React.CSSProperties = {
  padding: "20px",
  textAlign: "center",
  fontSize: "24px",
  fontWeight: "bold",
  backgroundColor: "#f9f9f9",
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 10px",
};

const contentStyle: React.CSSProperties = {
  padding: "20px",
  overflowY: "auto",
  flex: 1,
};

const markdownContainerStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '10px 20px',
  borderRadius: '8px',
  marginBottom: '20px',
  border: '1px solid #e9ecef',
  lineHeight: '1.7',
  color: '#24292e',
  fontSize: '15px',
  overflowX: 'auto', // テーブルなどがはみ出た場合用
};

const footerStyle: React.CSSProperties = {
  padding: "15px",
  borderTop: "1px solid #eee",
  textAlign: "right",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};
