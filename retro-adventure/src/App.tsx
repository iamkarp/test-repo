import { useEffect } from 'react';
import { useGameStore } from './engine/store';
import { Terminal, CommandInput, ArtPane } from './ui';
import './App.css';

function App() {
  const initialize = useGameStore((state) => state.initialize);
  const inventory = useGameStore((state) => state.inventory);
  const currentRoomId = useGameStore((state) => state.currentRoomId);
  const turn = useGameStore((state) => state.turn);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="game-container">
      {/* Main game area - Sierra style layout */}
      <div className="game-screen">
        {/* Large pixel art pane - top 70% */}
        <div className="art-container">
          <ArtPane />
        </div>

        {/* Text area - bottom 30% */}
        <div className="text-area">
          <Terminal />
          <CommandInput />
        </div>
      </div>

      {/* Status bar at very bottom */}
      <div className="status-bar-bottom">
        <span className="status-item">Room: {currentRoomId.replace(/_/g, ' ')}</span>
        <span className="status-item">Items: {inventory.length}</span>
        <span className="status-item">Turn: {turn}</span>
        <span className="status-item hint">Type HELP for commands</span>
      </div>
    </div>
  );
}

export default App;
