import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ChunkData, BlockType } from '../types';
import { CHUNK_SIZE, BLOCK_COLORS } from '../constants';
import { getKey } from '../utils/math';
import { useGameStore } from '../store/gameStore';

interface VoxelChunkProps {
  cx: number;
  cz: number;
  data: ChunkData;
}

const VoxelChunk: React.FC<VoxelChunkProps> = ({ cx, cz, data }) => {
  const getBlock = useGameStore(state => state.getBlock);

  const { geometry, materials } = useMemo(() => {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    // Helper to add face
    const addFace = (
      x: number, y: number, z: number,
      posOffset: number[],
      norm: number[],
      blockType: BlockType
    ) => {
      const colorHex = BLOCK_COLORS[blockType];
      const color = new THREE.Color(colorHex);
      
      const ndx = positions.length / 3;
      
      // Add 4 vertices
      // 0, 1, 2, 2, 1, 3 for a quad
      
      // We are creating a unit cube face
      // posOffset contains [x1,y1,z1, x2,y2,z2, ...] for 4 corners
      for (let i = 0; i < 4; i++) {
        positions.push(x + posOffset[i * 3], y + posOffset[i * 3 + 1], z + posOffset[i * 3 + 2]);
        normals.push(...norm);
        colors.push(color.r, color.g, color.b);
      }
      
      indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
    };

    // Iterate Chunk
    // Note: optimization for "getBlock" across chunk boundaries is tricky in isolation.
    // Ideally we pass neighbors, but for this demo we use global getBlock which is slower but correct.
    
    // Iterating only relevant blocks in the Map is faster than 16x64x16 loop if sparse
    // But for terrain, it's dense.
    
    // Extract keys to iterate efficiently
    const keys = Array.from(data.keys());
    
    keys.forEach(key => {
        const [wxStr, wyStr, wzStr] = key.split(',');
        const x = parseInt(wxStr);
        const y = parseInt(wyStr);
        const z = parseInt(wzStr);
        const type = data.get(key)!;

        if (type === BlockType.AIR) return;

        // Check Neighbors (Face Culling)
        // If neighbor is air or transparent (water), draw face
        
        // Right (x+1)
        if (getBlock(x + 1, y, z) === BlockType.AIR) {
            addFace(x, y, z, [1,0,1, 1,0,0, 1,1,1, 1,1,0], [1,0,0], type);
        }
        // Left (x-1)
        if (getBlock(x - 1, y, z) === BlockType.AIR) {
            addFace(x, y, z, [0,0,0, 0,0,1, 0,1,0, 0,1,1], [-1,0,0], type);
        }
        // Top (y+1)
        if (getBlock(x, y + 1, z) === BlockType.AIR) {
            addFace(x, y, z, [0,1,1, 1,1,1, 0,1,0, 1,1,0], [0,1,0], type);
        }
        // Bottom (y-1)
        if (getBlock(x, y - 1, z) === BlockType.AIR) {
            addFace(x, y, z, [0,0,0, 1,0,0, 0,0,1, 1,0,1], [0,-1,0], type);
        }
        // Front (z+1)
        if (getBlock(x, y, z + 1) === BlockType.AIR) {
            addFace(x, y, z, [0,0,1, 1,0,1, 0,1,1, 1,1,1], [0,0,1], type);
        }
        // Back (z-1)
        if (getBlock(x, y, z - 1) === BlockType.AIR) {
            addFace(x, y, z, [1,0,0, 0,0,0, 1,1,0, 0,1,0], [0,0,-1], type);
        }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);

    // Compute bounds for frustum culling
    geo.computeBoundingSphere();

    return { geometry: geo, materials: new THREE.MeshLambertMaterial({ vertexColors: true }) };
  }, [cx, cz, data, getBlock]); // Re-compute if data changes

  return (
    <mesh geometry={geometry} material={materials} castShadow receiveShadow />
  );
};

export default React.memo(VoxelChunk);
