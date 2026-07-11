import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieceType, Tetromino, Point } from '../types';
import { COLS, ROWS, TETROMINO_TEMPLATES } from '../constants';

interface GameBoardProps {
  grid: (PieceType | null)[][];
  currentPiece: Tetromino;
  position: Point;
  ghostY: number;
  gameOver: boolean;
  paused: boolean;
  hasStarted: boolean;
  clearingLines: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  currentPiece,
  position,
  ghostY,
  gameOver,
  paused,
  hasStarted,
  clearingLines,
}) => {
  // Determine if a cell is occupied by the falling block
  const getCellState = (r: number, c: number) => {
    // 1. Check if cleared row (animating)
    if (clearingLines.includes(r)) {
      return 'clearing';
    }

    // 2. Check active falling piece
    const activePieceRow = r - position.y;
    const activePieceCol = c - position.x;
    if (
      activePieceRow >= 0 &&
      activePieceRow < currentPiece.matrix.length &&
      activePieceCol >= 0 &&
      activePieceCol < currentPiece.matrix[activePieceRow].length
    ) {
      if (currentPiece.matrix[activePieceRow][activePieceCol] !== 0) {
        return 'active';
      }
    }

    // 3. Check ghost projection piece
    const ghostPieceRow = r - ghostY;
    const ghostPieceCol = c - position.x;
    if (
      ghostPieceRow >= 0 &&
      ghostPieceRow < currentPiece.matrix.length &&
      ghostPieceCol >= 0 &&
      ghostPieceCol < currentPiece.matrix[ghostPieceRow].length
    ) {
      if (currentPiece.matrix[ghostPieceRow][ghostPieceCol] !== 0) {
        return 'ghost';
      }
    }

    // 4. Check locked piece in grid
    if (grid[r][c] !== null) {
      return 'locked';
    }

    return 'empty';
  };

  return (
    <div className="relative aspect-[1/2] w-full max-w-[310px] mx-auto bg-white rounded-2xl p-2 border border-black/[0.05] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Grid container */}
      <div className="grid grid-cols-10 grid-rows-20 gap-[2.5px] h-full w-full relative z-10">
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const cellState = getCellState(r, c);
            let cellClass = 'bg-[#F9F9FB] rounded-[3px] border border-black/[0.01]';
            let style = {};

            if (cellState === 'clearing') {
              cellClass = 'bg-white shadow-[0_0_12px_#fff] scale-95 border-[#D8B4FE]';
            } else if (cellState === 'active') {
              cellClass = 'bg-[#D8B4FE] shadow-[0_0_10px_rgba(216,180,254,0.5)] border border-[#C09EF2]/40 rounded-[3px] scale-[0.98]';
            } else if (cellState === 'ghost') {
              cellClass = 'bg-[#F3F4F6] border border-neutral-200/40 rounded-[3px] scale-[0.95]';
            } else if (cellState === 'locked') {
              const pieceType = grid[r][c] as PieceType;
              const template = TETROMINO_TEMPLATES[pieceType];
              // Use cohesive light purple accent style for locked cells as well but with variations based on tetromino type to keep identity
              cellClass = `${template.color} border ${template.borderColor} rounded-[3px] scale-[0.98]`;
            }

            return (
              <div
                key={`${r}-${c}`}
                id={`cell-${r}-${c}`}
                className={`w-full h-full smooth-transition ${cellClass}`}
                style={style}
              />
            );
          })
        )}
      </div>

      {/* Grid Overlay Effects: Game Over, Pause */}
      <AnimatePresence>
        {paused && !gameOver && hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-white/40 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-white/95 shadow-[0_8px_24px_rgba(139,92,246,0.1)] px-5 py-2.5 rounded-full border border-neutral-100 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-[#D8B4FE] animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-neutral-800 uppercase">PAUSED</span>
            </motion.div>
          </motion.div>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-2xl p-6 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className="space-y-4"
            >
              <div className="inline-flex p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <svg className="w-8 h-8 text-[#A855F7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold tracking-tight text-neutral-800">GAME OVER</h3>
                <p className="text-[11px] text-neutral-500 font-medium">기록을 갱신하기 위해 도전해 보세요.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

