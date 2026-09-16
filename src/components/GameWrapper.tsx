import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Trophy, Home, RotateCcw, Play, HelpCircle, X, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameWrapperProps {
  title: string;
  description: string;
  guide?: string;
  theme?: 'action' | 'ambient' | 'tense' | 'hub' | 'none';
  menuOverlay?: ReactNode;
  gameState: 'menu' | 'playing' | 'gameover';
  score: number;
  highScore: number;
  encouragementMode?: 'discrete' | 'milestone' | 'none';
  onStart: () => void;
  onRestart: () => void;
  onBackToHub: () => void;
  children: ReactNode;
}

export function GameWrapper({
  title,
  description,
  guide,
  theme = 'action',
  menuOverlay,
  gameState,
  score,
  highScore,
  encouragementMode = 'discrete',
  onStart,
  onRestart,
  onBackToHub,
  children
}: GameWrapperProps) {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  
  // Encouragement system
  const [prevScore, setPrevScore] = useState(score);
  const [encouragement, setEncouragement] = useState<{ id: number, text: string } | null>(null);

  useEffect(() => {
    if (gameState === 'playing' && score > prevScore && score > 0 && encouragementMode !== 'none') {
      let shouldShow = false;
      
      if (encouragementMode === 'discrete') {
        shouldShow = true;
      } else if (encouragementMode === 'milestone') {
        // Only show every 500 points for continuous scoring games
        if (Math.floor(score / 500) > Math.floor(prevScore / 500)) {
          shouldShow = true;
        }
      }

      if (shouldShow) {
        const words = ["Great!", "Awesome!", "Perfect!", "Nice!", "Good!", "Super!", "Wow!", "Excellent!", "Brilliant!"];
        const word = words[Math.floor(Math.random() * words.length)];
        setEncouragement({ id: Date.now(), text: word });
      }
    }
    setPrevScore(score);
  }, [score, prevScore, gameState, encouragementMode]);

  // Clear encouragement when game ends
  useEffect(() => {
    if (gameState !== 'playing') {
      setEncouragement(null);
      setPrevScore(0);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      soundManager.startBGM(theme);
    } else {
      soundManager.stopBGM();
    }
    
    const unsubscribe = soundManager.subscribe((muted) => setIsMuted(muted));
    return () => {
      unsubscribe();
      soundManager.stopBGM();
    };
  }, [gameState, theme]);

  const bgImage = (() => {
    switch (title) {
      case 'Neon Snake': return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200';
      case 'Memory Matrix': return 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200';
      case 'Speed Typer': return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200';
      case 'Orbital Dodge': return 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200';
      case "Simon's Sequence": return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200';
      default: return '';
    }
  })();

  return (
    <div className="flex flex-col w-full h-screen bg-zinc-950 text-white overflow-hidden relative">
      
      {/* Background Image */}
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      {/* Top HUD */}
      <div className="flex-none w-full p-4 flex justify-between items-center bg-zinc-950/80 border-b border-zinc-800 shadow-md z-10 backdrop-blur-md">
        <div className="flex gap-2">
          <button 
            onClick={onBackToHub}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors shadow-sm text-sm sm:text-base font-bold"
          >
            <Home size={18} /> <span className="hidden sm:inline">Hub</span>
          </button>
          {guide && (
            <button 
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-900/50 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300 rounded-lg transition-colors shadow-sm text-sm sm:text-base font-bold"
            >
              <HelpCircle size={18} /> <span className="hidden sm:inline">Guide</span>
            </button>
          )}
        </div>
        
        <div className="flex gap-4 sm:gap-6 font-mono text-base sm:text-xl">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider">Score</span>
            <span className="text-cyan-400 font-black">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider">Best</span>
            <span className="text-amber-400 font-black flex items-center gap-1">
              <Trophy size={14} className="sm:w-4 sm:h-4" /> {highScore}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => soundManager.toggleMute()}
            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="flex-1 relative w-full h-full overflow-hidden z-0">
        {/* Play Area */}
        <div className="absolute inset-0">
          {children}
        </div>

        {/* Encouragement Overlay */}
        {encouragement && (
          <div 
            key={encouragement.id} 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-40 flex items-center justify-center animate-encouragement"
          >
            <span className="text-4xl sm:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-tr from-yellow-400 via-amber-300 to-orange-500 drop-shadow-[0_10px_20px_rgba(251,191,36,0.5)] transform -rotate-6">
              {encouragement.text}
            </span>
          </div>
        )}

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center z-20 backdrop-blur-md p-4 text-center">
            <h1 className="text-5xl sm:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="text-zinc-300 mb-8 max-w-md text-sm sm:text-base leading-relaxed">{description}</p>
            
            {menuOverlay}

            <button 
              onClick={onStart}
              className="mt-6 flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.5)]"
            >
              <Play fill="currentColor" size={24} /> PLAY NOW
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-20 backdrop-blur-md p-4 text-center animate-in fade-in duration-300">
            <h2 className="text-5xl sm:text-7xl font-black text-red-500 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h2>
            <div className="text-2xl sm:text-3xl font-mono mb-8 text-zinc-200">
              Final Score: <span className="text-white font-black">{score}</span>
            </div>
            <button 
              onClick={onRestart}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
            >
              <RotateCcw size={24} /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      {showGuideModal && guide && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <HelpCircle size={28} />
              <h2 className="text-2xl font-black">How to Play</h2>
            </div>
            <div className="text-zinc-300 space-y-4 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {guide}
            </div>
            <button 
              onClick={() => setShowGuideModal(false)}
              className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
