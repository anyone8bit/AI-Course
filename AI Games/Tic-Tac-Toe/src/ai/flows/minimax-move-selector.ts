// src/ai/flows/minimax-move-selector.ts
'use server';

/**
 * @fileOverview Implements an AI agent that uses the Minimax algorithm to select the optimal move in a Tic Tac Toe game.
 *
 * - selectMove - A function that takes the current board state and player as input and returns the optimal move index.
 * - SelectMoveInput - The input type for the selectMove function.
 * - SelectMoveOutput - The return type for the selectMove function.
 */

import { ai } from '@/ai/genkit';
import type { BoardState, Player } from '@/lib/game-logic';
import { checkWinner as checkWinnerLogic } from '@/lib/game-logic';
import { z } from 'genkit';

const PlayerSchema = z.union([z.literal('X'), z.literal('O')]);
const BoardCellSchema = z.union([PlayerSchema, z.null()]);

const SelectMoveInputSchema = z.object({
  board: z
    .array(BoardCellSchema)
    .length(9)
    .describe(
      'The current state of the Tic Tac Toe board. An array of 9 elements, where each element is either "X", "O", or null for an empty cell.'
    ),
  player: PlayerSchema.describe(
    'The player for whom the AI should select a move (either "X" or "O").'
  ),
});
export type SelectMoveInput = z.infer<typeof SelectMoveInputSchema>;

const SelectMoveOutputSchema = z.object({
  move: z
    .number()
    .int()
    .min(0)
    .max(8)
    .describe(
      'The 0-based index of the cell where the AI has decided to play.'
    ),
});
export type SelectMoveOutput = z.infer<typeof SelectMoveOutputSchema>;

// Helper function to get available empty cells
function getEmptyCells(board: BoardState): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

interface MinimaxMove {
  index?: number;
  score: number;
}

// Minimax algorithm implementation
function minimax(
  currentBoard: BoardState,
  analyzingPlayer: Player,
  aiPlayer: Player,
  depth: number
): MinimaxMove {
  const opponentPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const availableSpots = getEmptyCells(currentBoard);

  // Check for terminal states
  const winner = checkWinnerLogic(currentBoard);
  if (winner === aiPlayer) {
    return { score: 10 - depth }; // AI wins, prefer shorter wins
  }
  if (winner === opponentPlayer) {
    return { score: depth - 10 }; // Opponent wins, AI prefers longer losses (less negative score)
  }
  if (winner === 'Draw' || availableSpots.length === 0) {
    return { score: 0 }; // Draw
  }

  const moves: MinimaxMove[] = [];

  for (const spotIndex of availableSpots) {
    const newBoard = [...currentBoard]; // Create a new board for the current move
    newBoard[spotIndex] = analyzingPlayer; // Make the move

    let resultScore;
    // Recursive call for the other player
    if (analyzingPlayer === aiPlayer) {
      // AI's turn in simulation (maximizing for AI)
      resultScore = minimax(
        newBoard,
        opponentPlayer,
        aiPlayer,
        depth + 1
      ).score;
    } else {
      // Opponent's turn in simulation (minimizing for AI)
      resultScore = minimax(newBoard, aiPlayer, aiPlayer, depth + 1).score;
    }
    moves.push({ index: spotIndex, score: resultScore });
  }

  // Choose the best move based on whether it's maximizing or minimizing player's turn (from AI's perspective)
  let bestMove: MinimaxMove;
  if (analyzingPlayer === aiPlayer) {
    // Maximizing player (AI wants the highest score)
    let bestScore = -Infinity;
    if (moves.length > 0) bestMove = moves[0]; // Initialize with the first move
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    // Minimizing player (Opponent, AI wants opponent to pick move leading to lowest score for AI)
    let bestScore = Infinity;
    if (moves.length > 0) bestMove = moves[0]; // Initialize with the first move
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }
  // This assertion is safe because terminal states (no available spots) are handled earlier.
  // If availableSpots is not empty, moves will not be empty.
  return bestMove!;
}

const selectMoveFlow = ai.defineFlow(
  {
    name: 'selectMoveFlow',
    inputSchema: SelectMoveInputSchema,
    outputSchema: SelectMoveOutputSchema,
  },
  async (input) => {
    const { board, player: aiPlayerToPlay } = input;

    // --- Turn validation logic ---
    const X_count = board.filter((cell) => cell === 'X').length;
    const O_count = board.filter((cell) => cell === 'O').length;

    let expectedPlayerTurn: Player;
    if (X_count === O_count) {
      expectedPlayerTurn = 'X';
    } else if (X_count === O_count + 1) {
      expectedPlayerTurn = 'O';
    } else {
      console.error('Invalid board state detected in selectMoveFlow:', board);
      const firstEmptyCell = board.findIndex((cell) => cell === null);
      return { move: firstEmptyCell !== -1 ? firstEmptyCell : 0 };
    }

    if (expectedPlayerTurn !== aiPlayerToPlay) {
      console.warn(
        `AI (playing as ${aiPlayerToPlay}) was asked to move, but it seems to be ${expectedPlayerTurn}'s turn. Board:`,
        board
      );
      const firstEmptyCell = board.findIndex((cell) => cell === null);
      if (firstEmptyCell !== -1) {
        return { move: firstEmptyCell };
      }
      console.error('AI asked to move out of turn with no empty cells.');
      return { move: 0 }; // Should not happen in a well-managed game
    }
    // --- End Turn validation ---

    const emptyCellsCount = getEmptyCells(board).length;
    if (emptyCellsCount === 0) {
      console.error('AI asked to move on a full board.');
      // This should ideally be caught by game logic before calling AI.
      // If game isn't over, it's an error. If it is, AI shouldn't be called.
      return { move: 0 }; // Fallback, though game state is problematic.
    }

    // Heuristics for early moves for a stronger AI
    if (emptyCellsCount === 9) {
      // AI's first move (as X)
      const corners = [0, 2, 6, 8];
      return { move: corners[Math.floor(Math.random() * corners.length)] };
    }
    if (emptyCellsCount === 8 && board[4] === null && aiPlayerToPlay === 'O') {
      // AI is 'O', human played first, center is free
      return { move: 4 }; // Take the center
    }

    // Use Minimax for other moves
    const bestMoveResult = minimax(
      [...board],
      aiPlayerToPlay,
      aiPlayerToPlay,
      0
    );

    if (bestMoveResult.index === undefined) {
      console.error(
        'Minimax did not return a valid move index. Board:',
        board,
        'Player:',
        aiPlayerToPlay
      );
      // Fallback: find the first available empty cell. This should rarely happen if Minimax is correct and game isn't over.
      const firstEmptyCell = board.findIndex((cell) => cell === null);
      if (firstEmptyCell !== -1) {
        return { move: firstEmptyCell };
      }
      console.error(
        "Minimax couldn't find a move, and no empty cells. Game should be over."
      );
      return { move: 0 }; // Should ideally not be reached.
    }

    // Validate AI's chosen move (Minimax should always pick an empty cell if one exists and game not over)
    if (board[bestMoveResult.index] !== null) {
      console.warn(
        `Minimax (playing as ${aiPlayerToPlay}) chose an occupied cell: ${bestMoveResult.index}. Board:`,
        board,
        'This is unexpected.'
      );
      const firstEmptyCell = board.findIndex((cell) => cell === null);
      if (firstEmptyCell !== -1) {
        return { move: firstEmptyCell }; // Fallback if Minimax makes an error
      }
      console.error(
        'Minimax chose occupied cell, and no other empty cells. Problematic state.'
      );
      return { move: 0 };
    }

    return { move: bestMoveResult.index };
  }
);

export async function selectMove(
  input: SelectMoveInput
): Promise<SelectMoveOutput> {
  return selectMoveFlow(input);
}
