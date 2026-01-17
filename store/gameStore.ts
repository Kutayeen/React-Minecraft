import { create } from 'zustand';
import { BlockType, ChunkData } from '../types';
import { getKey, getChunkKey, worldToChunk, noise2D } from '../utils/math';
import { CHUNK_SIZE, WORLD_HEIGHT } from '../constants';

interface GameState {
  isMenuOpen: boolean;
  gameMode: 'menu' | 'playing' | 'multiplayer_setup';
  serverUrl: string;
  isConnected: boolean;
  
  // Player
  selectedBlock: BlockType;
  inventory: BlockType[];
  
  // World Data
  chunks: Map<string, ChunkData>;
  
  // Actions
  setGameMode: (mode: 'menu' | 'playing' | 'multiplayer_setup') => void;
  setMenuOpen: (isOpen: boolean) => void;
  setSelectedBlock: (block: BlockType) => void;
  setBlock: (x: number, y: number, z: number, type: BlockType) => void;
  getBlock: (x: number, y: number, z: number) => BlockType;
  generateChunk: (cx: number, cz: number) => void;
  setServerUrl: (url: string) => void;
  setConnected: (status: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isMenuOpen: true,
  gameMode: 'menu',
  serverUrl: 'http://localhost:3001',
  isConnected: false,
  
  selectedBlock: BlockType.DIRT,
  inventory: [
    BlockType.GRASS, BlockType.DIRT, BlockType.STONE, 
    BlockType.WOOD, BlockType.LEAVES, BlockType.SAND, BlockType.WATER
  ],
  
  chunks: new Map(),

  setGameMode: (mode) => set({ gameMode: mode, isMenuOpen: mode === 'menu' }),
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  setSelectedBlock: (block) => set({ selectedBlock: block }),
  setServerUrl: (url) => set({ serverUrl: url }),
  setConnected: (status) => set({ isConnected: status }),

  getBlock: (x, y, z) => {
    const { chunks } = get();
    const cx = worldToChunk(x);
    const cz = worldToChunk(z);
    const key = getChunkKey(cx, cz);
    const chunk = chunks.get(key);
    
    if (!chunk) return BlockType.AIR;
    return chunk.get(getKey(x, y, z)) || BlockType.AIR;
  },

  setBlock: (x, y, z, type) => {
    set((state) => {
      const cx = worldToChunk(x);
      const cz = worldToChunk(z);
      const chunkKey = getChunkKey(cx, cz);
      
      const newChunks = new Map(state.chunks);
      let chunk = newChunks.get(chunkKey);
      
      if (!chunk) {
        chunk = new Map();
        newChunks.set(chunkKey, chunk);
      }
      
      // Update the specific block
      if (type === BlockType.AIR) {
        chunk.delete(getKey(x, y, z));
      } else {
        chunk.set(getKey(x, y, z), type);
      }

      return { chunks: newChunks };
    });
  },

  generateChunk: (cx, cz) => {
    set((state) => {
      const key = getChunkKey(cx, cz);
      if (state.chunks.has(key)) return {}; // Already exists

      const chunkData: ChunkData = new Map();
      const startX = cx * CHUNK_SIZE;
      const startZ = cz * CHUNK_SIZE;

      for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const wx = startX + x;
          const wz = startZ + z;
          
          // Generate height using noise
          const frequency = 0.05;
          const amplitude = 10;
          const baseHeight = 10;
          const n = noise2D(wx * frequency, wz * frequency);
          const h = Math.floor(baseHeight + n * amplitude);

          for (let y = 0; y < WORLD_HEIGHT; y++) {
            let type = BlockType.AIR;
            
            if (y < h - 3) type = BlockType.STONE;
            else if (y < h) type = BlockType.DIRT;
            else if (y === h) type = BlockType.GRASS;
            
            // Simple Trees
            if (y === h && n > 0.6 && x > 2 && x < 14 && z > 2 && z < 14) {
               // A simplified tree marker, we'd actully build it up
               if ((x * z) % 13 === 0) { // Rare placement
                 for(let ty = 1; ty <= 4; ty++) chunkData.set(getKey(wx, h+ty, wz), BlockType.WOOD);
                 for(let lx = -2; lx <= 2; lx++) {
                   for(let lz = -2; lz <= 2; lz++) {
                     if (Math.abs(lx) !== 2 || Math.abs(lz) !== 2) { // Circle-ish
                        chunkData.set(getKey(wx+lx, h+4, wz+lz), BlockType.LEAVES);
                        chunkData.set(getKey(wx+lx, h+5, wz+lz), BlockType.LEAVES);
                     }
                   }
                 }
                 chunkData.set(getKey(wx, h+6, wz), BlockType.LEAVES);
               }
            }

            if (type !== BlockType.AIR) {
              chunkData.set(getKey(wx, y, wz), type);
            }
          }
        }
      }

      const newChunks = new Map(state.chunks);
      newChunks.set(key, chunkData);
      return { chunks: newChunks };
    });
  },
}));
