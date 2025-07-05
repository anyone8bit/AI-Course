
"use client";

import React, { useRef, useEffect, useState } from 'react';
import type { Board, PieceColor, Position, SquareContent, Move } from '@/lib/chess-types';
import { PIECE_UNICODE } from '@/lib/chess-types';

interface ChessboardProps {
  boardData: Board;
  onSquareClick: (row: number, col: number) => void;
  selectedPiecePos: Position | null;
  legalMoves: Position[];
  playerColor: PieceColor; // 'white' or 'black', determines board orientation
  isPlayerTurn: boolean;
  kingInCheckPos: Position | null;
  lastMove: Move | null;
}

const Chessboard: React.FC<ChessboardProps> = ({
  boardData,
  onSquareClick,
  selectedPiecePos,
  legalMoves,
  playerColor,
  isPlayerTurn,
  kingInCheckPos,
  lastMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(300); // Default min size

  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    const updateSize = () => {
      // Ensure clientWidth/Height are positive before calculation
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        const newSize = Math.min(container.clientWidth, container.clientHeight) * 0.95;
        setCanvasSize(Math.max(newSize, 300)); // Min size 300px
      } else {
        setCanvasSize(300); // Fallback if container dimensions are not ready
      }
    };
    
    updateSize(); // Initial size calculation

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      if (container) { // Check if container still exists for unobserve
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []); // Empty dependency ensures this runs once on mount and cleans up
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const squareSize = canvasSize / 8;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const getCssVarColor = (varName: string): string => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (value) {
        if (value.startsWith('hsl(') || value.startsWith('rgb(') || value.startsWith('#') || value.includes('/')) {
           if (value.includes('/') && !value.startsWith('hsl') && !value.startsWith('rgb')) {
            return `hsl(${value})`;
           }
          return value;
        }
        return `hsl(${value})`; 
      }
      return '#000000'; 
    };

    const lightSquareColor = getCssVarColor('--chess-light-square');
    const darkSquareColor = getCssVarColor('--chess-dark-square');
    const selectedSquareBg = getCssVarColor('--chess-selected-square-bg');
    const legalMoveIndicatorColor = getCssVarColor('--chess-legal-move-indicator');
    const checkHighlightColor = getCssVarColor('--chess-check-highlight');
    const lastMoveHighlightColor = getCssVarColor('--chess-last-move-highlight');
    const pieceColorLight = getCssVarColor('--foreground'); 
    const pieceColorDark = getCssVarColor('--foreground');  


    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const displayRow = playerColor === 'white' ? r : 7 - r;
        const displayCol = playerColor === 'white' ? c : 7 - c;

        // Draw square
        ctx.fillStyle = (displayRow + displayCol) % 2 === 0 ? lightSquareColor : darkSquareColor;
        ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);

        // Highlight last move
        if (lastMove) {
          const isFromSquare = lastMove.from.row === displayRow && lastMove.from.col === displayCol;
          const isToSquare = lastMove.to.row === displayRow && lastMove.to.col === displayCol;
          if (isFromSquare || isToSquare) {
            ctx.fillStyle = lastMoveHighlightColor;
            ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
          }
        }
        
        // Highlight selected piece
        if (selectedPiecePos && selectedPiecePos.row === displayRow && selectedPiecePos.col === displayCol) {
          ctx.fillStyle = selectedSquareBg;
          ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        }

        // Highlight king in check
        if (kingInCheckPos && kingInCheckPos.row === displayRow && kingInCheckPos.col === displayCol) {
            ctx.fillStyle = checkHighlightColor;
            ctx.fillRect(c * squareSize, r * squareSize, squareSize, squareSize);
        }

        // Draw piece
        const piece: SquareContent = boardData[displayRow][displayCol];
        if (piece) {
          ctx.font = `${squareSize * 0.7}px Arial`; 
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = piece.color === 'white' ? pieceColorLight : pieceColorDark;
          ctx.fillText(PIECE_UNICODE[piece.color][piece.type], c * squareSize + squareSize / 2, r * squareSize + squareSize / 2);
        }
      }
    }

    // Highlight legal moves
    legalMoves.forEach(move => {
      let r_visual = -1, c_visual = -1;
      for (let r_iter = 0; r_iter < 8; r_iter++) {
        for (let c_iter = 0; c_iter < 8; c_iter++) {
          const currentDisplayRow = playerColor === 'white' ? r_iter : 7 - r_iter;
          const currentDisplayCol = playerColor === 'white' ? c_iter : 7 - c_iter;
          if(currentDisplayRow === move.row && currentDisplayCol === move.col) {
            r_visual = r_iter;
            c_visual = c_iter;
            break;
          }
        }
        if(r_visual !== -1) break;
      }

      if(r_visual !== -1 && c_visual !== -1) {
        const targetPiece = getPieceAt(boardData, move);
        if (targetPiece) { 
            ctx.strokeStyle = legalMoveIndicatorColor;
            ctx.lineWidth = squareSize * 0.05;
            ctx.beginPath();
            ctx.arc(c_visual * squareSize + squareSize / 2, r_visual * squareSize + squareSize / 2, squareSize * 0.4, 0, 2 * Math.PI);
            ctx.stroke();
        } else { 
            ctx.fillStyle = legalMoveIndicatorColor;
            ctx.beginPath();
            ctx.arc(c_visual * squareSize + squareSize / 2, r_visual * squareSize + squareSize / 2, squareSize / 8, 0, 2 * Math.PI);
            ctx.fill();
        }
      }
    });

  }, [boardData, selectedPiecePos, legalMoves, playerColor, canvasSize, kingInCheckPos, lastMove]);

  const getPieceAt = (board: Board, pos: Position): SquareContent => {
    if (pos.row < 0 || pos.row >= 8 || pos.col < 0 || pos.col >= 8) return null;
    return board[pos.row][pos.col];
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlayerTurn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const squareSize = canvasSize / 8;
    const clickedCol = Math.floor(x / squareSize);
    const clickedRow = Math.floor(y / squareSize);

    const gameRow = playerColor === 'white' ? clickedRow : 7 - clickedRow;
    const gameCol = playerColor === 'white' ? clickedCol : 7 - clickedCol;
    
    if (gameRow >= 0 && gameRow < 8 && gameCol >= 0 && gameCol < 8) {
      onSquareClick(gameRow, gameCol);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full p-1 sm:p-2">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="border border-border shadow-lg rounded-md"
        data-ai-hint="chess board game"
        aria-label="Chessboard"
      />
    </div>
  );
};

export default Chessboard;

    