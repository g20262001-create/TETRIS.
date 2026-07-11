import React from 'react';
import { motion } from 'motion/react';
import { Tetromino } from '../types';
import { TETROMINO_TEMPLATES } from '../constants';

interface GameStatsProps {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  nextPiece: Tetromino;
  holdPiece: Tetromino | null;
}

export const StatCard: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-transform duration-300 hover:scale-[1.01]">
      <span className="text-[10px] font-bold tracking-wider text-neutral-400/90 uppercase">{label}</span>
      <motion.span
        key={value}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`text-2xl font-bold tracking-tight ${accent ? 'text-[#A855F7]' : 'text-neutral-800'}`}
      >
        {value}
      </motion.span>
    </div>
  );
};

export const PiecePreview: React.FC<{ label: string; piece: Tetromino | null; placeholderText?: string }> = ({
  label,
  piece,
  placeholderText = 'EMPTY',
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-between aspect-square w-full shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-transform duration-300 hover:scale-[1.01]">
      <span className="text-[10px] font-bold tracking-wider text-neutral-400/90 uppercase w-full text-left mb-2">
        {label}
      </span>
      <div className="flex-1 flex items-center justify-center w-full min-h-[70px]">
        {piece ? (
          <div className="grid gap-[2.5px]" style={{ gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))` }}>
            {piece.matrix.map((row, r) =>
              row.map((val, c) => {
                const template = TETROMINO_TEMPLATES[piece.type];
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-3.5 h-3.5 rounded-[3px] smooth-transition ${
                      val !== 0
                        ? 'bg-[#D8B4FE] border border-[#C09EF2]/40 shadow-[0_0_8px_rgba(216,180,254,0.4)]'
                        : 'bg-transparent'
                    }`}
                  />
                );
              })
            )}
          </div>
        ) : (
          <span className="text-[10px] font-bold text-neutral-300 tracking-widest font-mono uppercase">
            {placeholderText}
          </span>
        )}
      </div>
    </div>
  );
};

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  highScore,
  level,
  lines,
  nextPiece,
  holdPiece,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-1 gap-3.5 w-full">
      <div className="grid grid-cols-2 gap-3.5 col-span-2 md:col-span-1">
        <PiecePreview label="HOLD" piece={holdPiece} />
        <PiecePreview label="NEXT" piece={nextPiece} />
      </div>
      
      <div className="grid grid-cols-2 gap-3.5 col-span-2 md:col-span-1">
        <StatCard label="SCORE" value={score.toLocaleString()} accent />
        <StatCard label="BEST" value={highScore.toLocaleString()} />
        <StatCard label="LEVEL" value={level} />
        <StatCard label="LINES" value={lines} />
      </div>
    </div>
  );
};

