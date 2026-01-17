import { Vector3 } from 'three';

// Simple pseudo-random hash for noise
function fract(x: number) {
  return x - Math.floor(x);
}

function hash(n: number) {
  return fract(Math.sin(n) * 43758.5453123);
}

// 2D Noise
export function noise2D(x: number, z: number) {
  const iX = Math.floor(x);
  const iZ = Math.floor(z);
  const fX = fract(x);
  const fZ = fract(z);

  const u = fX * fX * (3.0 - 2.0 * fX);
  const v = fZ * fZ * (3.0 - 2.0 * fZ);

  return (
    (1 - u) * (1 - v) * hash(iX + iZ * 57) +
    u * (1 - v) * hash(iX + 1.0 + iZ * 57) +
    (1 - u) * v * hash(iX + (iZ + 1.0) * 57) +
    u * v * hash(iX + 1.0 + (iZ + 1.0) * 57)
  );
}

// Simple key generator for chunks
export const getChunkKey = (x: number, z: number) => `${x},${z}`;

// World position to Chunk Coordinates
export const worldToChunk = (pos: number) => Math.floor(pos / 16);

export const getKey = (x: number, y: number, z: number) => `${x},${y},${z}`;
