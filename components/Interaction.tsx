import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { BlockType } from '../types';

const Interaction: React.FC = () => {
  const { camera } = useThree();
  const getBlock = useGameStore(state => state.getBlock);
  const setBlock = useGameStore(state => state.setBlock);
  const selectedBlockType = useGameStore(state => state.selectedBlock);
  
  const [highlightPos, setHighlightPos] = useState<[number, number, number] | null>(null);
  const [faceNormal, setFaceNormal] = useState<[number, number, number] | null>(null);

  // Custom voxel raycast (simplified)
  // Standard THREE.Raycaster is mesh-based. For voxels, a DDA algorithm is better.
  // For this prototype, we will step along the ray vector.
  const castRay = () => {
    const origin = camera.position.clone();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    let currentPos = origin.clone();
    const step = 0.1; // Precision
    const reach = 6; // Reach distance
    
    for (let i = 0; i < reach / step; i++) {
      currentPos.add(direction.clone().multiplyScalar(step));
      const bx = Math.floor(currentPos.x);
      const by = Math.floor(currentPos.y);
      const bz = Math.floor(currentPos.z);
      
      const block = getBlock(bx, by, bz);
      if (block !== BlockType.AIR) {
        // Hit
        // Calculate simple normal based on entry point
        const prevPos = currentPos.clone().sub(direction.clone().multiplyScalar(step));
        const pbx = Math.floor(prevPos.x);
        const pby = Math.floor(prevPos.y);
        const pbz = Math.floor(prevPos.z);
        
        return {
          x: bx, y: by, z: bz,
          nx: pbx - bx, ny: pby - by, nz: pbz - bz
        };
      }
    }
    return null;
  };

  useFrame(() => {
    const hit = castRay();
    if (hit) {
      setHighlightPos([hit.x, hit.y, hit.z]);
      setFaceNormal([hit.nx, hit.ny, hit.nz]);
    } else {
      setHighlightPos(null);
    }
  });

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;
      if (!highlightPos || !faceNormal) return;

      const [hx, hy, hz] = highlightPos;
      const [nx, ny, nz] = faceNormal;

      if (e.button === 0) {
        // Left Click: Break
        setBlock(hx, hy, hz, BlockType.AIR);
      } else if (e.button === 2) {
        // Right Click: Place
        // Calculate new position based on normal
        const px = hx + nx;
        const py = hy + ny;
        const pz = hz + nz;
        
        // Don't place inside player
        // Simple distance check
        const playerPos = camera.position;
        const dist = Math.sqrt(Math.pow(px+0.5 - playerPos.x, 2) + Math.pow(py+0.5 - playerPos.y, 2) + Math.pow(pz+0.5 - playerPos.z, 2));
        
        if (dist > 1.2) {
            setBlock(px, py, pz, selectedBlockType);
        }
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [highlightPos, faceNormal, selectedBlockType, camera, setBlock]);

  return (
    <>
      {highlightPos && (
        <lineSegments position={[highlightPos[0] + 0.5, highlightPos[1] + 0.5, highlightPos[2] + 0.5]}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.001, 1.001, 1.001)]} />
          <lineBasicMaterial color="black" linewidth={2} />
        </lineSegments>
      )}
    </>
  );
};

export default Interaction;
