"use client";

import type { Player } from '@/lib/game-logic';
import { Loader2 } from 'lucide-react';

interface GameStatusProps {
  winner: Player | 'Draw' | null;
  currentPlayer: Player | null;
  userPlayer: Player | null;
  isAiThinking: boolean;
}

export default function GameStatus({ winner, currentPlayer, userPlayer, isAiThinking }: GameStatusProps) {
  let statusMessage;

  if (winner) {
    if (winner === 'Draw') {
      statusMessage = "It's a Draw!";
    } else {
      statusMessage = `${winner === userPlayer ? 'You win!' : 'AI wins!' } (${winner} takes the victory!)`;
    }
  } else if (isAiThinking) {
    statusMessage = (
      <div className="flex items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <span>AI is thinking...</span>
      </div>
    );
  } else if (currentPlayer) {
    statusMessage = `${currentPlayer === userPlayer ? 'Your' : "AI's"} turn (${currentPlayer})`;
  } else {
    statusMessage = "Game starting...";
  }

  return (
    <div 
      className="my-6 p-4 text-center text-xl sm:text-2xl font-semibold rounded-lg bg-card shadow-md min-h-[60px] flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      {statusMessage}
    </div>
  );
}
