import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../components/GameWrapper';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Cpu, Database, Fingerprint, Network, Radio, Server, Shield, Wifi } from 'lucide-react';

const ICONS = [Cpu, Database, Fingerprint, Network, Radio, Server, Shield, Wifi];

interface Card {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  onBack: () => void;
}

export function MemoryMatrix({ onBack }: Props) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  // High score in memory game means fewer moves or faster time. Let's do a basic score based on consecutive matches or just time.
  // Actually, let's just make score = matches * 100 - moves * 10, high score is the max of that.
  const [highScore, setHighScore] = useLocalStorage('memorymatrix-highscore', 0);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const initializeGame = useCallback(() => {
    const pairedIcons = [...ICONS, ...ICONS];
    // Shuffle
    for (let i = pairedIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairedIcons[i], pairedIcons[j]] = [pairedIcons[j], pairedIcons[i]];
    }

    const newCards: Card[] = pairedIcons.map((icon, index) => ({
      id: index,
      iconIndex: ICONS.indexOf(icon),
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setIsLocked(false);
  }, []);

  const startGame = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newFlippedIndices = [...flippedIndices, index];
    
    // Optimistically flip the card
    setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[index]; // The one just clicked

      if (firstCard.iconIndex === secondCard.iconIndex) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            (i === firstIndex || i === secondIndex) ? { ...card, isMatched: true } : card
          ));
          setFlippedIndices([]);
          setMatches(m => m + 1);
          
          const currentScore = (matches + 1) * 100 - (moves + 1) * 5;
          setScore(Math.max(0, currentScore));
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            (i === firstIndex || i === secondIndex) ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (matches === ICONS.length && gameState === 'playing') {
      setTimeout(() => {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
        }
      }, 1000);
    }
  }, [matches, gameState, score, highScore, setHighScore]);

  return (
    <GameWrapper
      title="Memory Matrix"
      description="Test your cognitive limits. Match futuristic pairs quickly."
      guide="• Click on a tile to reveal its symbol.\n• Try to find the matching symbol by clicking another tile.\n• If they match, they stay revealed. If not, they flip back.\n• Match all pairs in the fewest moves possible to get a higher score."
      theme="ambient"
      gameState={gameState}
      score={score}
      highScore={highScore}
      onStart={startGame}
      onRestart={startGame}
      onBackToHub={onBack}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        {gameState === 'playing' && (
          <div className="mb-4 text-zinc-400 font-mono flex gap-4 sm:gap-8 text-sm sm:text-base">
            <span>MOVES: <span className="text-white">{moves}</span></span>
            <span>MATCHES: <span className="text-cyan-400">{matches}/{ICONS.length}</span></span>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg perspective-1000">
          {cards.map((card, index) => {
            const IconComponent = ICONS[card.iconIndex];
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`
                  relative aspect-square w-full rounded-xl transition-all duration-500 transform-style-3d
                  ${(card.isFlipped || card.isMatched) ? 'rotate-y-180' : ''}
                `}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front (Hidden state) */}
                <div className={`
                  absolute inset-0 backface-hidden bg-zinc-800 rounded-xl border border-zinc-700
                  flex items-center justify-center hover:bg-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer
                  ${(card.isFlipped || card.isMatched) ? 'invisible' : 'visible'}
                `}>
                  <div className="w-12 h-12 border-2 border-zinc-600 rounded-full flex items-center justify-center opacity-50">
                    <span className="text-zinc-600 font-bold text-xl">?</span>
                  </div>
                </div>

                {/* Back (Revealed state) */}
                <div 
                  className={`
                    absolute inset-0 backface-hidden rounded-xl border flex items-center justify-center shadow-lg
                    ${card.isMatched 
                      ? 'bg-zinc-900 border-cyan-500 shadow-cyan-500/20 text-cyan-400' 
                      : 'bg-zinc-800 border-blue-400 text-blue-400'
                    }
                    ${!(card.isFlipped || card.isMatched) ? 'hidden' : ''}
                  `}
                >
                  <IconComponent size={48} className={card.isMatched ? 'animate-pulse' : ''} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GameWrapper>
  );
}
