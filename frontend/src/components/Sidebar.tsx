import React from 'react';

// ドラッグ開始時の処理
// データとして「このノードの種類(role)」を持たせます
const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
  event.dataTransfer.setData('application/reactflow/type', nodeType);
  event.dataTransfer.setData('application/reactflow/label', label);
  event.dataTransfer.effectAllowed = 'move';
};

export const Sidebar = () => {
  return (
    <aside style={{ width: '250px', padding: '15px', borderRight: '1px solid #eee', background: '#fcfcfc' }}>
      <div className="description" style={{ marginBottom: '10px' }}>
        コンポーネントを選択
      </div>
      
      {/* 以下のdivがドラッグ可能なパーツになります */}
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'input', 'Client (User)')}
        draggable
        style={nodeStyle}
      >
        Client (User)
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'default', 'Load Balancer')}
        draggable
        style={nodeStyle}
      >
        Load Balancer
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'default', 'API Server')}
        draggable
        style={nodeStyle}
      >
        API Server
      </div>

      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'output', 'RDBMS (Postgres)')}
        draggable
        style={nodeStyle}
      >
        RDBMS (Postgres)
      </div>

      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, 'default', 'Cache (Redis)')}
        draggable
        style={nodeStyle}
      >
        Cache (Redis)
      </div>
    </aside>
  );
};

// 簡易的なスタイル
const nodeStyle: React.CSSProperties = {
  height: '40px',
  padding: '10px',
  border: '1px solid #777',
  borderRadius: '5px',
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'grab',
  background: 'white',
};