
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Chessboard from '@/components/chess/Chessboard';
import GameStatus from '@/components/chess/GameStatus';
import GameControls from '@/components/chess/GameControls';
import CapturedPiecesDisplay from '@/components/chess/CapturedPiecesDisplay';
import MoveHistoryDisplay from '@/components/chess/MoveHistoryDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createInitialBoard,
  getLegalMoves,
  applyMoveToBoard,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  generateFen,
  parseAlgebraicNotation,
  moveToSAN
} from '@/lib/chess-logic';
import type { Board, PieceColor, Position, Move, GameState as GameStateType, Piece, MoveHistoryEntry } from '@/lib/chess-types';
import { generateChessMove, type GenerateChessMoveInput } from '@/ai/flows/chess-ai-move-generation';
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


const ChessPage: React.FC = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [selectedPiecePos, setSelectedPiecePos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [gameState, setGameState] = useState<GameStateType>('playing');
  const [statusMessage, setStatusMessage] = useState("White's turn to move.");
  const [playerSide] = useState<PieceColor>('white'); 
  const [isAITurn, setIsAITurn] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [kingInCheckPos, setKingInCheckPos] = useState<Position | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [halfMoveClock, setHalfMoveClock] = useState(0);
  const [fullMoveNumber, setFullMoveNumber] = useState(1);
  const [capturedPieces, setCapturedPieces] = useState<{ capturedByWhite: Piece[], capturedByBlack: Piece[] }>({ capturedByWhite: [], capturedByBlack: [] });
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);
  
  const { toast } = useToast();

  const updateGameStatusAndMoveHistory = useCallback((currentBoard: Board, colorToPlay: PieceColor, incomingMove: Move | null, boardBeforeMove: Board) => {
    const inCheck = isKingInCheck(currentBoard, colorToPlay);
    setKingInCheckPos(inCheck ? findKing(currentBoard, colorToPlay) : null);

    let sanMoveString = "";
    if (incomingMove) {
      sanMoveString = moveToSAN(incomingMove, boardBeforeMove, currentPlayer, currentBoard);
      if (currentPlayer === 'white') {
        setMoveHistory(prev => [...prev, { moveNumber: fullMoveNumber, white: sanMoveString, black: null }]);
      } else {
        setMoveHistory(prev => prev.map(item => 
          item.moveNumber === fullMoveNumber ? { ...item, black: sanMoveString } : item
        ));
      }
    }


    if (inCheck) {
      if (isCheckmate(currentBoard, colorToPlay)) {
        setGameState('checkmate');
        setStatusMessage(`Checkmate! ${colorToPlay === 'white' ? 'Black' : 'White'} wins.`);
        setIsAITurn(false);
        return;
      }
      setGameState('check');
      setStatusMessage(`${colorToPlay.charAt(0).toUpperCase() + colorToPlay.slice(1)} is in Check. ${colorToPlay.charAt(0).toUpperCase() + colorToPlay.slice(1)}'s turn.`);
    } else {
      if (isStalemate(currentBoard, colorToPlay)) {
        setGameState('stalemate');
        setStatusMessage("Stalemate! The game is a draw.");
        setIsAITurn(false);
        return;
      }
      setGameState('playing');
      setStatusMessage(`${colorToPlay.charAt(0).toUpperCase() + colorToPlay.slice(1)}'s turn to move.`);
    }

    if (colorToPlay !== playerSide && gameState !== 'checkmate' && gameState !== 'stalemate') {
        setIsAITurn(true);
    }

  }, [playerSide, gameState, currentPlayer, fullMoveNumber]);


  const findKing = (b: Board, color: PieceColor): Position | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = b[r][c];
        if (piece && piece.type === 'K' && piece.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameState === 'checkmate' || gameState === 'stalemate' || currentPlayer !== playerSide || isLoadingAI) return;

    const clickedPos = { row, col };
    const pieceAtClicked = board[row][col];

    if (selectedPiecePos) {
      if (selectedPiecePos.row === row && selectedPiecePos.col === col) {
        setSelectedPiecePos(null);
        setLegalMoves([]);
        return;
      }

      const isValidMove = legalMoves.some(move => move.row === row && move.col === col);
      if (isValidMove) {
        const move: Move = { from: selectedPiecePos, to: clickedPos };
        
        const movingPiece = board[selectedPiecePos.row][selectedPiecePos.col];
        if (movingPiece?.type === 'P' && (clickedPos.row === 0 || clickedPos.row === 7)) {
          move.promotion = 'Q';
          toast({ title: "Pawn Promoted!", description: "Your pawn has been promoted to a Queen."});
        }
        
        const boardBeforeMove = JSON.parse(JSON.stringify(board)); 
        const pieceOriginallyOnTargetSquare = board[move.to.row][move.to.col];
        const newBoard = applyMoveToBoard(board, move);
        
        if (pieceOriginallyOnTargetSquare && movingPiece) {
          if (movingPiece.color === 'white') { 
            setCapturedPieces(prev => ({
              ...prev,
              capturedByWhite: [...prev.capturedByWhite, pieceOriginallyOnTargetSquare]
            }));
          } else { 
            setCapturedPieces(prev => ({
              ...prev,
              capturedByBlack: [...prev.capturedByBlack, pieceOriginallyOnTargetSquare]
            }));
          }
        }
        
        setBoard(newBoard);
        setLastMove(move);
        
        const newHalfMoveClock = (movingPiece?.type === 'P' || pieceOriginallyOnTargetSquare !== null) ? 0 : halfMoveClock + 1;
        setHalfMoveClock(newHalfMoveClock);
        
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        if (currentPlayer === 'black') { 
          setFullMoveNumber(prev => prev + 1);
        }
        updateGameStatusAndMoveHistory(newBoard, nextPlayer, move, boardBeforeMove);
        setCurrentPlayer(nextPlayer); 
        setSelectedPiecePos(null);
        setLegalMoves([]);
        
      } else if (pieceAtClicked && pieceAtClicked.color === currentPlayer) {
        setSelectedPiecePos(clickedPos);
        setLegalMoves(getLegalMoves(board, clickedPos, currentPlayer));
      } else {
        setSelectedPiecePos(null);
        setLegalMoves([]);
      }
    } else if (pieceAtClicked && pieceAtClicked.color === currentPlayer) {
      setSelectedPiecePos(clickedPos);
      setLegalMoves(getLegalMoves(board, clickedPos, currentPlayer));
    }
  };

  const makeAIMove = useCallback(async () => {
    if (currentPlayer === playerSide || gameState === 'checkmate' || gameState === 'stalemate') {
        setIsAITurn(false);
        return;
    }
    
    setIsLoadingAI(true);
    setStatusMessage("AI is thinking...");

    const whiteKing = board[7][4];
    const blackKing = board[0][4];
    const whiteQRook = board[7][0];
    const whiteKRook = board[7][7];
    const blackQRook = board[0][0];
    const blackKRook = board[0][7];

    let castling = "";
    if (whiteKing?.type === 'K' && !whiteKing.hasMoved) {
      if (whiteKRook?.type === 'R' && !whiteKRook.hasMoved) castling += "K";
      if (whiteQRook?.type === 'R' && !whiteQRook.hasMoved) castling += "Q";
    }
    if (blackKing?.type === 'K' && !blackKing.hasMoved) {
      if (blackKRook?.type === 'R' && !blackKRook.hasMoved) castling += "k";
      if (blackQRook?.type === 'R' && !blackQRook.hasMoved) castling += "q";
    }
    if (castling === "") castling = "-";

    const fen = generateFen(board, currentPlayer, castling, "-", halfMoveClock, fullMoveNumber);
    
    try {
      const aiInput: GenerateChessMoveInput = { boardState: fen, difficulty: 'medium' };
      const aiResponse = await generateChessMove(aiInput);
      const aiMoveStr = aiResponse.move.trim(); 
      toast({ title: "AI Move Reasoning", description: aiResponse.reasoning, duration: 6000 });

      const parsedMove = parseAlgebraicNotation(board, aiMoveStr, currentPlayer);

      if (parsedMove) {
        const movingPiece = board[parsedMove.from.row][parsedMove.from.col];
        const boardBeforeMove = JSON.parse(JSON.stringify(board));
        const pieceOriginallyOnTargetSquare = board[parsedMove.to.row][parsedMove.to.col];
        const newBoard = applyMoveToBoard(board, parsedMove);

        if (pieceOriginallyOnTargetSquare && movingPiece) {
          if (movingPiece.color === 'black') { 
            setCapturedPieces(prev => ({
              ...prev,
              capturedByBlack: [...prev.capturedByBlack, pieceOriginallyOnTargetSquare]
            }));
          }
        }
        
        setBoard(newBoard);
        setLastMove(parsedMove);
        
        const newHalfMoveClock = (movingPiece?.type === 'P' || pieceOriginallyOnTargetSquare !== null) ? 0 : halfMoveClock + 1;
        setHalfMoveClock(newHalfMoveClock);
        
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        if (currentPlayer === 'black') { 
          setFullMoveNumber(prev => prev + 1);
        }
        updateGameStatusAndMoveHistory(newBoard, nextPlayer, parsedMove, boardBeforeMove);
        setCurrentPlayer(nextPlayer); 

      } else {
        console.error("AI returned an invalid or unparseable move:", aiMoveStr);
        setStatusMessage(`AI error. ${playerSide.charAt(0).toUpperCase() + playerSide.slice(1)}'s turn.`);
        setCurrentPlayer(playerSide); 
        toast({ title: "AI Error", description: `AI tried an invalid move: ${aiMoveStr}. Your turn.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error getting AI move:", error);
      setStatusMessage(`Error with AI. ${playerSide.charAt(0).toUpperCase() + playerSide.slice(1)}'s turn.`);
      setCurrentPlayer(playerSide); 
      toast({ title: "AI Communication Error", description: "Could not get AI move. Your turn.", variant: "destructive" });
    } finally {
      setIsLoadingAI(false);
      setIsAITurn(false);
    }
  }, [board, currentPlayer, playerSide, gameState, halfMoveClock, fullMoveNumber, updateGameStatusAndMoveHistory, toast]);

  useEffect(() => {
    if (isAITurn && !isLoadingAI && gameState !== 'checkmate' && gameState !== 'stalemate') {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAITurn, isLoadingAI, makeAIMove, gameState]);

  const startNewGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('white');
    setSelectedPiecePos(null);
    setLegalMoves([]);
    setGameState('playing');
    setStatusMessage("White's turn to move.");
    setIsAITurn(false);
    setIsLoadingAI(false);
    setKingInCheckPos(null);
    setLastMove(null);
    setHalfMoveClock(0);
    setFullMoveNumber(1);
    setCapturedPieces({ capturedByWhite: [], capturedByBlack: [] });
    setMoveHistory([]);
    toast({ title: "New Game Started", description: "Good luck!"});
  };

  return (
    <div className="flex flex-col items-stretch justify-center min-h-screen p-2 sm:p-4 bg-background text-foreground">
      <Toaster />
      <Card className="w-full flex flex-col flex-grow shadow-2xl rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Elegant Chess
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-2 sm:p-4 md:p-6">
          <GameControls onNewGame={startNewGame} isVsAI={true} />
          
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 my-4 flex-grow min-h-0">
            <div className="w-full md:w-1/5 order-1 flex flex-col">
              <CapturedPiecesDisplay 
                capturedByWhite={capturedPieces.capturedByWhite} 
                capturedByBlack={capturedPieces.capturedByBlack} 
              />
            </div>

            <div className="aspect-square w-full md:w-3/5 mx-auto relative order-2 flex justify-center items-center">
              <Chessboard
                boardData={board}
                onSquareClick={handleSquareClick}
                selectedPiecePos={selectedPiecePos}
                legalMoves={legalMoves}
                playerColor={playerSide}
                isPlayerTurn={currentPlayer === playerSide && !isLoadingAI}
                kingInCheckPos={kingInCheckPos}
                lastMove={lastMove}
              />
              {isLoadingAI && (
                <div className="absolute inset-0 bg-background/70 flex flex-col justify-center items-center z-10 rounded-md">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-2 text-lg font-semibold">AI is thinking...</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/5 order-3 flex flex-col">
              <MoveHistoryDisplay history={moveHistory} />
            </div>
          </div>
          
          <GameStatus message={statusMessage} isError={gameState === 'checkmate' || gameState === 'stalemate'} />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Elegant Chess. Play with strategy.</p>
      </footer>
    </div>
  );
};

export default ChessPage;

    