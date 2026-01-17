import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, RUN_SPEED, PLAYER_HEIGHT, PLAYER_RADIUS } from '../constants';
import { BlockType } from '../types';

const Player: React.FC = () => {
  const { camera } = useThree();
  const [velocity] = useState(new Vector3(0, 0, 0));
  const [position] = useState(new Vector3(0, 40, 0)); // Spawn high
  const isJumping = useRef(false);
  const getBlock = useGameStore(state => state.getBlock);
  
  // Inputs
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const canJump = useRef(false);
  const isSprinting = useRef(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward.current = true; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft.current = true; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward.current = true; break;
        case 'ArrowRight':
        case 'KeyD': moveRight.current = true; break;
        case 'Space': 
          if (canJump.current) {
             velocity.y = JUMP_FORCE;
             canJump.current = false;
          }
          break;
        case 'ShiftLeft': isSprinting.current = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': moveForward.current = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft.current = false; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward.current = false; break;
        case 'ArrowRight':
        case 'KeyD': moveRight.current = false; break;
        case 'ShiftLeft': isSprinting.current = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [velocity]);

  const checkCollision = (pos: Vector3) => {
    // AABB Collision Detection
    const xMin = Math.floor(pos.x - PLAYER_RADIUS);
    const xMax = Math.floor(pos.x + PLAYER_RADIUS);
    const yMin = Math.floor(pos.y);
    const yMax = Math.floor(pos.y + PLAYER_HEIGHT - 0.2); // -0.2 to avoid checking head block when standing
    const zMin = Math.floor(pos.z - PLAYER_RADIUS);
    const zMax = Math.floor(pos.z + PLAYER_RADIUS);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        for (let z = zMin; z <= zMax; z++) {
          if (getBlock(x, y, z) !== BlockType.AIR) return true;
        }
      }
    }
    return false;
  };

  useFrame((state, delta) => {
    // 1. Apply Gravity
    velocity.y -= GRAVITY * delta;
    
    // 2. Handle Input Movement (XZ Plane)
    const speed = isSprinting.current ? RUN_SPEED : MOVE_SPEED;
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(moveBackward.current) - Number(moveForward.current));
    const sideVector = new Vector3(Number(moveLeft.current) - Number(moveRight.current), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation);

    // Keep movement on XZ plane only
    velocity.x = direction.x;
    velocity.z = direction.z;

    // 3. Apply Velocity to Position with AABB Collision Detection
    
    // X Axis
    const nextX = position.clone().add(new Vector3(velocity.x * delta, 0, 0));
    if (!checkCollision(nextX)) {
        position.x = nextX.x;
    } else {
        velocity.x = 0;
    }

    // Z Axis
    const nextZ = position.clone().add(new Vector3(0, 0, velocity.z * delta));
    if (!checkCollision(nextZ)) {
        position.z = nextZ.z;
    } else {
        velocity.z = 0;
    }

    // Y Axis (Gravity/Jump)
    position.y += velocity.y * delta;
    
    // Check collision after Y movement
    if (checkCollision(position)) {
        if (velocity.y < 0) {
            // Falling down, hit ground
            // Snap to top of the block we hit.
            // Since we use Math.floor for blocks, the top is integer + 1.
            position.y = Math.floor(position.y) + 1; 
            velocity.y = 0;
            canJump.current = true;
        } else {
            // Jumping up, hit ceiling
            // Undo move or snap down
            position.y -= velocity.y * delta;
            velocity.y = 0;
        }
    } else {
        // In air
        canJump.current = false;
    }

    // Hard floor at y=-50 to prevent infinite void falling
    if (position.y < -50) {
        position.set(0, 50, 0);
        velocity.set(0, 0, 0);
    }

    // Update Camera
    camera.position.copy(position);
    // Eye level offset
    camera.position.y += 1.6;
  });

  return <mesh />; // Logic only component, no mesh
};

export default Player;