import { ArchitectureCanvas } from './components/ArchitectureCanvas';

function App() {
  return (
    // キャンバスコンポーネント側で height: 100vh を指定しているので
    // ここではラップするだけでOK
    <ArchitectureCanvas />
  );
}

export default App;