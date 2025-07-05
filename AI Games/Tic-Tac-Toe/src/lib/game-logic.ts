export type Player = 'X' | 'O';
export type BoardState = (Player | null)[];

export const INITIAL_BOARD: BoardState = Array(9).fill(null);

export function checkWinner(board: BoardState): Player | 'Draw' | null {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'Draw';
  }

  return null;
}
