import { useState } from 'react';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { ScenarioSetup } from './components/ScenarioSetup';
import type { Scenario } from './types';
import { ScenarioSelectionScreen } from './components/ScenarioSelectionScreen';

// アプリのフェーズを管理するための型
type AppPhase = 'SCENARIO_SELECTION' | 'CUSTOM_DEFINITION' | 'CANVAS';

function App() {
  const [phase, setPhase] = useState<AppPhase>('SCENARIO_SELECTION'); 
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const handleScenarioSelect = (scenario: Scenario) => {
    if (scenario.isCustom) {
      // カスタムシナリオの場合、定義画面へ遷移
      setSelectedScenario(scenario);
      setPhase('CUSTOM_DEFINITION');
    } else {
      // デフォルトシナリオの場合、キャンバスへ遷移
      setSelectedScenario(scenario);
      setPhase('CANVAS');
    }
  };

  const handleCustomDefinitionComplete = (scenario: Scenario) => {
    // カスタム定義が完了したら、キャンバスへ遷移
    setSelectedScenario(scenario);
    setPhase('CANVAS');
  };

  // シナリオ選択画面へ戻るハンドラ
  const handleGoToSelection = () => {
    setSelectedScenario(null);
    setPhase('SCENARIO_SELECTION');
  };


  if (phase === 'SCENARIO_SELECTION') {
    return <ScenarioSelectionScreen onSelectScenario={handleScenarioSelect} />;
  }

  if (phase === 'CUSTOM_DEFINITION' && selectedScenario) {
    return (
      <ScenarioSetup // ★ ScenarioSetup に変更
        initialScenario={selectedScenario}
        onConfirm={handleCustomDefinitionComplete} // ★ onConfirm に変更
        onCancel={handleGoToSelection} // ★ onCancel に変更
      />
    );
  }

  if (phase === 'CANVAS' && selectedScenario) {
    // ArchitectureCanvasコンポーネントに selectedScenario と onBackToSelection を渡す
    return (
      <ArchitectureCanvas 
        selectedScenario={selectedScenario} 
        onBackToSelection={handleGoToSelection} 
      />
    );
  }

  return <div style={{ padding: 20 }}>アプリケーションのロード中...</div>;
}

export default App;