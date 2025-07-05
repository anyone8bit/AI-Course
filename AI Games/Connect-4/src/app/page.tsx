'use client';

import GameBoard from '@/components/connect4/GameBoard';
import GameDashboard from '@/components/connect4/GameDashboard';
import { Toaster } from '@/components/ui/toaster';
import {
  checkDraw,
  checkWin,
  createEmptyBoard,
  dropPiece,
  getAIMove,
} from '@/lib/connect4-logic';
import type { Board, GameMode, Player, WinningLine } from '@/types/connect4';
import { useCallback, useEffect, useState } from 'react';

const AI_PLAYER: Player = 2;
const HUMAN_PLAYER: Player = 1;

export default function FourPlayPage() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(HUMAN_PLAYER);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('vsHuman'); // 'vsHuman' or 'vsAI'
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(
    null
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(HUMAN_PLAYER);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setIsGameOver(false);
    setLastMove(null);
  }, []);

  useEffect(() => {
    resetGame();
  }, [gameMode, resetGame]);

  const handleAITurn = useCallback(() => {
    if (isGameOver || currentPlayer !== AI_PLAYER || gameMode !== 'vsAI')
      return;

    // Add a slight delay for AI "thinking" time
    setTimeout(() => {
      const aiMoveCol = getAIMove(board);
      if (aiMoveCol !== -1) {
        const dropResult = dropPiece(board, aiMoveCol, AI_PLAYER);
        if (dropResult) {
          const { newBoard: nextBoard, row: pieceRow } = dropResult;
          setBoard(nextBoard);
          setLastMove({ row: pieceRow, col: aiMoveCol });

          const aiWins = checkWin(nextBoard, AI_PLAYER);
          if (aiWins) {
            setWinner(AI_PLAYER);
            setWinningLine(aiWins);
            setIsGameOver(true);
          } else if (checkDraw(nextBoard)) {
            setIsDraw(true);
            setIsGameOver(true);
          } else {
            setCurrentPlayer(HUMAN_PLAYER);
          }
        }
      }
    }, 500); // 0.5 second delay for AI
  }, [board, currentPlayer, gameMode, isGameOver]);

  useEffect(() => {
    if (currentPlayer === AI_PLAYER && gameMode === 'vsAI' && !isGameOver) {
      handleAITurn();
    }
  }, [currentPlayer, gameMode, isGameOver, handleAITurn]);

  const handleColumnClick = (colIndex: number) => {
    if (isGameOver || (gameMode === 'vsAI' && currentPlayer === AI_PLAYER)) {
      return;
    }

    const dropResult = dropPiece(board, colIndex, currentPlayer);
    if (dropResult) {
      const { newBoard: nextBoard, row: pieceRow } = dropResult;
      setBoard(nextBoard);
      setLastMove({ row: pieceRow, col: colIndex });

      const currentWins = checkWin(nextBoard, currentPlayer);
      if (currentWins) {
        setWinner(currentPlayer);
        setWinningLine(currentWins);
        setIsGameOver(true);
      } else if (checkDraw(nextBoard)) {
        setIsDraw(true);
        setIsGameOver(true);
      } else {
        setCurrentPlayer(
          currentPlayer === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER
        );
      }
    }
  };

  const toggleGameMode = () => {
    setGameMode((prevMode) => (prevMode === 'vsHuman' ? 'vsAI' : 'vsHuman'));
    // Resetting game is handled by useEffect watching gameMode
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-primary drop-shadow-sm">
          Four Matching
        </h1>
        <p className="text-muted-foreground">
          Connect - The Classic Game Reimagined
        </p>
      </header>

      <main className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-2/3">
          <GameBoard
            board={board}
            onColumnClick={handleColumnClick}
            winningLine={winningLine}
            currentPlayer={currentPlayer}
            isGameOver={isGameOver}
            lastMove={lastMove}
          />
        </div>
        <div className="w-full lg:w-1/3">
          <GameDashboard
            currentPlayer={currentPlayer}
            winner={winner}
            isDraw={isDraw}
            onRestart={resetGame}
            gameMode={gameMode}
            onToggleGameMode={toggleGameMode}
          />
        </div>
      </main>
      <Toaster />
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FourMatching. Enjoy the game!</p>
        <p>Beat AI If you can</p>
      </footer>
    </div>
  );
}
