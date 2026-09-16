import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { soundManager } from '../utils/audio';

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400'];
const ACTIVE_COLORS = ['bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-200'];

interface Props {
  onBack: () => void;
}

export function SimonsSequence({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('simonssequence-highscore', 0);
  
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const playSequence = useCallback(async (currentSeq: number[]) => {
    setIsPlayingSequence(true);
    
    // Brief pause before playing
    await new Promise(resolve => setTimeout(resolve, 800));

    for (let i = 0; i < currentSeq.length; i++) {
      if (gameState !== 'playing') break; // Handle unmount/gameover during playback
      
      setActiveButton(currentSeq[i]);
      // Play a distinct note for each color
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C(high)
      soundManager.playBeep(freqs[currentSeq[i]], 'sine', 0.4, 0.1);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsPlayingSequence(false);
  }, [gameState]);

  useEffect(() => {
    // Start a new sequence when moving to playing state or leveling up
    if (gameState === 'playing' && sequence.length === 0) {
      setIsPlayingSequence(true); // immediately show WATCH text
      const newColor = Math.floor(Math.random() * 4);
      setSequence([newColor]);
      
      // Delay the first flash slightly so the player is ready
      setTimeout(() => {
        playSequence([newColor]);
      }, 500);
    }
  }, [gameState, sequence.length, playSequence]);

  const nextRound = useCallback((currentSeq: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerIndex(0);
    playSequence(newSeq);
  }, [playSequence]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSequence([]);
    setPlayerIndex(0);
    setActiveButton(null);
    // Removed nextRound([]) so that the useEffect handles the first color properly!
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  const handleButtonClick = (index: number) => {
    if (isPlayingSequence || gameState !== 'playing') return;

    setActiveButton(index);
    const freqs = [261.63, 329.63, 392.00, 523.25];
    soundManager.playBeep(freqs[index], 'sine', 0.2, 0.1);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveButton(null), 200);

    if (index === sequence[playerIndex]) {
      // Correct
      const nextIndex = playerIndex + 1;
      setPlayerIndex(nextIndex);
      
      if (nextIndex === sequence.length) {
        // Round complete
        setScore(sequence.length);
        setIsPlayingSequence(true); // Disable input while waiting
        setTimeout(() => {
          nextRound(sequence);
        }, 500);
      }
    } else {
      // Wrong
      handleGameOver();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <GameWrapper
      title="Simon's Sequence"
      description="Follow the pattern. Repeat the flashing colors correctly to advance."
      guide="• Watch the pads flash in a specific sequence.\n• Wait for the text to say 'YOUR TURN'.\n• Click the pads in the exact same order they flashed.\n• Each round, the sequence gets one step longer!"
      theme="none"
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-950">
        
        {gameState === 'playing' && (
          <div className="mb-8 text-xl font-mono">
            {isPlayingSequence ? (
              <span className="text-zinc-400 animate-pulse">WATCH...</span>
            ) : (
              <span className="text-cyan-400">YOUR TURN</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full max-w-[320px] aspect-square rounded-full p-4 bg-zinc-900 border-8 border-zinc-800 shadow-2xl">
          {[0, 1, 2, 3].map(index => {
            const isActive = activeButton === index;
            // Map index to specific border radiuses to make the classic Simon circle
            const borderRadiusClasses = [
              'rounded-tl-full rounded-tr-xl rounded-bl-xl rounded-br-sm',
              'rounded-tr-full rounded-tl-xl rounded-br-xl rounded-bl-sm',
              'rounded-bl-full rounded-tl-xl rounded-br-xl rounded-tr-sm',
              'rounded-br-full rounded-tr-xl rounded-bl-xl rounded-tl-sm'
            ][index];

            return (
              <button
                key={index}
                disabled={isPlayingSequence || gameState !== 'playing'}
                onClick={() => handleButtonClick(index)}
                className={`
                  w-full h-full transition-all duration-100 border-4 border-zinc-900
                  ${borderRadiusClasses}
                  ${isActive ? ACTIVE_COLORS[index] + ' scale-[0.98] drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : COLORS[index]}
                  ${(!isPlayingSequence && gameState === 'playing') ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                `}
              />
            );
          })}
          
          {/* Center piece */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-zinc-900 rounded-full border-8 border-zinc-800 flex items-center justify-center">
             <span className="text-zinc-600 font-black text-2xl tracking-tighter">SEQ</span>
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
