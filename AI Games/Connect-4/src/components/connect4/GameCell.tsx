'use client';

import type { CellState, Player } from '@/types/connect4';
import { cn } from '@/lib/utils';

interface GameCellProps {
  state: CellState;
  isWinning: boolean;
  isAnimating?: boolean; // To trigger animation
}

export default function GameCell({ state, isWinning, isAnimating }: GameCellProps) {
  const playerColors: Record<Player, string> = {
    1: 'bg-primary', // Player 1 - Deep Blue
    2: 'bg-accent',  // Player 2 - Yellow-Orange
  };

  return (
    <div
      className={cn(
        'aspect-square w-full rounded-full flex items-center justify-center bg-background/70 border-2 border-muted shadow-inner',
        isWinning && 'ring-4 ring-offset-2 ring-green-500' 
      )}
      aria-label={`Cell: ${state === 0 ? 'Empty' : `Player ${state}`}${isWinning ? ' (Winning)' : ''}`}
    >
      {state !== 0 && (
        <div
          className={cn(
            'w-5/6 h-5/6 rounded-full shadow-md',
            playerColors[state as Player],
            isAnimating && 'animate-drop'
          )}
        />
      )}
    </div>
  );
}
