import { useGameStore } from '../engine/store';
import { gameContent } from '../content';

export function StatusBar() {
  const currentRoomId = useGameStore((state) => state.currentRoomId);
  const turn = useGameStore((state) => state.turn);
  const inventory = useGameStore((state) => state.inventory);
  const flags = useGameStore((state) => state.flags);
  const gameOver = useGameStore((state) => state.gameOver);
  const victory = useGameStore((state) => state.victory);

  const room = gameContent.rooms[currentRoomId];

  return (
    <div className="status-bar">
      <div className="status-location">
        <span className="status-label">Location:</span>
        <span className="status-value">{room?.name || 'Unknown'}</span>
      </div>
      <div className="status-turn">
        <span className="status-label">Turn:</span>
        <span className="status-value">{turn}</span>
      </div>
      <div className="status-items">
        <span className="status-label">Items:</span>
        <span className="status-value">{inventory.length}</span>
      </div>
      {flags.torch_lit && (
        <div className="status-light">
          <span className="torch-icon">🔥</span>
        </div>
      )}
      {(gameOver || victory) && (
        <div className={`status-end ${victory ? 'victory' : 'defeat'}`}>
          {victory ? 'VICTORY!' : 'GAME OVER'}
        </div>
      )}
    </div>
  );
}
