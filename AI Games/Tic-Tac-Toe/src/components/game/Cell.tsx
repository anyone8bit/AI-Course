"use client";

import type { Player } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

interface CellProps {
  value: Player | null;
  onClick: () => void;
  disabled: boolean;
  isWinningCell?: boolean;
  index: number;
}

export default function Cell({ value, onClick, disabled, isWinningCell, index }: CellProps) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      aria-label={value ? `Cell contains ${value}` : `Play at row ${row}, column ${col}`}
      className={cn(
        "flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 rounded-lg shadow-sm font-mono text-5xl sm:text-6xl font-bold transition-all duration-150 ease-in-out",
        value === 'X' ? 'text-primary' : 'text-accent',
        !value && !disabled ? 'hover:bg-secondary/30 cursor-pointer' : 'cursor-not-allowed',
        disabled && !value ? 'bg-muted/20' : 'bg-card',
        isWinningCell ? 'bg-yellow-300 dark:bg-yellow-600 scale-110 ring-4 ring-yellow-500' : 'border-border',
      )}
    >
      {value}
    </button>
  );
}
