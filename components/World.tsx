import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import VoxelChunk from './VoxelChunk';
import { worldToChunk } from '../utils/math';
import { RENDER_DISTANCE } from '../constants';
import { useThree } from '@react-three/fiber';

const World: React.FC = () => {
  const chunks = useGameStore(state => state.chunks);
  const generateChunk = useGameStore(state => state.generateChunk);
  const { camera } = useThree();

  // Simple chunk loading logic based on camera position
  useEffect(() => {
    const checkChunks = () => {
      const cx = worldToChunk(camera.position.x);
      const cz = worldToChunk(camera.position.z);

      for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
        for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
          generateChunk(cx + x, cz + z);
        }
      }
    };

    const interval = setInterval(checkChunks, 1000);
    checkChunks(); // Initial load
    return () => clearInterval(interval);
  }, [camera.position.x, camera.position.z, generateChunk]);

  return (
    <group>
      {Array.from(chunks.entries()).map(([key, data]) => {
        const [cx, cz] = key.split(',').map(Number);
        return <VoxelChunk key={key} cx={cx} cz={cz} data={data} />;
      })}
    </group>
  );
};

export default World;
