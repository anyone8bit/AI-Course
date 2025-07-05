
"use client";

import React from 'react';
import type { Piece } from '@/lib/chess-types';
import { PIECE_UNICODE } from '@/lib/chess-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Optional: for styling

interface CapturedPiecesDisplayProps {
  capturedByWhite: Piece[]; // These are black pieces captured by white
  capturedByBlack: Piece[]; // These are white pieces captured by black
}

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ capturedByWhite, capturedByBlack }) => {
  const renderPieces = (pieces: Piece[], capturedByColor: 'White' | 'Black') => {
    if (pieces.length === 0) {
      return <span className="text-xs italic text-muted-foreground">None</span>;
    }
    // Sort pieces for consistent display, e.g., by value or type
    const sortedPieces = [...pieces].sort((a, b) => {
        const pieceOrder: Record<string, number> = { 'Q': 1, 'R': 2, 'B': 3, 'N': 4, 'P': 5 };
        return (pieceOrder[a.type] || 6) - (pieceOrder[b.type] || 6);
    });

    return (
      <div className="flex flex-wrap gap-1 text-2xl">
        {sortedPieces.map((piece, index) => (
          <span key={`${capturedByColor}-${piece.type}-${index}`} title={`${piece.color} ${piece.type}`}>
            {PIECE_UNICODE[piece.color][piece.type]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="my-2 p-2 border rounded-md shadow-sm bg-card">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-card-foreground mb-1">Captured by White:</h4>
        {renderPieces(capturedByWhite, 'White')}
      </div>
      <hr className="my-1 border-border" />
      <div>
        <h4 className="text-sm font-semibold text-card-foreground mb-1">Captured by Black:</h4>
        {renderPieces(capturedByBlack, 'Black')}
      </div>
    </div>
  );
};

export default CapturedPiecesDisplay;
