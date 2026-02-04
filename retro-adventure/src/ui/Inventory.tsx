import { useGameStore } from '../engine/store';
import { gameContent } from '../content';

export function Inventory() {
  const inventory = useGameStore((state) => state.inventory);

  return (
    <div className="inventory-panel">
      <div className="panel-header">INVENTORY</div>
      <div className="inventory-list">
        {inventory.length === 0 ? (
          <div className="inventory-empty">Empty</div>
        ) : (
          inventory.map((itemId) => {
            const item = gameContent.items[itemId];
            return (
              <div key={itemId} className="inventory-item">
                {item?.name || itemId}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
