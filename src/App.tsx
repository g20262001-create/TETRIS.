import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Keyboard, Sparkles, HelpCircle } from 'lucide-react';
import { PieceType, Tetromino, Point, GameState } from './types';
import {
  COLS,
  ROWS,
  createEmptyGrid,
  getRandomPiece,
  createTetromino,
} from './constants';
import { GameBoard } from './components/GameBoard';
import { GameStats } from './components/GameStats';
import { GameControls } from './components/GameControls';

export default function App() {
  // Game states
  const [grid, setGrid] = useState<(PieceType | null)[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(getRandomPiece());
  const [currentPosition, setCurrentPosition] = useState<Point>({ x: 3, y: 0 });
  const [nextPiece, setNextPiece] = useState<Tetromino>(getRandomPiece());
  const [holdPiece, setHoldPiece] = useState<Tetromino | null>(null);
  const [hasHeld, setHasHeld] = useState<boolean>(false);
  
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tetris_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(true); // Start paused
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Audio elements (using elegant synthesized Web Audio API so no external assets are required!)
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'move' | 'rotate' | 'drop' | 'clear' | 'gameover') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'move') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'rotate') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'drop') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'clear') {
        // High chords for row clear
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }, [soundEnabled]);

  // Handle High Score persistence
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('tetris_high_score', score.toString());
      } catch (e) {
        console.error('Failed to save high score', e);
      }
    }
  }, [score, highScore]);

  // Collision Checking Helper
  const checkCollision = useCallback((
    pieceMatrix: number[][],
    pos: Point,
    board: (PieceType | null)[][]
  ): boolean => {
    for (let r = 0; r < pieceMatrix.length; r++) {
      for (let c = 0; c < pieceMatrix[r].length; c++) {
        if (pieceMatrix[r][c] !== 0) {
          const boardX = pos.x + c;
          const boardY = pos.y + r;

          // Border check
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return true;
          }

          // Locked cells check
          if (boardY >= 0 && board[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Calculate Ghost position (where it lands)
  const getGhostY = useCallback((
    pieceMatrix: number[][],
    pos: Point,
    board: (PieceType | null)[][]
  ): number => {
    let tempY = pos.y;
    while (!checkCollision(pieceMatrix, { x: pos.x, y: tempY + 1 }, board)) {
      tempY++;
    }
    return tempY;
  }, [checkCollision]);

  const ghostY = getGhostY(currentPiece.matrix, currentPosition, grid);

  // Spawns a new Tetromino
  const spawnNewPiece = useCallback((currentGrid: (PieceType | null)[][]) => {
    const next = nextPiece;
    const newNext = getRandomPiece();
    setNextPiece(newNext);
    setHasHeld(false);

    // Initial spawn coordinates
    const spawnPos = {
      x: Math.floor((COLS - next.matrix[0].length) / 2),
      y: 0,
    };

    if (checkCollision(next.matrix, spawnPos, currentGrid)) {
      setGameOver(true);
      setPaused(true);
      playSound('gameover');
    } else {
      setCurrentPiece(next);
      setCurrentPosition(spawnPos);
    }
  }, [nextPiece, checkCollision, playSound]);

  // Merge piece and clear lines logic
  const lockPiece = useCallback((currentP: Tetromino, pos: Point) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => [...row]);

      // Merge piece into board grid
      for (let r = 0; r < currentP.matrix.length; r++) {
        for (let c = 0; c < currentP.matrix[r].length; c++) {
          if (currentP.matrix[r][c] !== 0) {
            const boardY = pos.y + r;
            const boardX = pos.x + c;
            if (boardY >= 0 && boardY < ROWS) {
              nextGrid[boardY][boardX] = currentP.type;
            }
          }
        }
      }

      // Detect full rows
      const completedRows: number[] = [];
      for (let r = 0; r < ROWS; r++) {
        if (nextGrid[r].every((cell) => cell !== null)) {
          completedRows.push(r);
        }
      }

      if (completedRows.length > 0) {
        playSound('clear');
        setClearingLines(completedRows);

        // Flash/shimmer and remove after 220ms
        setTimeout(() => {
          setClearingLines([]);
          setGrid((g) => {
            const filteredGrid = g.filter((_, idx) => !completedRows.includes(idx));
            const freshRowsNeeded = ROWS - filteredGrid.length;
            const prepended = Array.from({ length: freshRowsNeeded }, () =>
              Array(COLS).fill(null)
            );
            const finishedGrid = [...prepended, ...filteredGrid];

            // Scoring calculations
            const linePoints = [0, 100, 300, 500, 800];
            const pointsGained = (linePoints[completedRows.length] || 800) * level;

            setScore((s) => s + pointsGained);
            setLines((l) => {
              const nextLines = l + completedRows.length;
              // Level up every 10 lines
              setLevel((lvl) => {
                const calculatedLevel = Math.floor(nextLines / 10) + 1;
                return calculatedLevel;
              });
              return nextLines;
            });

            spawnNewPiece(finishedGrid);
            return finishedGrid;
          });
        }, 220);
      } else {
        playSound('drop');
        spawnNewPiece(nextGrid);
      }

      return nextGrid;
    });
  }, [level, spawnNewPiece, playSound]);

  // Movement operations
  const moveLeft = useCallback(() => {
    if (paused || gameOver) return;
    const nextPos = { ...currentPosition, x: currentPosition.x - 1 };
    if (!checkCollision(currentPiece.matrix, nextPos, grid)) {
      setCurrentPosition(nextPos);
      playSound('move');
    }
  }, [currentPosition, currentPiece, grid, checkCollision, paused, gameOver, playSound]);

  const moveRight = useCallback(() => {
    if (paused || gameOver) return;
    const nextPos = { ...currentPosition, x: currentPosition.x + 1 };
    if (!checkCollision(currentPiece.matrix, nextPos, grid)) {
      setCurrentPosition(nextPos);
      playSound('move');
    }
  }, [currentPosition, currentPiece, grid, checkCollision, paused, gameOver, playSound]);

  const rotate = useCallback(() => {
    if (paused || gameOver) return;
    const currentMatrix = currentPiece.matrix;
    // Transpose and reverse rows to rotate 90 deg clockwise
    const rotated = currentMatrix[0].map((_, index) =>
      currentMatrix.map((row) => row[index]).reverse()
    );

    // Dynamic kicks to rotate against barriers nicely
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const testPos = { ...currentPosition, x: currentPosition.x + kick };
      if (!checkCollision(rotated, testPos, grid)) {
        setCurrentPiece((prev) => ({ ...prev, matrix: rotated }));
        setCurrentPosition(testPos);
        playSound('rotate');
        return;
      }
    }
  }, [currentPiece, currentPosition, grid, checkCollision, paused, gameOver, playSound]);

  const softDrop = useCallback(() => {
    if (paused || gameOver) return;
    const nextPos = { ...currentPosition, y: currentPosition.y + 1 };
    if (!checkCollision(currentPiece.matrix, nextPos, grid)) {
      setCurrentPosition(nextPos);
      setScore((s) => s + 1);
    } else {
      lockPiece(currentPiece, currentPosition);
    }
  }, [currentPosition, currentPiece, grid, checkCollision, lockPiece, paused, gameOver]);

  const hardDrop = useCallback(() => {
    if (paused || gameOver) return;
    const landingY = getGhostY(currentPiece.matrix, currentPosition, grid);
    const dropDistance = landingY - currentPosition.y;
    
    setCurrentPosition({ ...currentPosition, y: landingY });
    setScore((s) => s + dropDistance * 2);
    lockPiece(currentPiece, { ...currentPosition, y: landingY });
  }, [currentPiece, currentPosition, grid, getGhostY, lockPiece, paused, gameOver]);

  const hold = useCallback(() => {
    if (paused || gameOver || hasHeld) return;
    
    playSound('rotate');
    const typeToHold = currentPiece.type;
    const freshHoldPiece = createTetromino(typeToHold);

    if (holdPiece === null) {
      setHoldPiece(freshHoldPiece);
      // Spawn next block
      const next = nextPiece;
      const newNext = getRandomPiece();
      setNextPiece(newNext);
      setCurrentPiece(next);
      setCurrentPosition({
        x: Math.floor((COLS - next.matrix[0].length) / 2),
        y: 0,
      });
    } else {
      const prevHold = holdPiece;
      setHoldPiece(freshHoldPiece);
      setCurrentPiece(createTetromino(prevHold.type));
      setCurrentPosition({
        x: Math.floor((COLS - prevHold.matrix[0].length) / 2),
        y: 0,
      });
    }
    setHasHeld(true);
  }, [holdPiece, currentPiece, nextPiece, hasHeld, paused, gameOver, playSound]);

  // Restart trigger
  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    const firstPiece = getRandomPiece();
    const secondPiece = getRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setCurrentPosition({
      x: Math.floor((COLS - firstPiece.matrix[0].length) / 2),
      y: 0,
    });
    setHoldPiece(null);
    setHasHeld(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setHasStarted(true);
    setClearingLines([]);
    playSound('rotate');
  }, [playSound]);

  // Fall tick loop
  useEffect(() => {
    if (paused || gameOver || clearingLines.length > 0) return;

    // Progression: speed gets faster as level grows
    const dropInterval = Math.max(80, 1000 - (level - 1) * 110);
    const id = setInterval(() => {
      softDrop();
    }, dropInterval);

    return () => clearInterval(id);
  }, [paused, gameOver, level, softDrop, clearingLines]);

  // Global keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setPaused((prev) => !prev);
        return;
      }

      if (paused || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'Shift':
        case 'c':
        case 'C':
          e.preventDefault();
          hold();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paused, gameOver, moveLeft, moveRight, rotate, softDrop, hardDrop, hold]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-neutral-800 font-sans flex flex-col items-center justify-center selection:bg-purple-100 selection:text-purple-700 antialiased relative overflow-x-hidden p-4 md:p-8">
      {/* Immersive background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(216,180,254,0.18)_0%,transparent_65%)] pointer-events-none -z-10" />

      {/* Main glass-container wrapper (900px width target with full responsiveness) */}
      <div className="w-full max-w-[940px] glass-container rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col p-6 md:p-8 relative z-10 my-auto">
        
        {/* Apple style Top Header */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.04]">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5 font-sans">
              TETRIS
              <span className="text-[#A855F7] font-bold">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Help Trigger */}
            <button
              onClick={() => setShowHelp((h) => !h)}
              className={`p-2 rounded-xl border ${
                showHelp
                  ? 'bg-purple-100/40 border-purple-200/60 text-[#A855F7]'
                  : 'bg-white/40 border-neutral-200/30 text-neutral-500 hover:bg-white/60'
              } smooth-transition`}
              title="도움말"
              id="help-button"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className={`p-2 rounded-xl border ${
                soundEnabled
                  ? 'bg-purple-100/40 border-purple-200/60 text-[#A855F7]'
                  : 'bg-white/40 border-neutral-200/30 text-neutral-400'
              } smooth-transition`}
              title="사운드 온/오프"
              id="sound-toggle"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={resetGame}
              className="p-2 rounded-xl border border-neutral-200/30 bg-white/40 hover:bg-white/60 text-neutral-500 smooth-transition"
              title="다시 시작"
              id="reset-button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => {
                if (gameOver) {
                  resetGame();
                } else {
                  if (paused) {
                    setHasStarted(true);
                  }
                  setPaused((p) => !p);
                }
              }}
              className={`px-4.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-bold smooth-transition ${
                paused || gameOver
                  ? 'bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] border border-[#9333EA]/30'
                  : 'bg-white/50 border border-neutral-200/30 text-neutral-700 hover:bg-white/80'
              }`}
              id="play-pause-button"
            >
              {gameOver ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  RESTART
                </>
              ) : paused ? (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  PLAY
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  PAUSE
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Help Modal Card */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase font-mono flex items-center gap-1">
                  <Keyboard className="w-3.5 h-3.5 text-purple-400" />
                  KEYBOARD SHORTCUTS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">Left / Right</kbd>
                    <span>이동</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">Up Arrow</kbd>
                    <span>회전</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">Down Arrow</kbd>
                    <span>소프트 드롭</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">Spacebar</kbd>
                    <span>하드 드롭</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">Shift / C</kbd>
                    <span>홀드 (보관)</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <kbd className="bg-white/70 border border-neutral-200/30 px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">P / Esc</kbd>
                    <span>일시정지</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Grid - Bento Style columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Column: Board Canvas (Left) */}
          <div className="md:col-span-7 flex justify-center">
            <GameBoard
              grid={grid}
              currentPiece={currentPiece}
              position={currentPosition}
              ghostY={ghostY}
              gameOver={gameOver}
              paused={paused}
              hasStarted={hasStarted}
              clearingLines={clearingLines}
            />
          </div>

          {/* Column: Dashboard stats & Controls (Right) */}
          <div className="md:col-span-5 flex flex-col gap-5 w-full">
            <GameStats
              score={score}
              highScore={highScore}
              level={level}
              lines={lines}
              nextPiece={nextPiece}
              holdPiece={holdPiece}
            />

            <GameControls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onRotate={rotate}
              onSoftDrop={softDrop}
              onHardDrop={hardDrop}
              onHold={hold}
              paused={paused}
              gameOver={gameOver}
            />
          </div>
        </div>
      </div>

      {/* Footer credits in minimal style */}
      <footer className="w-full text-center py-6 text-[9px] text-neutral-400/70 select-none">
        <div className="flex justify-center items-center gap-1 font-mono tracking-wider">
          <Sparkles className="w-3 h-3 text-[#A855F7] animate-pulse" />
          <span>FROSTED GLASS RETINA DESIGNS</span>
        </div>
      </footer>
    </div>
  );
}

