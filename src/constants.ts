import { PieceType, Tetromino } from './types';

export const COLS = 10;
export const ROWS = 20;

export const SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const TETROMINO_TEMPLATES: Record<PieceType, Omit<Tetromino, 'matrix'>> = {
  I: {
    type: 'I',
    color: 'bg-purple-300/90 shadow-[0_2px_8px_rgba(192,132,252,0.3)]',
    borderColor: 'border-purple-400/50',
  },
  O: {
    type: 'O',
    color: 'bg-purple-400/90 shadow-[0_2px_8px_rgba(168,85,247,0.3)]',
    borderColor: 'border-purple-500/50',
  },
  T: {
    type: 'T',
    color: 'bg-violet-300/90 shadow-[0_2px_8px_rgba(139,92,246,0.3)]',
    borderColor: 'border-violet-400/50',
  },
  S: {
    type: 'S',
    color: 'bg-neutral-300/95 shadow-[0_2px_8px_rgba(115,115,115,0.2)]',
    borderColor: 'border-neutral-400/40',
  },
  Z: {
    type: 'Z',
    color: 'bg-purple-200/90 shadow-[0_2px_8px_rgba(216,180,254,0.3)]',
    borderColor: 'border-purple-300/50',
  },
  J: {
    type: 'J',
    color: 'bg-neutral-400/90 shadow-[0_2px_8px_rgba(82,82,82,0.25)]',
    borderColor: 'border-neutral-500/45',
  },
  L: {
    type: 'L',
    color: 'bg-indigo-300/90 shadow-[0_2px_8px_rgba(129,140,248,0.3)]',
    borderColor: 'border-indigo-400/50',
  },
};

export const createTetromino = (type: PieceType): Tetromino => {
  return {
    ...TETROMINO_TEMPLATES[type],
    matrix: JSON.parse(JSON.stringify(SHAPES[type])),
  };
};

export const getRandomPiece = (): Tetromino => {
  const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return createTetromino(randomType);
};

export const createEmptyGrid = (): (PieceType | null)[][] => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
};
