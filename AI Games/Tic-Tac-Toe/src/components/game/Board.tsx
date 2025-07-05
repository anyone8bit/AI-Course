"use client";

import type { BoardState, Player } from '@/lib/game-logic';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  disabled: boolean;
  winningLine?: number[] | null;
}

export default function Board({ board, onCellClick, disabled, winningLine }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 bg-secondary/20 rounded-xl shadow-inner">
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          index={index}
          value={cellValue}
          onClick={() => onCellClick(index)}
          disabled={disabled}
          isWinningCell={winningLine?.includes(index)}
        />
      ))}
    </div>
  );
}
