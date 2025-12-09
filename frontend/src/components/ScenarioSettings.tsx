import React from 'react';
import type { Scenario } from '../types';

interface Props {
  scenario: Scenario;
  onUpdate: (updated: Scenario) => void;
}

export const ScenarioSettings: React.FC<Props> = ({ scenario, onUpdate }) => {
  if (!scenario.isCustom) return null;

  const handleChange = (field: keyof typeof scenario.requirements, value: string) => {
    onUpdate({
      ...scenario,
      requirements: {
        ...scenario.requirements,
        [field]: value,
      },
    });
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>🛠️ カスタム要件定義</h3>
      <p style={descStyle}>設計するシステムの要件を入力してください。AIはこの情報を基に評価を行います。</p>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>ユーザー規模 (Users)</label>
        <input
          style={inputStyle}
          value={scenario.requirements.users}
          onChange={(e) => handleChange('users', e.target.value)}
          placeholder="例: 10,000 DAU"
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>トラフィック (Traffic)</label>
        <input
          style={inputStyle}
          value={scenario.requirements.traffic}
          onChange={(e) => handleChange('traffic', e.target.value)}
          placeholder="例: Read heavy, Peak at night"
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>可用性 (Availability)</label>
        <input
          style={inputStyle}
          value={scenario.requirements.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          placeholder="例: 99.99%, Multi-AZ required"
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>予算感 (Budget)</label>
        <input
          style={inputStyle}
          value={scenario.requirements.budget}
          onChange={(e) => handleChange('budget', e.target.value)}
          placeholder="例: Low cost priority"
        />
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #ddd',
  marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '10px',
  fontSize: '16px',
  color: '#333',
};

const descStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  marginBottom: '15px',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#444',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
};