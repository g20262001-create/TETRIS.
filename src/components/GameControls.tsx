import React from 'react';
import { RotateCw, ArrowLeft, ArrowRight, ArrowDown, Zap, RefreshCw } from 'lucide-react';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  paused: boolean;
  gameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onHold,
  paused,
  gameOver,
}) => {
  const isDisabled = paused || gameOver;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] w-full">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold tracking-wider text-neutral-400/90 uppercase">
          TOUCH CONTROLS
        </span>
        <span className="text-[9px] text-neutral-400/70 font-mono tracking-wide hidden lg:inline uppercase">
          KEYBOARD ENABLED
        </span>
      </div>

      {/* Control Grid Layout */}
      <div className="flex flex-col gap-3.5 items-center w-full max-w-[280px] mx-auto">
        {/* Top Row: Hold & Rotate */}
        <div className="flex justify-between w-full gap-4">
          <button
            onClick={onHold}
            disabled={isDisabled}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200/40 bg-white/40 hover:bg-[#D8B4FE]/10 hover:border-[#D8B4FE]/50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none smooth-transition text-xs font-bold text-neutral-600 hover:text-[#A855F7] flex items-center justify-center gap-1.5 shadow-sm"
            title="Hold Piece (Shift)"
            id="control-hold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            HOLD
          </button>

          <button
            onClick={onRotate}
            disabled={isDisabled}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200/40 bg-white/40 hover:bg-[#D8B4FE]/10 hover:border-[#D8B4FE]/50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none smooth-transition text-xs font-bold text-neutral-600 hover:text-[#A855F7] flex items-center justify-center gap-1.5 shadow-sm"
            title="Rotate (Up Arrow)"
            id="control-rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
            ROTATE
          </button>
        </div>

        {/* Middle Row: Left, Soft Drop, Right */}
        <div className="flex justify-between w-full gap-3">
          <button
            onClick={onMoveLeft}
            disabled={isDisabled}
            className="w-11 h-11 rounded-full border border-neutral-200/40 bg-white/40 hover:bg-[#D8B4FE]/10 hover:border-[#D8B4FE]/50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none smooth-transition flex items-center justify-center text-neutral-600 hover:text-[#A855F7] shadow-sm"
            title="Move Left (Left Arrow)"
            id="control-left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onSoftDrop}
            disabled={isDisabled}
            className="w-11 h-11 rounded-full border border-neutral-200/40 bg-white/40 hover:bg-[#D8B4FE]/10 hover:border-[#D8B4FE]/50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none smooth-transition flex items-center justify-center text-neutral-600 hover:text-[#A855F7] shadow-sm"
            title="Soft Drop (Down Arrow)"
            id="control-soft-drop"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onMoveRight}
            disabled={isDisabled}
            className="w-11 h-11 rounded-full border border-neutral-200/40 bg-white/40 hover:bg-[#D8B4FE]/10 hover:border-[#D8B4FE]/50 active:scale-90 disabled:opacity-30 disabled:pointer-events-none smooth-transition flex items-center justify-center text-neutral-600 hover:text-[#A855F7] shadow-sm"
            title="Move Right (Right Arrow)"
            id="control-right-button"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Row: Hard Drop */}
        <button
          onClick={onHardDrop}
          disabled={isDisabled}
          className="w-full py-3 px-4 rounded-xl border border-[#D8B4FE]/40 bg-[#D8B4FE]/80 hover:bg-[#D8B4FE] text-white active:scale-98 disabled:opacity-30 disabled:pointer-events-none smooth-transition text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(216,180,254,0.3)] mt-1"
          title="Hard Drop (Space)"
          id="control-hard-drop"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          HARD DROP
        </button>
      </div>

      {/* Keyboard Shortcuts Reference List */}
      <div className="border-t border-black/[0.04] pt-3 flex flex-wrap justify-between text-[9px] text-neutral-400 font-mono tracking-wider gap-y-1">
        <div className="flex items-center gap-1">
          <kbd className="bg-white/50 px-1 py-0.5 rounded border border-neutral-200/30">Space</kbd> Drop
        </div>
        <div className="flex items-center gap-1">
          <kbd className="bg-white/50 px-1 py-0.5 rounded border border-neutral-200/30">↑</kbd> Rotate
        </div>
        <div className="flex items-center gap-1">
          <kbd className="bg-white/50 px-1 py-0.5 rounded border border-neutral-200/30">Shift</kbd> Hold
        </div>
        <div className="flex items-center gap-1">
          <kbd className="bg-white/50 px-1 py-0.5 rounded border border-neutral-200/30">P</kbd> Pause
        </div>
      </div>
    </div>
  );
};

