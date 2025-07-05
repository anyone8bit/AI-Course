
export type PieceSymbol = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceSymbol;
  color: PieceColor;
  hasMoved: boolean;
}

export type SquareContent = Piece | null;
export type BoardRow = SquareContent[];
export type Board = BoardRow[];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  promotion?: PieceSymbol;
}

export type GameState = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export const PIECE_UNICODE: Record<PieceColor, Record<PieceSymbol, string>> = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

export interface MoveHistoryEntry {
  moveNumber: number;
  white: string | null;
  black: string | null;
}
