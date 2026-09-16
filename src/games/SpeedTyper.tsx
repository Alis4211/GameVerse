import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGameLoop } from '../hooks/useGameLoop';

const WORDS = [
  "algorithm", "bandwidth", "compile", "database", "encryption", 
  "firewall", "gateway", "hardware", "iteration", "javascript", 
  "kernel", "latency", "malware", "network", "offline", 
  "protocol", "query", "router", "server", "terminal", 
  "uptime", "variable", "webhook", "xml", "yield", "zip",
  "cyber", "neon", "matrix", "hacker", "proxy", "mainframe"
];

interface FallingWord {
  id: number;
  text: string;
  y: number;
  x: number;
  speed: number;
}

interface Props {
  onBack: () => void;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

export function SpeedTyper({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useLocalStorage('speedtyper-highscore', 0);
  
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  const nextWordId = useRef(0);
  const timeSinceLastSpawn = useRef(0);
  
  // Game logic refs
  const baseSpeed = useRef(0.02);
  const spawnRate = useRef(3000);
  const wordsToSpawn = useRef(1);

  const getDifficultySettings = (diff: Difficulty, currentLevel: number) => {
    let speed = 0.011; 
    let rate = 3000;
    let spawnCount = 1;

    if (diff === 'Intermediate') {
      speed = 0.0157;
      rate = 2000;
    } else if (diff === 'Expert') {
      speed = 0.022;
      rate = 1500;
    }

    speed += ((currentLevel - 1) * 0.001);
    rate = Math.max(800, rate - ((currentLevel - 1) * 150));
    spawnCount = 1 + Math.floor((currentLevel - 1) / 5);

    return { speed, rate, spawnCount };
  };

  const spawnWord = useCallback(() => {
    setWords(prev => {
      const newWords = [...prev];
      for (let i = 0; i < wordsToSpawn.current; i++) {
        const text = WORDS[Math.floor(Math.random() * WORDS.length)];
        const x = 10 + Math.random() * 70;
        const yOffset = i * -15; 

        newWords.push({
          id: nextWordId.current++,
          text,
          x,
          y: -10 + yOffset,
          speed: baseSpeed.current + (Math.random() * 0.005)
        });
      }
      return newWords;
    });
  }, []);

  const startGame = () => {
    const settings = getDifficultySettings(difficulty, 1);
    baseSpeed.current = settings.speed;
    spawnRate.current = settings.rate;
    wordsToSpawn.current = settings.spawnCount;

    setGameState('playing');
    setScore(0);
    setLevel(1);
    setWords([]);
    setCurrentInput('');
    nextWordId.current = 0;
    timeSinceLastSpawn.current = 0;
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  useEffect(() => {
    if (score > 0 && score % 100 === 0) {
      const newLevel = Math.floor(score / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        const settings = getDifficultySettings(difficulty, newLevel);
        baseSpeed.current = settings.speed;
        spawnRate.current = settings.rate;
        wordsToSpawn.current = settings.spawnCount;
      }
    }
  }, [score, level, difficulty]);

  useEffect(() => {
    if (!currentInput) return;
    const lowerInput = currentInput.toLowerCase().trim();
    const matchIndex = words.findIndex(w => w.text === lowerInput);
    
    if (matchIndex !== -1) {
      setScore(s => s + 10);
      setWords(prev => {
        const next = [...prev];
        next.splice(matchIndex, 1);
        return next;
      });
      setCurrentInput('');
    }
  }, [currentInput, words]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCurrentInput('');
    }
  };

  useGameLoop((deltaTime) => {
    if (gameState !== 'playing') return;

    timeSinceLastSpawn.current += deltaTime;
    if (timeSinceLastSpawn.current > spawnRate.current) {
      spawnWord();
      timeSinceLastSpawn.current = 0;
    }

    setWords(prevWords => {
      let gameOver = false;
      const nextWords = prevWords.map(w => {
        const newY = w.y + (w.speed * deltaTime);
        if (newY > 100) {
          gameOver = true;
        }
        return { ...w, y: newY };
      });

      if (gameOver) {
        handleGameOver();
      }

      return nextWords;
    });
  }, gameState === 'playing');

  return (
    <GameWrapper
      title="Speed Typer"
      description="Type the falling words before they reach the bottom of the screen to defend your base."
      guide="• Words will fall from the top of the screen.\n• Type the words exactly as they appear.\n• You do NOT need to press Enter when finishing a word.\n• If you make a mistake, press Enter or Space to clear your input instantly!\n• If a single word reaches the bottom red line, it is GAME OVER!"
      theme="tense"
      menuOverlay={
        <div className="flex flex-col items-center w-full">
          <span className="text-zinc-400 mb-4 uppercase text-sm font-bold tracking-wider">Select Difficulty</span>
          <div className="flex gap-4">
            {(['Beginner', 'Intermediate', 'Expert'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm sm:text-base ${
                  difficulty === diff 
                    ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      }
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full relative overflow-hidden bg-zinc-950 flex flex-col">
        
        {/* HUD Stats */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 font-mono text-zinc-400 text-sm sm:text-base">
            <p>LEVEL: <span className="text-white font-bold">{level}</span></p>
            <p>DIFFICULTY: <span className="text-orange-400">{difficulty}</span></p>
          </div>
        )}

        {/* Play Area */}
        <div className="flex-1 relative w-full overflow-hidden" onClick={() => {
          // Focus input when clicking anywhere on the game area
          const input = document.getElementById('typer-input');
          if (input) input.focus();
        }}>
          {words.map(word => {
            const isMatching = currentInput.length > 0 && word.text.startsWith(currentInput);
            
            return (
              <div
                key={word.id}
                className={`absolute text-lg sm:text-2xl font-mono px-2 sm:px-3 py-1 rounded-md bg-zinc-900/80 backdrop-blur-sm border transition-colors duration-75 whitespace-nowrap
                  ${isMatching ? 'border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110 z-20' : 'border-zinc-800 text-zinc-400 z-10'}`}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                {isMatching ? (
                  <>
                    <span className="text-white bg-orange-600/30 rounded-sm">{word.text.slice(0, currentInput.length)}</span>
                    <span>{word.text.slice(currentInput.length)}</span>
                  </>
                ) : (
                  word.text
                )}
              </div>
            );
          })}
        </div>

        {/* Defense Line */}
        <div className="w-full h-2 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-30 relative" />
        
        {/* Input Area (Bottom docked) */}
        {gameState === 'playing' && (
          <div className="w-full bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 p-4 flex flex-col items-center justify-center z-40">
            <span className="text-xs text-zinc-500 mb-1 uppercase tracking-widest font-bold">Targeting</span>
            <input
              id="typer-input"
              type="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase())}
              onKeyDown={handleKeyDown}
              placeholder="Type to defend..."
              className="h-12 sm:h-14 px-6 min-w-[200px] w-full max-w-md bg-zinc-950 border-2 border-zinc-700 focus:border-orange-500 focus:outline-none rounded-full text-center text-xl sm:text-2xl font-mono text-white shadow-xl transition-colors placeholder:text-zinc-700"
            />
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
