// frontend/src/components/ScenarioSelectionScreen.tsx (新規ファイル)

import React from "react";
import { SCENARIOS } from "../scenarios";
import type { Scenario } from "../types";
import { FaCog, FaLightbulb } from "react-icons/fa";

interface ScenarioSelectionScreenProps {
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioSelectionScreen: React.FC<
  ScenarioSelectionScreenProps
> = ({ onSelectScenario }) => {
  // スタイルは環境に合わせて調整してください（ここでは簡易的なインラインスタイルを使用）
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#f4f7f9",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    width: "300px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "40px", fontSize: "2em", color: "#333" }}>
        👋 設計シナリオを選択してください
      </h1>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          maxWidth: "1000px",
          justifyContent: "center",
        }}
      >
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            style={cardStyle}
            onClick={() => onSelectScenario(scenario)}
            // 簡易ホバー効果
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 8px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <h2
              style={{
                fontSize: "1.2em",
                marginBottom: "10px",
                color: scenario.isCustom ? "#ffc107" : "#007bff",
              }}
            >
              {scenario.title}
            </h2>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              {scenario.description}
            </p>
            <div
              style={{
                marginTop: "15px",
                padding: "5px 10px",
                backgroundColor: scenario.isCustom ? "#ffc107" : "#e9ecef",
                borderRadius: "4px",
                display: "inline-block",
                fontSize: "0.8em",
              }}
            >
              {scenario.isCustom ? (
                <>
                  <FaCog
                    style={{ color: "#a1a1a1ff", verticalAlign: "middle" }}
                  />{" "}
                  カスタム定義へ
                </>
              ) : (
                <>
                  <FaLightbulb style={{ verticalAlign: "middle" }} /> 設計を開始
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
