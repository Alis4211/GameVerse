import { useState } from 'react';
import { Hub } from './pages/Hub';
import { NeonSnake } from './games/NeonSnake';
import { MemoryMatrix } from './games/MemoryMatrix';
import { SpeedTyper } from './games/SpeedTyper';
import { OrbitalDodge } from './games/OrbitalDodge';
import { SimonsSequence } from './games/SimonsSequence';

function App() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const renderGame = () => {
    switch (currentGame) {
      case 'snake': return <NeonSnake onBack={() => setCurrentGame(null)} />;
      case 'memory': return <MemoryMatrix onBack={() => setCurrentGame(null)} />;
      case 'typer': return <SpeedTyper onBack={() => setCurrentGame(null)} />;
      case 'dodge': return <OrbitalDodge onBack={() => setCurrentGame(null)} />;
      case 'simon': return <SimonsSequence onBack={() => setCurrentGame(null)} />;
      default:
        return (
          <div className="flex h-screen items-center justify-center text-white flex-col gap-4">
            <h1 className="text-3xl">Game in development...</h1>
            <button 
              className="px-4 py-2 bg-zinc-800 rounded"
              onClick={() => setCurrentGame(null)}
            >
              Go Back
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {currentGame ? (
        renderGame()
      ) : (
        <Hub onSelectGame={setCurrentGame} />
      )}
    </>
  );
}

export default App;
