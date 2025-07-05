
'use server';

/**
 * @fileOverview Generates a chess move for the AI opponent using Minimax with Alpha-Beta Pruning.
 *
 * - generateChessMove - A function that generates a chess move for the AI.
 * - GenerateChessMoveInput - The input type for the generateChessMove function.
 * - GenerateChessMoveOutput - The return type for the generateChessMove function.
 */

import { z } from 'genkit';
import type { Board, Piece, PieceColor, PieceSymbol, Position, Move, SquareContent } from '@/lib/chess-types';
import { 
  applyMoveToBoard, 
  getLegalMoves as getLegalMovesForSquare,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  moveToSAN // Import the shared moveToSAN
} from '@/lib/chess-logic';


const GenerateChessMoveInputSchema = z.object({
  boardState: z
    .string()
    .describe('A string representing the current state of the chess board in Forsyth-Edwards Notation (FEN).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .default('medium')
    .describe('The difficulty level of the AI opponent, determining search depth.'),
});
export type GenerateChessMoveInput = z.infer<typeof GenerateChessMoveInputSchema>;

const GenerateChessMoveOutputSchema = z.object({
  move: z
    .string()
    .describe(
      'A string representing the move the AI will make, in standard algebraic notation (e.g. e4, Nf3, Bg4, Qxd7, Raxd1, O-O, e8=Q).'
    ),
  reasoning: z
    .string()
    .describe('The AI opponents rationale for making the move.'),
});
export type GenerateChessMoveOutput = z.infer<typeof GenerateChessMoveOutputSchema>;


// --- FEN Parsing ---
function parseFen(fen: string): { board: Board; activeColor: PieceColor; castlingRights: string; enPassantTarget: Position | null; halfMoveClock: number; fullMoveNumber: number } {
  const parts = fen.split(' ');
  const piecePlacement = parts[0];
  const activeColor = parts[1] === 'w' ? 'white' : 'black';
  const castlingRights = parts[2];
  const enPassantTargetStr = parts[3];
  const halfMoveClock = parseInt(parts[4], 10);
  const fullMoveNumber = parseInt(parts[5], 10);

  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const rows = piecePlacement.split('/');

  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const char of rows[r]) {
      if (isNaN(parseInt(char, 10))) {
        const color: PieceColor = char === char.toUpperCase() ? 'white' : 'black';
        const type = char.toUpperCase() as PieceSymbol;
        
        let hasMoved = false; // Default
        // Infer hasMoved for kings and rooks based on castling rights more accurately
        if (type === 'K') {
            if (color === 'white' && !(castlingRights.includes('K') || castlingRights.includes('Q'))) hasMoved = true;
            if (color === 'black' && !(castlingRights.includes('k') || castlingRights.includes('q'))) hasMoved = true;
        } else if (type === 'R') {
            if (color === 'white') {
                if (r === 7 && c === 0 && !castlingRights.includes('Q')) hasMoved = true; // a1 rook
                if (r === 7 && c === 7 && !castlingRights.includes('K')) hasMoved = true; // h1 rook
            } else { // black
                if (r === 0 && c === 0 && !castlingRights.includes('q')) hasMoved = true; // a8 rook
                if (r === 0 && c === 7 && !castlingRights.includes('k')) hasMoved = true; // h8 rook
            }
        }
        // For other pieces, FEN doesn't explicitly state hasMoved.
        // We assume they haven't moved if they are on their starting squares,
        // but this is an oversimplification not fully captured by FEN alone.
        // For Minimax, the 'hasMoved' flag on the initial board passed to it is crucial.
        // The default `false` is often okay if castling rights are the primary concern for K/R.

        board[r][c] = { type, color, hasMoved };
        c++;
      } else {
        c += parseInt(char, 10);
      }
    }
  }

  let enPassantTarget: Position | null = null;
  if (enPassantTargetStr !== '-') {
    const col = enPassantTargetStr.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(enPassantTargetStr[1], 10);
    enPassantTarget = { row, col };
  }
  
  return { board, activeColor, castlingRights, enPassantTarget, halfMoveClock, fullMoveNumber };
}


// --- Board Evaluation ---
const pieceValues: { [key in PieceSymbol]: number } = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

function evaluateBoard(board: Board, aiColor: PieceColor): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === aiColor ? value : -value;
        // Add positional bonuses (simplified)
        if (piece.type === 'P') {
          if (piece.color === 'white') score += (6-r) * 0.1; // White pawns advancing
          else score -= (r-1) * 0.1; // Black pawns advancing
        } else if (piece.type === 'N' || piece.type === 'B') { // Knights and Bishops in center
          if ((r >=2 && r <= 5) && (c >= 2 && c <= 5)) {
             score += piece.color === aiColor ? 0.3 : -0.3;
          }
        }
      }
    }
  }
  return score;
}

// --- Get All Legal Moves for a Player ---
function getAllLegalMovesForPlayer(board: Board, color: PieceColor, _castlingRights: string, _enPassantTarget: Position | null): Move[] {
  const allMoves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const fromPos = { row: r, col: c };
        const legalTargetSquares = getLegalMovesForSquare(board, fromPos, color); // getLegalMovesForSquare ensures king safety
        legalTargetSquares.forEach(toPos => {
          let promotion: PieceSymbol | undefined = undefined;
          if (piece.type === 'P' && (toPos.row === 0 || toPos.row === 7)) {
            promotion = 'Q'; // Auto-promote to Queen for Minimax simplicity
          }
          allMoves.push({ from: fromPos, to: toPos, promotion });
        });
      }
    }
  }
  return allMoves;
}


// --- Minimax with Alpha-Beta Pruning ---
function minimaxAlphaBeta(
  board: Board, 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizingPlayer: boolean, 
  aiColor: PieceColor,
  currentPlayerOnBoard: PieceColor,
  castlingRights: string, // Current castling rights for this board state
  enPassantTarget: Position | null // Current en-passant target for this board state
): { score: number; move: Move | null } {

  if (depth === 0 || isCheckmate(board, currentPlayerOnBoard) || isStalemate(board, currentPlayerOnBoard)) {
    if (isCheckmate(board, currentPlayerOnBoard)) {
      // If the current player to move is checkmated, it's bad for them.
      // If current player is AI, and AI is checkmated, score is -Infinity for AI.
      // If current player is opponent, and opponent is checkmated, score is +Infinity for AI.
      return { score: currentPlayerOnBoard === aiColor ? -Infinity : Infinity, move: null };
    }
    if (isStalemate(board, currentPlayerOnBoard)) {
      return { score: 0, move: null }; // Stalemate is a draw
    }
    return { score: evaluateBoard(board, aiColor), move: null };
  }

  const legalMoves = getAllLegalMovesForPlayer(board, currentPlayerOnBoard, castlingRights, enPassantTarget);
  if (legalMoves.length === 0) { // Should be caught by checkmate/stalemate, but as a fallback
    if (isKingInCheck(board, currentPlayerOnBoard)) { // Checkmate if in check and no moves
        return { score: currentPlayerOnBoard === aiColor ? -Infinity : Infinity, move: null };
    } else { // Stalemate if not in check and no moves
        return { score: 0, move: null };
    }
  }

  let bestMove: Move | null = legalMoves[0]; 

  if (isMaximizingPlayer) { // AI's turn (aiColor)
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const newBoard = applyMoveToBoard(board, move);
      // TODO: Update castlingRights and enPassantTarget based on the move for the next state.
      // This is a complex part of FEN and move logic. For now, we pass existing ones,
      // but applyMoveToBoard updates piece.hasMoved which is used by getLegalMoves.
      // A more robust solution would generate new FEN parts here.
      const evalResult = minimaxAlphaBeta(newBoard, depth - 1, alpha, beta, false, aiColor, aiColor === 'white' ? 'black' : 'white', castlingRights, null /* simplified enPassant for next state */);
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else { // Opponent's turn
    let minEval = Infinity;
    for (const move of legalMoves) {
      const newBoard = applyMoveToBoard(board, move);
      // TODO: Update castlingRights and enPassantTarget
      const evalResult = minimaxAlphaBeta(newBoard, depth - 1, alpha, beta, true, aiColor, aiColor, castlingRights, null);
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move; // Not used by AI directly, but useful for score
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}


// --- Main Exported Function ---
export async function generateChessMove(input: GenerateChessMoveInput): Promise<GenerateChessMoveOutput> {
  const { boardState, difficulty } = input;
  
  const { board: currentBoard, activeColor, castlingRights: initialCastling, enPassantTarget: initialEnPassant, fullMoveNumber } = parseFen(boardState);

  let depth = 2; 
  if (difficulty === 'easy') depth = 1;
  if (difficulty === 'hard') depth = 3; 

  const aiPlayerColor = activeColor;

  const result = minimaxAlphaBeta(currentBoard, depth, -Infinity, Infinity, true, aiPlayerColor, activeColor, initialCastling, initialEnPassant);

  if (!result.move) {
    console.error("Minimax returned no move. Board state:", boardState, "AI Color:", aiPlayerColor);
    // Attempt to find any legal move as a last resort if minimax failed.
    const allMoves = getAllLegalMovesForPlayer(currentBoard, aiPlayerColor, initialCastling, initialEnPassant);
    if (allMoves.length > 0) {
      const fallbackMove = allMoves[Math.floor(Math.random() * allMoves.length)]; // Random fallback
      const newBoardAfterFallback = applyMoveToBoard(currentBoard, fallbackMove);
      const fallbackMoveSAN = moveToSAN(fallbackMove, currentBoard, aiPlayerColor, newBoardAfterFallback);
       return {
        move: fallbackMoveSAN,
        reasoning: `Minimax failed, choosing random legal move: ${fallbackMoveSAN}. Depth: ${depth}. Score: N/A`,
      };
    }
     return {
        move: "resign", 
        reasoning: "Minimax algorithm could not determine a valid move, and no fallback moves available. This might indicate a stalemate or checkmate that wasn't caught, or an issue with move generation.",
      };
  }

  const boardAfterAIMove = applyMoveToBoard(currentBoard, result.move);
  const bestMoveSAN = moveToSAN(result.move, currentBoard, aiPlayerColor, boardAfterAIMove);
  
  return {
    move: bestMoveSAN,
    reasoning: `Minimax selected ${bestMoveSAN} with score ${result.score === Infinity ? "+Inf" : result.score === -Infinity ? "-Inf" : result.score.toFixed(2)} at depth ${depth}.`,
  };
}

