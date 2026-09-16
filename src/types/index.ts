export type GameState = 'menu' | 'playing' | 'gameover';

export interface BaseGameProps {
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  isPaused?: boolean;
}
