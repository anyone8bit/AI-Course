'use client';

import type { Player, GameMode } from '@/types/connect4';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Users, Link as LinkIcon, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface GameDashboardProps {
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  onRestart: () => void;
  gameMode: GameMode;
  onToggleGameMode: () => void;
}

const playerNames: Record<Player, string> = { 1: 'Player 1', 2: 'Player 2' };
const playerColorsClasses: Record<Player, string> = {
  1: 'text-primary', // Deep Blue
  2: 'text-accent',  // Yellow-Orange
};
const playerBgColorsClasses: Record<Player, string> = {
  1: 'bg-primary',
  2: 'bg-accent',
};


export default function GameDashboard({
  currentPlayer,
  winner,
  isDraw,
  onRestart,
  gameMode,
  onToggleGameMode
}: GameDashboardProps) {
  const { toast } = useToast();

  let statusMessage: React.ReactNode;
  let statusColorClass = 'text-foreground';

  if (winner) {
    const winnerName = gameMode === 'vsAI' && winner === 2 ? 'AI Bot' : playerNames[winner];
    statusMessage = <span className={cn(playerColorsClasses[winner], "font-semibold")}>{winnerName} Wins!</span>;
    statusColorClass = playerColorsClasses[winner];
  } else if (isDraw) {
    statusMessage = "It's a Draw!";
    statusColorClass = 'text-muted-foreground';
  } else {
    const currentTurnPlayerName = gameMode === 'vsAI' && currentPlayer === 2 ? 'AI Bot' : playerNames[currentPlayer];
    statusMessage = (
      <>
        <span className={cn(playerColorsClasses[currentPlayer], "font-semibold")}>{currentTurnPlayerName}'s</span> Turn
      </>
    );
    statusColorClass = playerColorsClasses[currentPlayer];
  }
  
  const handleInviteFriend = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Game link copied to clipboard. Send it to your friend to play (multiplayer functionality is conceptual for this version).",
        });
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Error",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Game Info</CardTitle>
        <CardDescription>Current status and controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-muted rounded-md">
          <p className={cn("text-xl font-medium", statusColorClass)}>{statusMessage}</p>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-2">
                <div className={cn("w-4 h-4 rounded-full", playerBgColorsClasses[1])} />
                <span className={playerColorsClasses[1]}>Player 1 (Blue)</span>
            </div>
            <div className="flex items-center space-x-2">
                 <div className={cn("w-4 h-4 rounded-full", playerBgColorsClasses[2])} />
                <span className={playerColorsClasses[2]}>
                    {gameMode === 'vsAI' ? 'AI Bot (Orange)' : 'Player 2 (Orange)'}
                </span>
            </div>
        </div>
        
        <div className="flex items-center space-x-2 justify-center p-3 border rounded-md">
          <Label htmlFor="game-mode-switch" className="flex items-center space-x-2 cursor-pointer">
            <Users className="h-5 w-5 text-primary" /> 
            <span>Play vs Human</span>
          </Label>
          <Switch
            id="game-mode-switch"
            checked={gameMode === 'vsAI'}
            onCheckedChange={onToggleGameMode}
            aria-label="Toggle game mode between Human and AI"
          />
          <Label htmlFor="game-mode-switch" className="flex items-center space-x-2 cursor-pointer">
            <Cpu className="h-5 w-5 text-accent" />
            <span>Play vs AI</span>
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={onRestart} variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> Restart Game
          </Button>
          <Button onClick={handleInviteFriend} variant="outline" className="w-full">
            <LinkIcon className="mr-2 h-4 w-4" /> Invite Friend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
