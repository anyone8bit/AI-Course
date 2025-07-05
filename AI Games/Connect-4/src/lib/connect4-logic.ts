import type { Board, CellState, Player, WinningLine, WinningLineCell } from '@/types/connect4';

export const ROWS = 6;
export const COLS = 7;
const AI_PLAYER: Player = 2;
const HUMAN_PLAYER: Player = 1;
const AI_DEPTH = 3; // Depth for minimax search

export function createEmptyBoard(): Board {
  return Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));
}

export function dropPiece(board: Board, col: number, player: Player): { newBoard: Board; row: number } | null {
  if (col < 0 || col >= COLS || board[0][col] !== 0) {
    return null; // Invalid move or column full
  }
  const newBoard = board.map(row => [...row]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] === 0) {
      newBoard[r][col] = player;
      return { newBoard, row: r };
    }
  }
  return null; // Should not happen if initial check passes
}

export function checkWin(board: Board, player: Player): WinningLine {
  // Horizontal check
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) {
        return [{row:r, col:c}, {row:r, col:c+1}, {row:r, col:c+2}, {row:r, col:c+3}];
      }
    }
  }
  // Vertical check
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) {
        return [{row:r, col:c}, {row:r+1, col:c}, {row:r+2, col:c}, {row:r+3, col:c}];
      }
    }
  }
  // Positive diagonal check (\)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) {
        return [{row:r, col:c}, {row:r+1, col:c+1}, {row:r+2, col:c+2}, {row:r+3, col:c+3}];
      }
    }
  }
  // Negative diagonal check (/)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) {
         return [{row:r, col:c}, {row:r-1, col:c+1}, {row:r-2, col:c+2}, {row:r-3, col:c+3}];
      }
    }
  }
  return null;
}

export function checkDraw(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== 0));
}

function getValidMoves(board: Board): number[] {
  const validMoves: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) {
      validMoves.push(c);
    }
  }
  return validMoves;
}

function evaluateWindow(window: CellState[], player: Player): number {
  const opponent = player === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
  let score = 0;

  const playerCount = window.filter(p => p === player).length;
  const opponentCount = window.filter(p => p === opponent).length;
  const emptyCount = window.filter(p => p === 0).length;

  if (playerCount === 4) score += 100000;
  else if (playerCount === 3 && emptyCount === 1) score += 100;
  else if (playerCount === 2 && emptyCount === 2) score += 10;

  if (opponentCount === 3 && emptyCount === 1) score -= 800; // Increased penalty for opponent's 3-in-a-row
  if (opponentCount === 4) score -= 1000000;

  return score;
}

function scorePosition(board: Board, player: Player): number {
  let score = 0;

  const centerColIndex = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerColIndex] === player) {
      score += 3;
    }
  }
  
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(board[r].slice(c, c + 4), player);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += evaluateWindow([board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]], player);
    }
  }
  // Positive diagonal
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]], player);
    }
  }
  // Negative diagonal
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow([board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]], player);
    }
  }
  return score;
}

function isTerminalNode(board: Board): boolean {
  return !!checkWin(board, HUMAN_PLAYER) || !!checkWin(board, AI_PLAYER) || checkDraw(board);
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
  if (depth === 0 || isTerminalNode(board)) {
    if (isTerminalNode(board)) {
      if (checkWin(board, AI_PLAYER)) return 100000 + depth; // AI wins
      if (checkWin(board, HUMAN_PLAYER)) return -100000 - depth; // Human wins
      if (checkDraw(board)) return 0; // Draw
    }
    return scorePosition(board, AI_PLAYER); // Heuristic score for non-terminal leaf or max depth
  }

  const validMoves = getValidMoves(board);

  if (maximizingPlayer) { // AI's turn (AI is AI_PLAYER)
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const dropResult = dropPiece(board, col, AI_PLAYER);
      if (dropResult) {
        const evalScore = minimax(dropResult.newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else { // Human's turn (Human is HUMAN_PLAYER)
    let minEval = Infinity;
    for (const col of validMoves) {
      const dropResult = dropPiece(board, col, HUMAN_PLAYER);
      if (dropResult) {
        const evalScore = minimax(dropResult.newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

export function getAIMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) return -1; // No moves possible

  // Prioritize center columns if multiple moves have same best score
  const moveOrder = validMoves.sort((a, b) => Math.abs(a - Math.floor(COLS / 2)) - Math.abs(b - Math.floor(COLS / 2)));

  for (const col of moveOrder) {
    const dropResult = dropPiece(board, col, AI_PLAYER);
    if (dropResult) {
      // AI is maximizing, its first move. Next turn is human's (minimizing).
      const moveScore = minimax(dropResult.newBoard, AI_DEPTH -1, -Infinity, Infinity, false);
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = col;
      }
    }
  }
  
  // Fallback to random if no good move found (e.g. all moves lead to loss)
  if (bestMove === -1 && validMoves.length > 0) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  return bestMove;
}
