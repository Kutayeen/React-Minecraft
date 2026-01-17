export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  WATER = 6,
  SAND = 7
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  selectedBlock: BlockType;
}

export type ChunkData = Map<string, BlockType>; // Key: "x,y,z", Value: BlockType

export interface WorldState {
  chunks: Map<string, ChunkData>;
  setBlock: (x: number, y: number, z: number, type: BlockType) => void;
  getBlock: (x: number, y: number, z: number) => BlockType;
  addChunk: (key: string, data: ChunkData) => void;
}
