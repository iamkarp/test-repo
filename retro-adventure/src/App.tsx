import { useEffect } from 'react';
import { useGameStore } from './engine/store';
import { Terminal, CommandInput, StatusBar, Inventory, MiniMap } from './ui';
import './App.css';

function App() {
  const initialize = useGameStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>CAVE OF THE ICE WIZARD</h1>
      </div>

      <div className="game-content">
        <div className="main-panel">
          <Terminal />
          <CommandInput />
        </div>

        <div className="side-panel">
          <StatusBar />
          <Inventory />
          <MiniMap />
        </div>
      </div>

      <div className="game-footer">
        <span>A Retro Text Adventure</span>
        <span className="footer-hint">Type HELP for commands</span>
      </div>
    </div>
  );
}

export default App;
