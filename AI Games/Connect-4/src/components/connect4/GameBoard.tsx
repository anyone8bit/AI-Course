'use client';

import type { Board, Player, WinningLineCell } from '@/types/connect4';
import { COLS, ROWS } from '@/lib/connect4-logic';
import GameCell from './GameCell';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface GameBoardProps {
  board: Board;
  onColumnClick: (colIndex: number) => void;
  winningLine: WinningLineCell[] | null;
  currentPlayer: Player;
  isGameOver: boolean;
  lastMove?: { row: number; col: number } | null;
}

export default function GameBoard({ board, onColumnClick, winningLine, currentPlayer, isGameOver, lastMove }: GameBoardProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const isCellWinning = (r: number, c: number): boolean => {
    return winningLine?.some(cell => cell.row === r && cell.col === c) ?? false;
  };
  
  const getPlayerColorForHover = (player: Player) => {
    return player === 1 ? 'bg-primary/50' : 'bg-accent/50';
  };

  return (
    <div className="bg-card p-2 sm:p-4 rounded-lg shadow-xl aspect-[7/6] w-full max-w-2xl mx-auto">
      <div 
        className="grid gap-1 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {/* Column headers/drop indicators */}
        {Array.from({ length: COLS }).map((_, c) => (
          <div
            key={`header-${c}`}
            className={cn(
              "h-8 sm:h-12 w-full rounded-t-md flex items-center justify-center transition-colors duration-200",
              !isGameOver && "cursor-pointer hover:bg-muted",
              hoveredColumn === c && !isGameOver && getPlayerColorForHover(currentPlayer)
            )}
            onClick={() => !isGameOver && onColumnClick(c)}
            onMouseEnter={() => setHoveredColumn(c)}
            onMouseLeave={() => setHoveredColumn(null)}
            aria-label={`Drop piece in column ${c + 1}`}
          >
            {!isGameOver && hoveredColumn === c && (
               <div className={cn(
                  'w-4 h-4 sm:w-6 sm:h-6 rounded-full opacity-70',
                  currentPlayer === 1 ? 'bg-primary' : 'bg-accent'
                )} />
            )}
          </div>
        ))}

        {/* Game cells */}
        {board.map((row, r) =>
          row.map((cellState, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                "flex items-center justify-center aspect-square",
                !isGameOver && hoveredColumn === c && "bg-muted/30 rounded-md"
              )}
              onClick={() => !isGameOver && onColumnClick(c)}
              onMouseEnter={() => setHoveredColumn(c)}
              onMouseLeave={() => setHoveredColumn(null)}
            >
              <GameCell 
                state={cellState} 
                isWinning={isCellWinning(r, c)}
                isAnimating={lastMove?.row === r && lastMove?.col === c}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
