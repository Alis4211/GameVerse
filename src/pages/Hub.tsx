import { useState, useEffect } from 'react';
import { Gamepad2, BrainCircuit, Keyboard, Rocket, Palette, Play, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HubProps {
  onSelectGame: (gameId: string) => void;
}

const GAMES = [
  { 
    id: 'snake', 
    title: 'Neon Snake', 
    description: 'Classic snake with a cyberpunk twist. Collect glowing orbs and grow.',
    icon: Gamepad2, 
    color: 'text-cyan-400',
    bg: 'bg-cyan-950',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'memory', 
    title: 'Memory Matrix', 
    description: 'Test your cognitive limits. Match futuristic pairs quickly.',
    icon: BrainCircuit, 
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-950',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'typer', 
    title: 'Speed Typer', 
    description: 'Defend your base by typing falling words before they hit the ground.',
    icon: Keyboard, 
    color: 'text-orange-400',
    bg: 'bg-orange-950',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'dodge', 
    title: 'Orbital Dodge', 
    description: 'Pilot your ship through a dense asteroid field.',
    icon: Rocket, 
    color: 'text-emerald-400',
    bg: 'bg-emerald-950',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'simon', 
    title: "Simon's Sequence", 
    description: 'Follow the pattern. Repeat the flashing colors correctly to advance.',
    icon: Palette, 
    color: 'text-yellow-400',
    bg: 'bg-yellow-950',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800'
  }
];

export function Hub({ onSelectGame }: HubProps) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  useEffect(() => {
    // Start hub music when loaded
    soundManager.startBGM('hub');
    
    // Subscribe to global mute changes
    const unsubscribe = soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    
    return () => {
      unsubscribe();
      soundManager.stopBGM();
    };
  }, []);

  const handleGameSelect = (id: string) => {
    soundManager.playBeep(880, 'sine', 0.2); // Select sound
    setSelectedGame(id);
    setTimeout(() => {
      onSelectGame(id);
    }, 400); // Wait for transition
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Mute Button */}
      <button
        onClick={() => soundManager.toggleMute()}
        className="absolute top-4 right-4 z-50 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors border border-zinc-800"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Title */}
      <div className="text-center mb-12 relative z-10 animate-in fade-in slide-in-from-top-10 duration-1000 mt-16 sm:mt-0">
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Game Verse
          </span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl font-mono tracking-widest uppercase">
          Select Your Challenge
        </p>
      </div>

      {/* Game Grid - scaled down with smaller cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl w-full relative z-10 pb-20 transition-all duration-500 ${selectedGame ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {GAMES.map((game, i) => {
          const Icon = game.icon;
          const isHovered = hoveredGame === game.id;
          
          return (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden text-left transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl shadow-black/50"
              style={{
                animationDelay: `${i * 100}ms`,
                boxShadow: isHovered ? `0 20px 40px -10px rgba(0,0,0,0.7)` : ''
              }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${game.image})` }}
              />
              
              {/* Dark Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${game.bg} to-transparent transition-opacity duration-300 opacity-80 group-hover:opacity-90`} />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <Icon size={40} className={`mb-4 ${game.color} transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-2`} />
                <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                
                {/* Play Now Bar */}
                <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'h-8 opacity-100 mt-2' : 'h-0 opacity-0'}`}>
                  <span className={`inline-flex items-center gap-2 font-bold ${game.color}`}>
                    PLAY NOW <Play size={16} fill="currentColor" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
