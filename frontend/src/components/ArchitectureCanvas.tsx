import { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  type Node,
} from "reactflow";

import "reactflow/dist/style.css";
import { Sidebar } from "./Sidebar";
import { BiChat, BiNetworkChart, BiBarChart } from "react-icons/bi";
import type {
  EvaluationResult,
  ChatMessage,
  Scenario,
  ProjectSaveData,
  SimpleNodeData,
  SimpleEdgeData,
} from "../types";
import { ChatInterface } from "./ChatInterface";
import { MemoPad } from "./MemoPad";
import { EvaluationPanel } from "./EvaluationPanel";
import { v4 as uuidv4 } from "uuid";

interface ArchitectureCanvasProps {
  selectedScenario: Scenario;
  onBackToSelection: () => void;
  loadedProjectData: ProjectSaveData | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

let id = 0;
const getId = () => `dndnode_${id++}`;

const onDragOver = (event: React.DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

function ArchitectureFlow({
  selectedScenario,
  onBackToSelection,
  loadedProjectData,
}: ArchitectureCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const [activeTab, setActiveTab] = useState<"chat" | "design" | "evaluate">(
    "chat"
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [memo, setMemo] = useState<string>("");

  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const projectIdRef = useRef<string>(uuidv4());
  const [isSaving, setIsSaving] = useState(false);

  const [projectVersion, setProjectVersion] = useState<string>("1.0");

  const currentScenario = selectedScenario;

  useEffect(() => {
    // 1. ロードデータがある場合: 全てのStateを復元
    if (loadedProjectData) {
      setNodes(loadedProjectData.diagram.nodes as Node[]);
      setEdges(
        loadedProjectData.diagram.edges.map((e) => ({
          id: e.id || `e_${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
        })) as Edge[]
      );
      setChatMessages(loadedProjectData.chatHistory);
      setMemo(loadedProjectData.memo);

      if (loadedProjectData.evaluation) {
        setEvaluationResult(loadedProjectData.evaluation);
        setActiveTab("evaluate");
      }

      const loadedVer = parseFloat(loadedProjectData.version) || 1.0;
      const nextVer = (loadedVer + 1.0).toFixed(1); // 小数点1桁まで維持
      setProjectVersion(nextVer);

      return;
    }

    // 2. ロードデータがなく、新規開始の場合
    if (chatMessages.length === 0) {
      setProjectVersion("1.0");

      let initialMessages: ChatMessage[];

      if (currentScenario.isCustom) {
        // カスタムシナリオ初期化（既存ロジック）
        const difficultySpecs = {
          small: {
            scale: "小規模（個人開発・社内ツール）",
            users: "50〜100人程度",
            budget: "月額5,000円以内 (可能な限り安く)",
            constraint:
              "運用コストをかけられないため、メンテナンスフリーな構成を好む",
          },
          medium: {
            scale: "中規模（急成長スタートアップ）",
            users: "10万DAU, ピーク時秒間100リクエスト",
            budget: "月額50万円〜100万円",
            constraint: "急激なアクセス増に耐えられるスケーラビリティが必須",
          },
          large: {
            scale: "大規模（ミッションクリティカル）",
            users: "1000万ユーザー, グローバル展開",
            budget: "無制限（可用性とレイテンシが最優先）",
            constraint:
              "単一障害点(SPOF)の完全排除と、データロス発生時の法的リスク回避",
          },
        };

        const spec = difficultySpecs[currentScenario.difficulty || "medium"];

        const hiddenSystemPrompt = `
---
Role: System Client
Task: Simulate a client for system architecture design.

Scenario:
  Title: "${currentScenario.title}"
  Description: "${currentScenario.description}"
  Scale: "${spec.scale}"

Hidden_Context:
  # DO NOT reveal these values unless explicitly asked.
  Users: "${spec.users}"
  Budget: "${spec.budget}"
  Critical_Constraint: "${spec.constraint}"
  Domain_Specific_Constraint: "Please invent one technical constraint specific to '${currentScenario.title}' (e.g., real-time requirement, legacy system integration)."

Behavior_Rules:
  - Act as a non-technical stakeholder initially.
  - Reveal "Hidden_Context" information ONLY when the user asks specifically about relevant topics (e.g., "How many users?", "What is the budget?").
  - If the user presents a design without uncovering the "Critical_Constraint", point out the flaw in the evaluation phase, not during the chat.
  - Be professional but demanding.

Evaluation_Criteria:
  - Did the user ask about the scale/users?
  - Did the user ask about the budget?
  - Does the proposed architecture solve the Critical_Constraint?
---

Please start the conversation by acknowledging the request for "${currentScenario.title}" and waiting for the user to interview you.
`.trim();

        initialMessages = [
          { role: "system", content: hiddenSystemPrompt },
          {
            role: "model",
            content: `ご依頼ありがとうございます。「${currentScenario.title}」のシステム構築ですね。\n\n今回のプロジェクトについて、どのような点から詳細を詰めていきましょうか？`,
          },
        ];
      } else {
        // デフォルトシナリオ初期化
        initialMessages = [
          {
            role: "model",
            content: `こんにちは。「${currentScenario.title}」の件についてですね。どのようなシステムをご提案いただけますか？`,
          },
        ];
      }

      setChatMessages(initialMessages);
    }
  }, [selectedScenario.id, loadedProjectData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow/type");
      const label = event.dataTransfer.getData("application/reactflow/label");
      const color = event.dataTransfer.getData("application/reactflow/color");
      const bgColor = event.dataTransfer.getData(
        "application/reactflow/bgcolor"
      );

      if (!reactFlowWrapper.current) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: label },
        style: {
          border: `2px solid ${color || "#777"}`,
          backgroundColor: bgColor || "#fff",
          borderRadius: "8px",
          padding: "10px",
          fontWeight: "bold",
          minWidth: "150px",
          textAlign: "center",
          fontSize: "14px",
          color: "#333",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onEvaluate = useCallback(async () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    if (currentNodes.length === 0) {
      alert("コンポーネントを配置してください");
      return;
    }

    setIsLoading(true);

    const designData = {
      scenario: currentScenario,
      nodes: currentNodes.map((n) => ({
        id: n.id,
        type: n.data.label,
        position: n.position,
      })),
      edges: currentEdges.map((e) => ({
        source: e.source,
        target: e.target,
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EvaluationResult = await response.json();
      setEvaluationResult(result);
      setActiveTab("evaluate");
    } catch (error) {
      console.error("API Error:", error);
      alert("評価中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  }, [getNodes, getEdges, currentScenario]);

  // ★ onSaveProject: ローカル保存ロジック (評価結果も含める)
  const onSaveProject = useCallback(async () => {
    setIsSaving(true);
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    try {
      const payload: ProjectSaveData = {
        version: projectVersion,
        timestamp: new Date().toISOString(),
        projectId: projectIdRef.current,
        scenario: currentScenario,
        memo: memo,
        diagram: {
          nodes: currentNodes.map((n) => ({
            id: n.id,
            type: n.type as string,
            position: n.position,
            data: n.data as { label: string },
            style: n.style as React.CSSProperties,
          })) as SimpleNodeData[],
          edges: currentEdges.map((e) => ({
            source: e.source,
            target: e.target,
            id: e.id,
          })) as SimpleEdgeData[],
        },
        chatHistory: chatMessages,
        evaluation: evaluationResult,
      };

      const jsonString = JSON.stringify(payload, null, 2);
      const base64Encoded = btoa(unescape(encodeURIComponent(jsonString)));

      // ★ ファイル名の生成: <タイトル>_v<バージョン>.json
      const safeTitle = currentScenario.title.trim() || "untitled";
      const filename = `${safeTitle}_v${projectVersion}.json`;

      const blob = new Blob([base64Encoded], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`「${filename}」を保存しました。`);

      setProjectVersion((currentVer) => {
        const v = parseFloat(currentVer) || 1.0;
        return (v + 1.0).toFixed(1);
      });
    } catch (error) {
      console.error("Save Error:", error);
      alert("プロジェクトの保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  }, [
    getNodes,
    getEdges,
    currentScenario,
    chatMessages,
    memo,
    evaluationResult,
    projectVersion,
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <header
        style={{
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBackToSelection}
          style={{
            padding: "8px 15px",
            border: "1px solid #007bff",
            borderRadius: "4px",
            backgroundColor: "white",
            cursor: "pointer",
            color: "#007bff",
          }}
        >
          ⬅ シナリオ選択に戻る
        </button>
        <h1 style={{ fontSize: "1.2em", margin: 0 }}>
          {currentScenario.title}
        </h1>

        {/* 保存ボタンのみ配置 */}
        <button
          onClick={onSaveProject}
          disabled={isSaving}
          style={{
            marginLeft: "auto",
            padding: "8px 15px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: isSaving ? "#ccc" : "#28a745",
            color: "white",
            cursor: isSaving ? "wait" : "pointer",
          }}
        >
          {isSaving ? "保存中..." : "プロジェクト保存（ローカル）"}
        </button>
      </header>

      <>
        <div style={tabBarStyle}>
          <button
            style={activeTab === "chat" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("chat")}
          >
            <BiChat style={{ marginRight: "6px", verticalAlign: "middle" }} />
            要件定義・交渉
          </button>
          <button
            style={activeTab === "design" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("design")}
          >
            <BiNetworkChart
              style={{ marginRight: "6px", verticalAlign: "middle" }}
            />
            アーキテクチャ設計
          </button>
          <button
            style={activeTab === "evaluate" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("evaluate")}
          >
            <BiBarChart
              style={{ marginRight: "6px", verticalAlign: "middle" }}
            />
            評価結果
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* メインエリアの表示ロジックは変更なし */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {activeTab === "chat" && (
              <div style={{ width: "100%", height: "100%" }}>
                <ChatInterface
                  scenario={currentScenario}
                  messages={chatMessages}
                  onSendMessage={setChatMessages}
                />
              </div>
            )}

            {activeTab === "evaluate" && (
              <div style={{ width: "100%", height: "100%" }}>
                <EvaluationPanel
                  result={evaluationResult}
                  onEvaluate={onEvaluate}
                  isLoading={isLoading}
                />
              </div>
            )}

            <div
              style={{
                display: activeTab === "design" ? "flex" : "none",
                width: "100%",
                height: "100%",
              }}
            >
              <Sidebar />
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={{ flex: 1, height: "100%", position: "relative" }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                  <Panel position="top-right">
                    <button
                      onClick={onEvaluate}
                      disabled={isLoading}
                      style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: isLoading ? "#ccc" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: isLoading ? "wait" : "pointer",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      }}
                    >
                      {isLoading ? "AIが評価中..." : "設計完了（評価する）"}
                    </button>
                  </Panel>
                </ReactFlow>
              </div>
            </div>
          </div>

          <MemoPad value={memo} onChange={setMemo} />
        </div>
      </>
    </div>
  );
}

// ★ エクスポート設定の変更
export function ArchitectureCanvas({
  selectedScenario,
  onBackToSelection,
  loadedProjectData,
}: ArchitectureCanvasProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureFlow
        selectedScenario={selectedScenario}
        onBackToSelection={onBackToSelection}
        loadedProjectData={loadedProjectData}
      />
    </ReactFlowProvider>
  );
}

// Styles
const tabBarStyle: React.CSSProperties = {
  display: "flex",
  backgroundColor: "#f5f5f5",
  borderBottom: "1px solid #ddd",
  padding: "0 20px",
  flexShrink: 0,
};

const tabStyle: React.CSSProperties = {
  padding: "15px 30px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "16px",
  color: "#666",
  borderBottom: "3px solid transparent",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "#2196F3",
  fontWeight: "bold",
  borderBottom: "3px solid #2196F3",
};
