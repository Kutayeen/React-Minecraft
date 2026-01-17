import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Settings, Users, ArrowLeft } from 'lucide-react';

const Menu: React.FC = () => {
  const setGameMode = useGameStore(state => state.setGameMode);
  const gameMode = useGameStore(state => state.gameMode);
  const setMenuOpen = useGameStore(state => state.setMenuOpen);
  const serverUrl = useGameStore(state => state.serverUrl);
  const setServerUrl = useGameStore(state => state.setServerUrl);
  
  const [localIp, setLocalIp] = useState(serverUrl);

  const requestLock = async () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        // requestPointerLock returns a promise in modern browsers
        // We cast to any to avoid TS errors with older DOM types
        await (canvas as any).requestPointerLock({
            unadjustedMovement: true
        });
      } catch (e) {
        console.warn("Pointer lock request failed:", e);
      }
    }
  };

  const startGame = () => {
    setGameMode('playing');
    requestLock();
  };

  const joinMultiplayer = () => {
    setServerUrl(localIp);
    setGameMode('playing');
    // Here we would actually trigger the websocket connection logic
    // For now, we simulate entering the game world
    requestLock();
  };

  if (gameMode === 'playing') return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white font-mono">
      <h1 className="text-6xl font-bold mb-8 text-green-500 tracking-tighter drop-shadow-lg">BLOCKCRAFT</h1>
      
      <div className="flex flex-col gap-4 w-64">
        {gameMode === 'menu' && (
          <>
            <button 
              onClick={startGame}
              className="bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded shadow-lg transition-colors font-bold text-lg"
            >
              SINGLEPLAYER
            </button>
            <button 
              onClick={() => setGameMode('multiplayer_setup')}
              className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded shadow-lg transition-colors font-bold text-lg"
            >
              MULTIPLAYER
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-6 rounded transition-colors">
              SETTINGS
            </button>
          </>
        )}

        {gameMode === 'multiplayer_setup' && (
          <div className="flex flex-col gap-3">
             <h2 className="text-xl text-center mb-2">Join Server</h2>
             <input 
                type="text" 
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                placeholder="Server URL (e.g. localhost:3001)"
             />
             <button 
                onClick={joinMultiplayer}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded font-bold"
             >
                CONNECT
             </button>
             <button 
                onClick={() => setGameMode('menu')}
                className="text-gray-400 hover:text-white mt-2 underline"
             >
                Back
             </button>
             <div className="text-xs text-gray-500 mt-4 max-w-xs text-center">
                Note: Ensure the backend server is running on the specified port. See "server/server.js" for the Node.js code.
             </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 text-gray-500 text-xs">
        WASD to Move • SPACE to Jump • Click to Break • Right Click to Place • 1-9 Inventory
      </div>
    </div>
  );
};

export default Menu;