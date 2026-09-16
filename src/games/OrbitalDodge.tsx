import { useState, useEffect, useRef, useCallback } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameLoop } from '../hooks/useGameLoop';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: 'asteroid' | 'powerup';
}

interface Props {
  onBack: () => void;
}

export function OrbitalDodge({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('orbitaldodge-highscore', 0);
  
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  const nextObstacleId = useRef(0);
  const timeSinceLastSpawn = useRef(0);
  const gameSpeedMultiplier = useRef(1);
  const scoreRef = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  const spawnObstacle = useCallback(() => {
    const isPowerup = Math.random() < 0.1; // 10% chance
    const size = isPowerup ? 4 : (4 + Math.random() * 8); // asteroid size 4 to 12
    const x = Math.random() * (100 - size);
    
    setObstacles(prev => [
      ...prev,
      {
        id: nextObstacleId.current++,
        x,
        y: -10,
        size,
        speed: (0.04 + Math.random() * 0.04) * gameSpeedMultiplier.current,
        type: isPowerup ? 'powerup' : 'asteroid'
      }
    ]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setPlayerX(50);
    setObstacles([]);
    nextObstacleId.current = 0;
    timeSinceLastSpawn.current = 0;
    gameSpeedMultiplier.current = 1;
    keys.current = {};
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (scoreRef.current > highScore) {
      setHighScore(Math.floor(scoreRef.current));
    }
  }, [highScore, setHighScore]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useGameLoop((deltaTime) => {
    if (gameState !== 'playing') return;

    // Move player
    setPlayerX(prev => {
      let newX = prev;
      if (keys.current['ArrowLeft'] || keys.current['a']) newX -= 0.05 * deltaTime;
      if (keys.current['ArrowRight'] || keys.current['d']) newX += 0.05 * deltaTime;
      return Math.max(0, Math.min(100, newX));
    });

    // Score ticks up over time
    scoreRef.current += deltaTime * 0.01;
    setScore(Math.floor(scoreRef.current));
    gameSpeedMultiplier.current = 1 + (scoreRef.current / 500); // gets faster

    // Spawning
    timeSinceLastSpawn.current += deltaTime;
    const currentSpawnRate = Math.max(200, 1000 - (scoreRef.current * 2));
    
    if (timeSinceLastSpawn.current > currentSpawnRate) {
      spawnObstacle();
      timeSinceLastSpawn.current = 0;
    }

    // Move obstacles and collision
    setObstacles(prev => {
      let gameOver = false;
      const nextObstacles: Obstacle[] = [];
      const playerRadius = 3; // rough percentage radius for collision

      for (const obs of prev) {
        const newY = obs.y + (obs.speed * deltaTime);
        
        // Check collision
        // Simplified AABB collision using percentages
        // Player is at x: playerX, y: 90
        const isXCollision = (playerX + playerRadius > obs.x) && (playerX - playerRadius < obs.x + obs.size);
        const isYCollision = (90 + playerRadius > newY) && (90 - playerRadius < newY + obs.size);

        if (isXCollision && isYCollision) {
          if (obs.type === 'asteroid') {
            gameOver = true;
          } else {
            // Powerup
            scoreRef.current += 100;
            setScore(Math.floor(scoreRef.current));
            continue; // don't keep powerup
          }
        }

        if (newY < 110) {
          nextObstacles.push({ ...obs, y: newY });
        }
      }

      if (gameOver) {
        handleGameOver();
      }

      return nextObstacles;
    });
  }, gameState === 'playing');

  return (
    <GameWrapper
      title="Orbital Dodge"
      description="Pilot your ship through a dense asteroid field. Use Left/Right arrows or A/D to move."
      guide="• Press Left / Right Arrow Keys (or A / D) to steer your ship.\n• Dodge the gray asteroids falling towards you.\n• Collect the bouncing yellow orbs for bonus points!\n• The game speeds up the longer you survive."
      theme="action"
      gameState={gameState}
      score={score}
      highScore={highScore}
      encouragementMode="milestone"
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full relative overflow-hidden bg-zinc-950 flex flex-col">
        <div className="flex-1 relative w-full overflow-hidden">
          {/* Player Ship */}
          <div
            className="absolute bottom-8 w-10 h-10 -ml-5 bg-cyan-500 rounded-t-full shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-75 z-10 flex justify-center"
            style={{ left: `${playerX}%` }}
          >
            {/* Thruster flame */}
            <div className="absolute -bottom-4 w-4 h-6 bg-orange-500 rounded-b-full animate-pulse blur-[2px]" />
          </div>

          {/* Obstacles / Orbs */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className={`absolute rounded-sm ${
                obs.type === 'asteroid' 
                  ? 'bg-zinc-600 border border-zinc-500 shadow-xl' 
                  : 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] rounded-full animate-bounce'
              }`}
              style={{
                left: `${obs.x}%`,
                top: `${obs.y}%`,
                width: `${obs.size}%`,
                height: `${obs.size}%`,
                transform: obs.type === 'asteroid' ? `rotate(${obs.id * 45}deg)` : 'none'
              }}
            />
          ))}

          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 font-mono text-zinc-400 font-bold z-20">
              SPEED MULTIPLIER: <span className="text-white">{(gameSpeedMultiplier.current * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        {gameState === 'playing' && (
          <div className="flex justify-between w-full max-w-lg px-4 pb-4 sm:hidden mx-auto mt-2 z-50 relative">
            <button 
              className="bg-zinc-800/80 backdrop-blur p-6 rounded-2xl active:bg-cyan-600 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex-1 mr-2 flex justify-center items-center"
              onPointerDown={(e) => { e.preventDefault(); setPlayerX(prev => Math.max(5, prev - 10)); }}
            >
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[20px] border-r-white mx-auto" />
            </button>
            <button 
              className="bg-zinc-800/80 backdrop-blur p-6 rounded-2xl active:bg-cyan-600 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex-1 ml-2 flex justify-center items-center"
              onPointerDown={(e) => { e.preventDefault(); setPlayerX(prev => Math.min(95, prev + 10)); }}
            >
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[20px] border-l-white mx-auto" />
            </button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
