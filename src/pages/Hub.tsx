import { Gamepad2, BrainCircuit, Keyboard, Rocket, Palette } from 'lucide-react';

interface HubProps {
  onSelectGame: (gameId: string) => void;
}

const GAMES = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Classic snake with a cyberpunk twist. Collect glowing orbs and grow.',
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-700',
    shadow: 'shadow-green-500/20',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'memory',
    title: 'Memory Matrix',
    description: 'Test your cognitive limits. Match futuristic pairs quickly.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-indigo-700',
    shadow: 'shadow-blue-500/20',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'typer',
    title: 'Speed Typer',
    description: 'Defend your base by typing incoming words before they hit you.',
    icon: Keyboard,
    color: 'from-orange-500 to-red-700',
    shadow: 'shadow-orange-500/20',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'dodge',
    title: 'Orbital Dodge',
    description: 'Pilot your ship through an asteroid field and collect power-ups.',
    icon: Rocket,
    color: 'from-purple-500 to-fuchsia-700',
    shadow: 'shadow-purple-500/20',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'simon',
    title: "Simon's Sequence",
    description: 'Follow the pattern. Repeat the flashing colors correctly to advance.',
    icon: Palette,
    color: 'from-pink-500 to-rose-700',
    shadow: 'shadow-pink-500/20',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800'
  }
];

export function Hub({ onSelectGame }: HubProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 overflow-y-auto">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 pb-20">
        <header className="mb-12 sm:mb-20 text-center pt-8 sm:pt-16">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter animate-pulse">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              ARCADE NEXUS
            </span>
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-400 font-mono tracking-widest uppercase">Select your challenge</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className={`group relative flex flex-col p-0 rounded-3xl bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-400 transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl ${game.shadow} text-left overflow-hidden`}
              >
                {/* Image Section */}
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-zinc-900 z-0">
                    <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
                  <div className={`absolute top-4 left-4 z-20 p-3 rounded-2xl bg-gradient-to-br ${game.color} bg-opacity-90 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="relative z-20 p-6 sm:p-8 bg-zinc-900 flex-1 flex flex-col">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
                  
                  <h2 className="text-2xl sm:text-3xl font-black mb-3 text-zinc-100 group-hover:text-white tracking-tight">{game.title}</h2>
                  <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed font-medium flex-1">
                    {game.description}
                  </p>
                  
                  <div className="mt-6 inline-flex items-center text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transform translate-x-[-20px] group-hover:translate-x-0 transition-all duration-300">
                    PLAY NOW <span className="ml-2 animate-bounce">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
