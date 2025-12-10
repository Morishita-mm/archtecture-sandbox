// src/components/ScenarioSelectionScreen.tsx

import React from "react";
import { SCENARIOS } from "../scenarios";
import type { Scenario, ProjectSaveData } from "../types";
import { FaCog, FaLightbulb } from "react-icons/fa";
import { BiFolderOpen } from "react-icons/bi";

interface ScenarioSelectionScreenProps {
  onSelectScenario: (scenario: Scenario) => void;
  onProjectLoad: (loadedData: ProjectSaveData) => void;
}

export const ScenarioSelectionScreen: React.FC<
  ScenarioSelectionScreenProps
> = ({ onSelectScenario, onProjectLoad }) => {
  const onLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64EncodedContent = e.target?.result as string;

      try {
        const decodedJsonString = decodeURIComponent(
          escape(atob(base64EncodedContent))
        );
        const loadedData = JSON.parse(decodedJsonString);

        if (
          typeof loadedData.version !== "string" ||
          typeof loadedData.projectId !== "string" ||
          typeof loadedData.scenario !== "object" ||
          !Array.isArray(loadedData.diagram?.nodes) ||
          !Array.isArray(loadedData.diagram?.edges) ||
          !Array.isArray(loadedData.chatHistory)
        ) {
          throw new Error("プロジェクトファイルの構造が不正です。");
        }

        const confirmedData = loadedData as ProjectSaveData;
        onProjectLoad(confirmedData);
      } catch (error) {
        console.error("Load Error:", error);
        alert(
          `ファイルの読み込みに失敗しました。\n\n詳細: ${
            error instanceof Error ? error.message : "ファイル形式が不正です。"
          }`
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

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
      <h1
        style={{
          marginBottom: "20px",
          fontSize: "2em",
          color: "#333",
          textAlign: "center",
        }}
      >
        👋 設計シナリオを選択してください
      </h1>

      <div
        style={{
          marginBottom: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept=".json"
          onChange={onLoadProject}
          style={{ display: "none" }}
          id="file-load-input-welcome"
        />
        <label
          htmlFor="file-load-input-welcome"
          style={{
            padding: "12px 25px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#6c757d",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",

            transition:
              "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
          }}

          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
            e.currentTarget.style.backgroundColor = "#5a6268";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.backgroundColor = "#6c757d";
          }}
        >
          <BiFolderOpen size={20} /> 既存プロジェクトを読み込む
        </label>
        <span style={{ color: "#999", fontSize: "0.9em" }}>
          （ローカルに保存したJSONファイルを読み込んで再開）
        </span>
      </div>

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
