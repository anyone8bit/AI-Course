"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BoardState, Player } from '@/lib/game-logic';
import { INITIAL_BOARD, checkWinner } from '@/lib/game-logic';
import PlayerSelection from '@/components/game/PlayerSelection';
import Board from '@/components/game/Board';
import GameStatus from '@/components/game/GameStatus';
import { Button } from '@/components/ui/button';
import { selectMove } from '@/ai/flows/minimax-move-selector';
import { AlertCircle, RotateCcw, Trophy } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [userPlayer, setUserPlayer] = useState<Player | null>(null);
  const [aiPlayer, setAiPlayer] = useState<Player | null>(null);
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const { toast } = useToast();

  const findWinningLine = (currentBoard: BoardState): number[] | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return line;
      }
    }
    return null;
  };
  
  const handlePlayerSelection = (selectedPlayer: Player) => {
    setUserPlayer(selectedPlayer);
    const newAiPlayer = selectedPlayer === 'X' ? 'O' : 'X';
    setAiPlayer(newAiPlayer);
    resetGame(selectedPlayer, newAiPlayer);
    setIsGameActive(true); // Game becomes active after selection
  };

  const resetGame = (currentUserPlayer?: Player | null, currentAiPlayer?: Player | null) => {
    setBoard(INITIAL_BOARD);
    setWinner(null);
    setWinningLine(null);
    setIsAiThinking(false);
    
    const uPlayer = currentUserPlayer || userPlayer;
    const aPlayer = currentAiPlayer || aiPlayer;

    if (uPlayer && aPlayer) {
      setCurrentPlayer('X'); // X always starts
      setIsGameActive(true);
      if (aPlayer === 'X') { // If AI is X, AI makes the first move
        // This will be triggered by useEffect below
      }
    } else {
      setIsGameActive(false); // Not active if players aren't set (i.e. back to selection)
    }
  };

  const makeAiMove = useCallback(async (currentBoard: BoardState, playerForAi: Player) => {
    if (!playerForAi || winner) return;

    setIsAiThinking(true);
    try {
      // The AI flow is expected to return an object { move: number } or just number.
      // Based on prompt "returns the optimal move index", expecting number.
      // If it's an object, the AI flow needs to be adjusted or this call.
      // The provided stub for minimax-move-selector ends with `...An array of 9 elements, where each element is either \n```
      // This implies the schema definition might be incomplete in the prompt.
      // Assuming `selectMove` takes `{board, player}` and returns a number for the move.
      const aiMoveOutput = await selectMove({ board: currentBoard, player: playerForAi });
      
      let moveIndex: number;
      if (typeof aiMoveOutput === 'number') {
        moveIndex = aiMoveOutput;
      } else if (typeof aiMoveOutput === 'object' && aiMoveOutput !== null && typeof (aiMoveOutput as any).move === 'number') {
        moveIndex = (aiMoveOutput as any).move;
      } else {
        throw new Error("AI did not return a valid move index.");
      }

      if (currentBoard[moveIndex] === null) {
        const newBoard = [...currentBoard];
        newBoard[moveIndex] = playerForAi;
        setBoard(newBoard);
        
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setWinningLine(findWinningLine(newBoard));
          setIsGameActive(false);
        } else {
          setCurrentPlayer(userPlayer);
        }
      } else {
        // This case should ideally not happen if AI is optimal and board state is correct
        console.error("AI tried to play on an occupied cell or invalid move:", moveIndex);
        toast({
          title: "AI Error",
          description: "AI attempted an invalid move. This might indicate an issue with the AI logic.",
          variant: "destructive",
        });
        // As a fallback, pick a random available move (not optimal, but keeps game flowing)
        const availableMoves = currentBoard.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const newBoard = [...currentBoard];
            newBoard[randomMove] = playerForAi;
            setBoard(newBoard);
            const gameWinner = checkWinner(newBoard);
            if (gameWinner) {
              setWinner(gameWinner);
              setWinningLine(findWinningLine(newBoard));
              setIsGameActive(false);
            } else {
              setCurrentPlayer(userPlayer);
            }
        } else {
            // No moves left, should be a draw
            setWinner('Draw');
            setIsGameActive(false);
        }
      }
    } catch (error) {
      console.error("Error getting AI move:", error);
      toast({
        title: "AI Error",
        description: "Could not get AI move. Please try resetting the game.",
        variant: "destructive",
      });
      // Potentially allow user to continue or auto-set to draw if AI fails
    } finally {
      setIsAiThinking(false);
    }
  }, [userPlayer, toast]);

  useEffect(() => {
    if (isGameActive && currentPlayer === aiPlayer && !winner && !isAiThinking) {
      // Add a slight delay for better UX, making AI seem like it's "thinking"
      const timer = setTimeout(() => {
        makeAiMove(board, aiPlayer as Player);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, aiPlayer, board, winner, isGameActive, isAiThinking, makeAiMove]);


  const handleCellClick = (index: number) => {
    if (board[index] || winner || currentPlayer !== userPlayer || isAiThinking || !isGameActive) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = userPlayer as Player;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(findWinningLine(newBoard));
      setIsGameActive(false);
    } else {
      setCurrentPlayer(aiPlayer);
    }
  };
  
  if (!userPlayer) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary/20">
        <PlayerSelection onSelectPlayer={handlePlayerSelection} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary/20 font-sans">
      <Card className="w-full max-w-lg mx-auto shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-card/80 backdrop-blur-sm">
          <CardTitle className="text-4xl font-extrabold text-center text-primary tracking-tight flex items-center justify-center">
            <Trophy className="w-10 h-10 mr-3 text-accent" />
            Tic Tac Toe
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <GameStatus winner={winner} currentPlayer={currentPlayer} userPlayer={userPlayer} isAiThinking={isAiThinking} />
          <div className="flex justify-center my-6">
            <Board board={board} onCellClick={handleCellClick} disabled={!!winner || isAiThinking || currentPlayer === aiPlayer || !isGameActive} winningLine={winningLine} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center p-6 bg-card/50 space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={() => resetGame()} 
            variant="outline" 
            className="w-full sm:w-auto text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-primary text-primary hover:bg-primary/10"
            disabled={isAiThinking}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Reset Game
          </Button>
          <Button 
            onClick={() => {
              setUserPlayer(null);
              setAiPlayer(null);
              resetGame(null, null);
              setIsGameActive(false);
            }}
            variant="ghost"
            className="w-full sm:w-auto text-lg py-3 px-6 rounded-lg text-muted-foreground hover:text-accent"
          >
            Change Symbol
          </Button>
        </CardFooter>
      </Card>
       <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>AI Opponent using Minimax Algorithm. Try your best to win!</p>
        <p>&copy; {new Date().getFullYear()} Tic Tac Toe Terminal. Game designed by an expert designer.</p>
      </footer>
    </main>
  );
}
