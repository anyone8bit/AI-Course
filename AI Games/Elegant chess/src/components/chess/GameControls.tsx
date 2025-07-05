
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onTogglePlayerMode?: () => void; // Optional: for future 2-player mode
  isVsAI: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onNewGame, onTogglePlayerMode, isVsAI }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 my-4">
      <Button onClick={onNewGame} variant="default" className="shadow-md w-full sm:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" /> New Game
      </Button>
      {/* Example for future 2-player mode toggle
      {onTogglePlayerMode && (
        <Button onClick={onTogglePlayerMode} variant="outline" className="shadow-md w-full sm:w-auto">
          <Users className="mr-2 h-4 w-4" /> {isVsAI ? "Play vs Human" : "Play vs AI"}
        </Button>
      )}
      */}
    </div>
  );
};

export default GameControls;
