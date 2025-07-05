"use client";

import type { Player } from '@/lib/game-logic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerSelectionProps {
  onSelectPlayer: (player: Player) => void;
}

export default function PlayerSelection({ onSelectPlayer }: PlayerSelectionProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Choose Your Side</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Select 'X' to go first, or 'O' to go second.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-8">
        <div className="flex space-x-6">
          <Button
            onClick={() => onSelectPlayer('X')}
            className="px-10 py-6 text-4xl font-bold rounded-lg shadow-md hover:shadow-lg transition-shadow bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Play as X"
          >
            X
          </Button>
          <Button
            onClick={() => onSelectPlayer('O')}
            className="px-10 py-6 text-4xl font-bold rounded-lg shadow-md hover:shadow-lg transition-shadow bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label="Play as O"
          >
            O
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
