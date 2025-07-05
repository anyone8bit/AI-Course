
import type { Board, Piece, PieceColor, PieceSymbol, Position, Move, SquareContent } from './chess-types';

export const INITIAL_BOARD: Board = [
  [{ type: 'R', color: 'black', hasMoved: false }, { type: 'N', color: 'black', hasMoved: false }, { type: 'B', color: 'black', hasMoved: false }, { type: 'Q', color: 'black', hasMoved: false }, { type: 'K', color: 'black', hasMoved: false }, { type: 'B', color: 'black', hasMoved: false }, { type: 'N', color: 'black', hasMoved: false }, { type: 'R', color: 'black', hasMoved: false }],
  Array(8).fill(null).map(() => ({ type: 'P', color: 'black', hasMoved: false })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'P', color: 'white', hasMoved: false })),
  [{ type: 'R', color: 'white', hasMoved: false }, { type: 'N', color: 'white', hasMoved: false }, { type: 'B', color: 'white', hasMoved: false }, { type: 'Q', color: 'white', hasMoved: false }, { type: 'K', color: 'white', hasMoved: false }, { type: 'B', color: 'white', hasMoved: false }, { type: 'N', color: 'white', hasMoved: false }, { type: 'R', color: 'white', hasMoved: false }],
];

export function createInitialBoard(): Board {
  return JSON.parse(JSON.stringify(INITIAL_BOARD)); // Deep copy
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getPieceAt(board: Board, pos: Position): SquareContent {
  if (!isInBounds(pos.row, pos.col)) return null;
  return board[pos.row][pos.col];
}

export function isKingInCheck(board: Board, kingColor: PieceColor): boolean {
  const kingPos = findKing(board, kingColor);
  if (!kingPos) return false;

  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        const moves = getPseudoLegalMovesForPiece(board, { row: r, col: c });
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'K' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function getPseudoLegalMovesForPiece(board: Board, pos: Position): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece) return [];

  const moves: Position[] = [];
  const { type, color } = piece;
  const { row, col } = pos;

  const addMove = (r: number, c: number, isAttackOnly = false, isMoveOnly = false) => {
    if (!isInBounds(r,c)) return;
    const targetPiece = getPieceAt(board, {row: r, col: c});
    if (targetPiece) {
      if (targetPiece.color !== color && !isMoveOnly) moves.push({row: r, col: c});
    } else {
      if (!isAttackOnly) moves.push({row: r, col: c});
    }
  };
  
  const addSlidingMoves = (dr: number, dc: number) => {
    for (let i = 1; i < 8; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      if (!isInBounds(r,c)) break;
      const targetPiece = getPieceAt(board, {row: r, col: c});
      if (targetPiece) {
        if (targetPiece.color !== color) moves.push({row: r, col: c});
        break;
      }
      moves.push({row: r, col: c});
    }
  };

  switch (type) {
    case 'P':
      const dir = color === 'white' ? -1 : 1;
      // Single move
      if (isInBounds(row + dir, col) && !getPieceAt(board, {row: row + dir, col})) {
        addMove(row + dir, col, false, true);
        // Double move
        if (!piece.hasMoved && isInBounds(row + 2 * dir, col) && !getPieceAt(board, {row: row + 2 * dir, col})) {
          addMove(row + 2 * dir, col, false, true);
        }
      }
      // Captures
      [col - 1, col + 1].forEach(c_capture => {
        if (isInBounds(row + dir, c_capture)) {
          const target = getPieceAt(board, {row: row + dir, col: c_capture});
          if (target && target.color !== color) {
            addMove(row + dir, c_capture, true, false);
          }
        }
      });
      // TODO: En passant
      break;
    case 'N':
      [
        [1, 2], [1, -2], [-1, 2], [-1, -2],
        [2, 1], [2, -1], [-2, 1], [-2, -1]
      ].forEach(([dr, dc]) => addMove(row + dr, col + dc));
      break;
    case 'B':
      [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([dr, dc]) => addSlidingMoves(dr, dc));
      break;
    case 'R':
      [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dr, dc]) => addSlidingMoves(dr, dc));
      break;
    case 'Q':
      [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]].forEach(([dr, dc]) => addSlidingMoves(dr, dc));
      break;
    case 'K':
      [
        [1,0], [-1,0], [0,1], [0,-1],
        [1,1], [1,-1], [-1,1], [-1,-1]
      ].forEach(([dr, dc]) => addMove(row + dr, col + dc));
      // Castling
      if (!piece.hasMoved) {
        // Kingside
        const KSRook = getPieceAt(board, {row, col: 7});
        if (KSRook && KSRook.type === 'R' && !KSRook.hasMoved && !getPieceAt(board, {row, col: 5}) && !getPieceAt(board, {row, col: 6})) {
          if (!isKingInCheckAfterMove(board, color, {from: pos, to: {row, col: 5}}) && !isKingInCheckAfterMove(board, color, {from: pos, to: {row, col: 6}})) {
             addMove(row, col + 2);
          }
        }
        // Queenside
        const QSRook = getPieceAt(board, {row, col: 0});
        if (QSRook && QSRook.type === 'R' && !QSRook.hasMoved && !getPieceAt(board, {row, col: 1}) && !getPieceAt(board, {row, col: 2}) && !getPieceAt(board, {row, col: 3})) {
           if (!isKingInCheckAfterMove(board, color, {from: pos, to: {row, col: 3}}) && !isKingInCheckAfterMove(board, color, {from: pos, to: {row, col: 2}})) {
            addMove(row, col - 2);
          }
        }
      }
      break;
  }
  return moves;
}

function isKingInCheckAfterMove(board: Board, kingColor: PieceColor, move: Move): boolean {
  const tempBoard = applyMoveToBoard(board, move);
  return isKingInCheck(tempBoard, kingColor);
}

export function getLegalMoves(board: Board, pos: Position, playerColor: PieceColor): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece || piece.color !== playerColor) return [];

  const pseudoLegalMoves = getPseudoLegalMovesForPiece(board, pos);
  
  return pseudoLegalMoves.filter(moveTo => {
    // For castling, the "moveTo" is the king's final square. We need to check if king passes through check.
    if (piece.type === 'K' && Math.abs(moveTo.col - pos.col) === 2) {
        const intermediateCol = pos.col + (moveTo.col > pos.col ? 1 : -1);
        if (isKingInCheckAfterMove(board, playerColor, {from: pos, to: {row: pos.row, col: intermediateCol}})) {
            return false;
        }
    }
    return !isKingInCheckAfterMove(board, playerColor, { from: pos, to: moveTo });
  });
}

export function applyMoveToBoard(currentBoard: Board, move: Move): Board {
  const newBoard = JSON.parse(JSON.stringify(currentBoard)) as Board; // Deep copy
  const pieceToMove = newBoard[move.from.row][move.from.col];

  if (pieceToMove) {
    pieceToMove.hasMoved = true;
    
    // Handle castling - move the rook
    if (pieceToMove.type === 'K' && Math.abs(move.to.col - move.from.col) === 2) {
      const rookRow = move.from.row;
      if (move.to.col === 6) { // Kingside
        const rook = newBoard[rookRow][7];
        if (rook) rook.hasMoved = true;
        newBoard[rookRow][5] = rook;
        newBoard[rookRow][7] = null;
      } else { // Queenside (move.to.col === 2)
        const rook = newBoard[rookRow][0];
        if (rook) rook.hasMoved = true;
        newBoard[rookRow][3] = rook;
        newBoard[rookRow][0] = null;
      }
    }

    // Pawn promotion
    if (pieceToMove.type === 'P' && (move.to.row === 0 || move.to.row === 7)) {
      newBoard[move.to.row][move.to.col] = { ...pieceToMove, type: move.promotion || 'Q' };
    } else {
      newBoard[move.to.row][move.to.col] = pieceToMove;
    }
    newBoard[move.from.row][move.from.col] = null;
  }
  return newBoard;
}

export function generateFen(board: Board, activeColor: PieceColor, castlingRights: string, enPassantTarget: string, halfMoveClock: number, fullMoveNumber: number): string {
  let fen = "";
  // 1. Piece placement
  for (let r = 0; r < 8; r++) {
    let emptySquares = 0;
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (emptySquares > 0) {
          fen += emptySquares;
          emptySquares = 0;
        }
        fen += piece.color === 'white' ? piece.type.toUpperCase() : piece.type.toLowerCase();
      } else {
        emptySquares++;
      }
    }
    if (emptySquares > 0) {
      fen += emptySquares;
    }
    if (r < 7) {
      fen += "/";
    }
  }

  fen += ` ${activeColor === 'white' ? 'w' : 'b'}`;
  fen += ` ${castlingRights || '-'}`;
  fen += ` ${enPassantTarget || '-'}`;
  fen += ` ${halfMoveClock}`;
  fen += ` ${fullMoveNumber}`;
  
  return fen;
}

export function parseAlgebraicNotation(board: Board, moveStrInput: string, playerColor: PieceColor): Move | null {
  const moveStr = moveStrInput.replace(/[+#]$/, '').trim(); // Remove check/checkmate, trim whitespace

  const pieceSymbols: PieceSymbol[] = ['K', 'Q', 'R', 'B', 'N'];
  let pieceType: PieceSymbol = 'P';
  let promotionPiece: PieceSymbol | undefined = undefined;

  // Castling
  if (moveStr === "O-O" || moveStr === "0-0") { 
    const row = playerColor === 'white' ? 7 : 0;
    return { from: { row, col: 4 }, to: { row, col: 6 } };
  }
  if (moveStr === "O-O-O" || moveStr === "0-0-0") {
    const row = playerColor === 'white' ? 7 : 0;
    return { from: { row, col: 4 }, to: { row, col: 2 } };
  }

  // Check for promotion
  if (moveStr.includes('=')) {
    const parts = moveStr.split('=');
    const promPiece = parts[1].toUpperCase() as PieceSymbol;
    if (pieceSymbols.includes(promPiece) || promPiece === 'Q') { // N, B, R, Q
      promotionPiece = promPiece;
    }
    // The part before '=' is the rest of the move string
    const movePart = parts[0];
     pieceType = 'P'; // Promotion always involves a pawn
     const toFile = movePart.slice(-2, -1);
     const toRank = movePart.slice(-1);
     const toStr = `${toFile}${toRank}`;

     const toCol = toStr.charCodeAt(0) - 'a'.charCodeAt(0);
     const toRow = 8 - parseInt(toStr[1], 10);
     if (!isInBounds(toRow, toCol)) return null;
     const toPos = { row: toRow, col: toCol };
     
     // Pawns can only promote on the 8th (for white) or 1st (for black) rank.
     const promotionRank = playerColor === 'white' ? 0 : 7;
     if (toRow !== promotionRank) return null;

     // Find the pawn that could make this move.
     // If movePart is like "e8" (just target square), or "fxe8" (capture)
     const fromColCandidates: number[] = [];
     if (movePart.length === 2) { // e.g. e8=Q
        fromColCandidates.push(toCol);
     } else if (movePart.length === 3 && movePart[1] === 'x') { // e.g. dxe8=Q
        fromColCandidates.push(movePart.charCodeAt(0) - 'a'.charCodeAt(0));
     } else if (movePart.length === 4 && movePart[1] !== 'x') { // Nd2e4 -> this case is for non-pawns, handle below
        // This specific parsing is for pawn promotions of format "e8=Q" or "fxe8=Q"
        // Pawns don't have disambiguation like 'Pe8=Q'
     }


     for (const fromCol of fromColCandidates) {
        const fromRow = playerColor === 'white' ? toRow + 1 : toRow -1;
        if (!isInBounds(fromRow, fromCol)) continue;
        const piece = board[fromRow][fromCol];
        if (piece && piece.type === 'P' && piece.color === playerColor) {
            const fromPos = {row: fromRow, col: fromCol};
            const legalMoves = getLegalMoves(board, fromPos, playerColor);
            if (legalMoves.some(m => m.row === toPos.row && m.col === toPos.col)) {
                return { from: fromPos, to: toPos, promotion: promotionPiece || 'Q' };
            }
        }
     }
     return null; // No valid promoting pawn found
  }


  // Regular moves
  let fromPart = "";
  let toPart = "";
  let isCapture = moveStr.includes('x');

  if (pieceSymbols.includes(moveStr[0].toUpperCase() as PieceSymbol)) {
    pieceType = moveStr[0].toUpperCase() as PieceSymbol;
    fromPart = moveStr.substring(1).replace('x', '');
    toPart = fromPart.slice(-2);
    fromPart = fromPart.slice(0, -2);
  } else { // Pawn move
    pieceType = 'P';
    fromPart = moveStr.replace('x', '');
    toPart = fromPart.slice(-2);
    fromPart = fromPart.slice(0, -2); 
    if (fromPart.length === 1 && fromPart >= 'a' && fromPart <= 'h') {
      // This means it's like "exd5", fromPart is "e"
    } else {
      fromPart = ""; // For simple pawn moves like "e4", fromPart is empty
    }
  }
  
  if (toPart.length !== 2) return null;
  const toCol = toPart.charCodeAt(0) - 'a'.charCodeAt(0);
  const toRow = 8 - parseInt(toPart[1], 10);

  if (!isInBounds(toRow, toCol)) return null;
  const toPos = { row: toRow, col: toCol };

  // Find the piece that can make this move
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === pieceType && piece.color === playerColor) {
        // Disambiguation based on fromPart
        if (fromPart.length > 0) {
          if (fromPart.length === 1) { // Rank or file specified
            if (fromPart >= 'a' && fromPart <= 'h') { // File specified (e.g. Nfd2)
              if (c !== (fromPart.charCodeAt(0) - 'a'.charCodeAt(0))) continue;
            } else if (fromPart >= '1' && fromPart <= '8') { // Rank specified (e.g. R1a3)
              if (r !== (8 - parseInt(fromPart, 10))) continue;
            }
          } else if (fromPart.length === 2) { // Full square specified (e.g. Nb1d2)
            const fromFile = fromPart.charCodeAt(0) - 'a'.charCodeAt(0);
            const fromRankNum = 8 - parseInt(fromPart[1], 10);
            if (c !== fromFile || r !== fromRankNum) continue;
          }
        }

        const fromPos = { row: r, col: c };
        const legalTargetSquares = getLegalMoves(board, fromPos, playerColor);
        if (legalTargetSquares.some(m => m.row === toPos.row && m.col === toPos.col)) {
          return { from: fromPos, to: toPos, promotion: promotionPiece };
        }
      }
    }
  }
  return null; 
}


export function isCheckmate(board: Board, kingColor: PieceColor): boolean {
  if (!isKingInCheck(board, kingColor)) return false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === kingColor) {
        const legalMoves = getLegalMoves(board, { row: r, col: c }, kingColor);
        if (legalMoves.length > 0) return false; 
      }
    }
  }
  return true; 
}

export function isStalemate(board: Board, kingColor: PieceColor): boolean {
  if (isKingInCheck(board, kingColor)) return false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === kingColor) {
        const legalMoves = getLegalMoves(board, { row: r, col: c }, kingColor);
        if (legalMoves.length > 0) return false;
      }
    }
  }
  return true; 
}

export function moveToSAN(move: Move, boardBeforeMove: Board, movingPlayerColor: PieceColor, boardAfterMove: Board): string {
  const piece = boardBeforeMove[move.from.row][move.from.col];
  if (!piece) return "error"; // Should not happen

  const toFile = String.fromCharCode('a'.charCodeAt(0) + move.to.col);
  const toRank = (8 - move.to.row).toString();
  const targetSquareStr = `${toFile}${toRank}`;
  let san = "";

  // Castling
  if (piece.type === 'K' && Math.abs(move.from.col - move.to.col) === 2) {
    if (move.to.col === 6) return "O-O" + (isCheckmate(boardAfterMove, movingPlayerColor === 'white' ? 'black' : 'white') ? '#' : (isKingInCheck(boardAfterMove, movingPlayerColor === 'white' ? 'black' : 'white') ? '+' : ''));
    if (move.to.col === 2) return "O-O-O" + (isCheckmate(boardAfterMove, movingPlayerColor === 'white' ? 'black' : 'white') ? '#' : (isKingInCheck(boardAfterMove, movingPlayerColor === 'white' ? 'black' : 'white') ? '+' : ''));
  }
  
  if (piece.type !== 'P') {
    san += piece.type;
    // Basic disambiguation: if multiple pieces of the same type can move to the target square, add file/rank.
    // This is a simplified version. Full disambiguation is more complex.
    const otherPieces: Position[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === move.from.row && c === move.from.col) continue;
        const p = boardBeforeMove[r][c];
        if (p && p.type === piece.type && p.color === piece.color) {
          const legalMoves = getLegalMoves(boardBeforeMove, {row: r, col: c}, piece.color);
          if (legalMoves.some(lm => lm.row === move.to.row && lm.col === move.to.col)) {
            otherPieces.push({row: r, col: c});
          }
        }
      }
    }
    if (otherPieces.length > 0) {
      const fromFileUnique = !otherPieces.some(op => op.col === move.from.col);
      const fromRankUnique = !otherPieces.some(op => op.row === move.from.row);
      if (fromFileUnique) {
        san += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
      } else if (fromRankUnique) {
        san += (8 - move.from.row).toString();
      } else {
        san += String.fromCharCode('a'.charCodeAt(0) + move.from.col) + (8 - move.from.row).toString();
      }
    }
  }

  // Capture
  const capturedPieceOnTarget = boardBeforeMove[move.to.row][move.to.col];
  if (capturedPieceOnTarget) {
    if (piece.type === 'P' && san === "") san += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
    san += 'x';
  } else if (piece.type === 'P' && move.from.col !== move.to.col) {
    // En-passant capture (target square is empty, but it's a diagonal pawn move)
    if (san === "") san += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
    san += 'x';
  }

  san += targetSquareStr;

  if (move.promotion) {
    san += `=${move.promotion}`;
  }

  // Add check/checkmate symbol
  const opponentColor = movingPlayerColor === 'white' ? 'black' : 'white';
  if (isCheckmate(boardAfterMove, opponentColor)) {
    san += '#';
  } else if (isKingInCheck(boardAfterMove, opponentColor)) {
    san += '+';
  }
  
  return san;
}
