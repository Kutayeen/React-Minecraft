import React, { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { useGameStore } from './store/gameStore';
import World from './components/World';
import Player from './components/Player';
import Interaction from './components/Interaction';
import { Crosshair, Hotbar } from './components/UI';
import Menu from './components/Menu';

const App: React.FC = () => {
  const isMenuOpen = useGameStore(state => state.isMenuOpen);
  const setMenuOpen = useGameStore(state => state.setMenuOpen);
  const setGameMode = useGameStore(state => state.setGameMode);

  useEffect(() => {
    const handlePointerLockChange = () => {
      // Check if ANY element is locked (it will be the canvas, not body)
      if (document.pointerLockElement) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
        setGameMode('menu'); // Return to menu logic or pause
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [setMenuOpen, setGameMode]);

  return (
    <div className="relative w-full h-full bg-black">
      <Menu />
      
      {!isMenuOpen && (
        <>
          <Crosshair />
          <Hotbar />
        </>
      )}

      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 200 }}
        className="cursor-none"
        gl={{ antialias: false }} // Optimization for pixel art style
      >
        <Suspense fallback={null}>
            <Sky sunPosition={[100, 20, 100]} />
            <Stars />
            <ambientLight intensity={0.5} />
            <pointLight position={[100, 100, 100]} intensity={1} castShadow />
            
            <World />
            <Player />
            <Interaction />
            
            {/* Fog for chunk hiding */}
            <fog attach="fog" args={['#87CEEB', 10, 60]} /> 
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;