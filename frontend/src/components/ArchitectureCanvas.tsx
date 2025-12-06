import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { Sidebar } from './Sidebar';

let id = 0;
const getId = () => `dndnode_${id++}`;

const onDragOver = (event: React.DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

function ArchitectureFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (!reactFlowWrapper.current) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  // --- 追加機能: 設計データを保存・評価へ回す処理 ---
  const onEvaluate = useCallback(() => {
    // 現在のキャンバスの状態を取得
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    // バックエンドに送る予定のデータ構造を作成
    const designData = {
      nodes: currentNodes.map(n => ({
        id: n.id,
        type: n.data.label, // "Load Balancer" などのラベルをタイプとして扱う
        position: n.position
      })),
      edges: currentEdges.map(e => ({
        source: e.source,
        target: e.target
      }))
    };

    // 現段階ではコンソールに出力して確認
    console.log("▼ バックエンドへ送信するアーキテクチャデータ ▼");
    console.log(JSON.stringify(designData, null, 2));
    
    alert("コンソールにJSONデータを出力しました（F12で確認）");
  }, [getNodes, getEdges]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
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
          
          {/* 追加: 右上にボタンを配置 */}
          <Panel position="top-right">
            <button 
              onClick={onEvaluate}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              設計完了（評価する）
            </button>
          </Panel>
          
        </ReactFlow>
      </div>
    </div>
  );
}

export function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <ArchitectureFlow />
    </ReactFlowProvider>
  );
}