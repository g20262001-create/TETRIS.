export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Tetromino {
  type: PieceType;
  matrix: number[][];
  color: string; // Tailwind bg color class
  borderColor: string; // Tailwind border color class
}

export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  grid: (PieceType | null)[][];
  currentPiece: Tetromino;
  currentPosition: Point;
  nextPiece: Tetromino;
  holdPiece: Tetromino | null;
  hasHeld: boolean;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  highScore: number;
}
