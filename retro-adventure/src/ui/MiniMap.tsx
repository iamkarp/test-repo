import { useGameStore } from '../engine/store';

// Simple ASCII-style mini map showing visited rooms
const mapLayout = [
  ['         ', '         ', ' outside ', '         ', '         '],
  ['         ', '         ', '    |    ', '         ', '         '],
  ['         ', '         ', 'entrance ', '         ', '         '],
  ['         ', '         ', '    |    ', '         ', '         '],
  ['         ', 'alcove---', '  hall   ', '         ', '         '],
  ['         ', '         ', '    |    ', '         ', '         '],
  ['grotto---', '-crystal-', '---+-----', '-bridge--', '-antechmb'],
  ['         ', '         ', '         ', '         ', '    |    '],
  ['         ', '         ', '         ', '         ', ' throne  '],
  ['         ', '         ', '         ', '         ', '    |    '],
  ['         ', '         ', '         ', '         ', '  vault  '],
  ['         ', '         ', '         ', '         ', '    |    '],
  ['         ', '         ', '         ', '         ', ' freedom '],
];

const roomPositions: Record<string, [number, number]> = {
  outside: [0, 2],
  cave_entrance: [2, 2],
  torch_hall: [4, 2],
  storage_alcove: [4, 1],
  crystal_chamber: [6, 1],
  hidden_grotto: [6, 0],
  ice_bridge: [6, 3],
  antechamber: [6, 4],
  wizard_throne: [8, 4],
  treasure_vault: [10, 4],
  freedom: [12, 4],
};

export function MiniMap() {
  const currentRoomId = useGameStore((state) => state.currentRoomId);
  const roomStates = useGameStore((state) => state.roomStates);

  const currentPos = roomPositions[currentRoomId];

  return (
    <div className="minimap-panel">
      <div className="panel-header">MAP</div>
      <div className="minimap">
        {mapLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="map-row">
            {row.map((cell, colIndex) => {
              // Find if any room matches this position
              let roomId: string | null = null;
              for (const [id, pos] of Object.entries(roomPositions)) {
                if (pos[0] === rowIndex && pos[1] === colIndex) {
                  roomId = id;
                  break;
                }
              }

              const isCurrentRoom = currentPos && currentPos[0] === rowIndex && currentPos[1] === colIndex;
              const isVisited = roomId && roomStates[roomId]?.visited;

              let className = 'map-cell';
              if (isCurrentRoom) {
                className += ' current';
              } else if (isVisited) {
                className += ' visited';
              } else if (roomId) {
                className += ' unvisited';
              }

              return (
                <span key={colIndex} className={className}>
                  {cell}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
