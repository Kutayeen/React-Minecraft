import React from 'react';
import { useGameStore } from '../store/gameStore';
import { BLOCK_COLORS } from '../constants';
import { BlockType } from '../types';

export const Crosshair: React.FC = () => (
  <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 pointer-events-none z-10 flex items-center justify-center">
    <div className="w-4 h-0.5 bg-white opacity-80 absolute" />
    <div className="h-4 w-0.5 bg-white opacity-80 absolute" />
  </div>
);

export const Hotbar: React.FC = () => {
  const inventory = useGameStore(state => state.inventory);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const setSelectedBlock = useGameStore(state => state.setSelectedBlock);

  // Handle number keys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const num = parseInt(e.key);
        if (num > 0 && num <= inventory.length) {
            setSelectedBlock(inventory[num - 1]);
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventory, setSelectedBlock]);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg pointer-events-none">
      {inventory.map((block, index) => (
        <div 
          key={index}
          className={`w-10 h-10 border-2 flex items-center justify-center pointer-events-auto cursor-pointer transition-all ${selectedBlock === block ? 'border-white scale-110' : 'border-gray-500 opacity-70'}`}
          style={{ backgroundColor: BLOCK_COLORS[block] }}
          onClick={() => setSelectedBlock(block)}
        >
          <span className="text-xs text-white font-bold drop-shadow-md">{index + 1}</span>
        </div>
      ))}
    </div>
  );
};
