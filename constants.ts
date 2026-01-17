import { BlockType } from './types';

// World Generation
export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 64;
export const RENDER_DISTANCE = 4; // Radius of chunks to render

// Physics
export const GRAVITY = 30; // m/s^2
export const JUMP_FORCE = 10;
export const MOVE_SPEED = 5;
export const RUN_SPEED = 8;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_RADIUS = 0.3; // Reduced to fit easily in 1x1 holes

// Visuals
export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.AIR]: 'transparent',
  [BlockType.GRASS]: '#4ade80', // green-400
  [BlockType.DIRT]: '#854d0e', // yellow-900
  [BlockType.STONE]: '#57534e', // stone-600
  [BlockType.WOOD]: '#78350f', // amber-900
  [BlockType.LEAVES]: '#15803d', // green-700
  [BlockType.WATER]: '#3b82f6', // blue-500
  [BlockType.SAND]: '#fde047', // yellow-300
};

export const TEXTURE_MAP: Record<BlockType, string> = {
    [BlockType.AIR]: '',
    [BlockType.GRASS]: 'https://picsum.photos/seed/grass/64/64',
    [BlockType.DIRT]: 'https://picsum.photos/seed/dirt/64/64',
    [BlockType.STONE]: 'https://picsum.photos/seed/stone/64/64',
    [BlockType.WOOD]: 'https://picsum.photos/seed/wood/64/64',
    [BlockType.LEAVES]: 'https://picsum.photos/seed/leaves/64/64',
    [BlockType.WATER]: 'https://picsum.photos/seed/water/64/64',
    [BlockType.SAND]: 'https://picsum.photos/seed/sand/64/64',
};

// Networking
export const DEFAULT_SERVER_URL = 'http://localhost:3001';