export type Player = 1 | 2;
export type CellState = 0 | Player; // 0 for empty
export type Board = CellState[][];
export type GameMode = "vsHuman" | "vsAI";

export interface WinningLineCell {
  row: number;
  col: number;
}
export type WinningLine = WinningLineCell[] | null;
