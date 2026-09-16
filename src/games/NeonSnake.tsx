import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Props {
  onBack: () => void;
}

export function NeonSnake({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('neonsnake-highscore', 0);
  
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Ensure food doesn't spawn on snake
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood([{ x: 10, y: 10 }]));
    setIsPaused(false);
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
        case 'Escape':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (direction) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    // Increase speed slightly as snake gets longer, up to a limit
    const currentSpeed = Math.max(50, INITIAL_SPEED - (snake.length * 2));
    const intervalId = setInterval(moveSnake, currentSpeed);
    
    return () => clearInterval(intervalId);
  }, [gameState, direction, food, isPaused, generateFood, handleGameOver, snake.length]);

  return (
    <GameWrapper
      title="Neon Snake"
      description="Classic snake with a cyberpunk twist. Collect glowing orbs and grow."
      guide="• Use W, A, S, D or Arrow Keys to move the snake.\n• Eat the glowing cyan orbs to grow longer and increase your score.\n• Do not hit the walls or your own tail!\n• Press Spacebar to Pause."
      theme="action"
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
          <div 
            className="relative bg-zinc-950 border border-zinc-800 shadow-[0_0_30px_rgba(8,145,178,0.15)] rounded-lg w-full max-w-sm sm:max-w-md aspect-square overflow-hidden"
          >
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" style={{ backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` }} />
            
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm ${index === 0 ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10' : 'bg-cyan-600/80'}`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `${100/GRID_SIZE}%`,
                  height: `${100/GRID_SIZE}%`,
                  transition: 'all 0.1s linear'
                }}
              />
            ))}
            
            {/* Food */}
            <div
              className="absolute bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-pulse"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100/GRID_SIZE}%`,
                height: `${100/GRID_SIZE}%`
              }}
            />

            {isPaused && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                <span className="text-white font-mono text-2xl font-bold tracking-widest">PAUSED</span>
              </div>
            )}
          </div>

          {/* Mobile D-Pad */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden">
            <div />
            <button 
              className="bg-zinc-800 p-4 rounded-xl active:bg-cyan-600 active:scale-95 transition-all"
              onClick={() => { if(direction !== 'DOWN') setDirection('UP') }}
            >
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-white mx-auto" />
            </button>
            <div />
            <button 
              className="bg-zinc-800 p-4 rounded-xl active:bg-cyan-600 active:scale-95 transition-all"
              onClick={() => { if(direction !== 'RIGHT') setDirection('LEFT') }}
            >
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-white mx-auto" />
            </button>
            <button 
              className="bg-zinc-800 p-4 rounded-xl active:bg-cyan-600 active:scale-95 transition-all"
              onClick={() => { if(direction !== 'UP') setDirection('DOWN') }}
            >
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-white mx-auto" />
            </button>
            <button 
              className="bg-zinc-800 p-4 rounded-xl active:bg-cyan-600 active:scale-95 transition-all"
              onClick={() => { if(direction !== 'LEFT') setDirection('RIGHT') }}
            >
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[15px] border-l-white mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
