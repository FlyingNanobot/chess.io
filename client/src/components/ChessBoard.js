import React from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function ChessBoard({ fen, onMove, playerColor, currentTurn, isPlayerTurn, boardSize = null, boardOrientation = 'white' }) {
  const chessInstance = React.useRef(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = React.useState(null);
  const [highlightedSquares, setHighlightedSquares] = React.useState({});
  const [responsiveBoardSize, setResponsiveBoardSize] = React.useState(boardSize);

  // Calculate responsive board size
  React.useEffect(() => {
    const calculateBoardSize = () => {
      const width = window.innerWidth;
      
      if (boardSize) {
        // If explicit size provided, use it but cap on mobile
        if (width < 768) {
          setResponsiveBoardSize(Math.min(boardSize, width - 32));
        } else {
          setResponsiveBoardSize(boardSize);
        }
      } else {
        // Auto-calculate based on screen size
        if (width < 480) {
          setResponsiveBoardSize(width - 32); // Small phones
        } else if (width < 768) {
          setResponsiveBoardSize(width - 24); // Tablets
        } else {
          setResponsiveBoardSize(500); // Desktop default
        }
      }
    };

    calculateBoardSize();
    window.addEventListener('resize', calculateBoardSize);
    return () => window.removeEventListener('resize', calculateBoardSize);
  }, [boardSize]);

  // Update chess instance when FEN changes
  React.useEffect(() => {
    chessInstance.current.load(fen);
  }, [fen]);

  const handleSquareClick = (square) => {
    if (!isPlayerTurn || !playerColor) {
      return;
    }

    // If no square is selected, select this one
    if (!selectedSquare) {
      // Check if square has a piece of our color
      const piece = chessInstance.current.get(square);
      if (piece) {
        const pieceColor = piece.color === 'w' ? 'white' : 'black';
        if (pieceColor === playerColor) {
          setSelectedSquare(square);
          // Show available moves for this piece
          const moves = chessInstance.current.moves({ square, verbose: true });
          const highlights = {};
          moves.forEach((move) => {
            highlights[move.to] = { background: 'rgba(102, 126, 234, 0.3)' };
          });
          setHighlightedSquares(highlights);
        }
      }
      return;
    }

    // If a square is already selected, try to move to this square
    if (selectedSquare === square) {
      // Deselect if clicking the same square
      setSelectedSquare(null);
      setHighlightedSquares({});
      return;
    }

    // Try to make the move
    const result = onMove(selectedSquare, square);
    if (result) {
      // Move was successful, clear selection
      setSelectedSquare(null);
      setHighlightedSquares({});
    } else {
      // Move failed, check if clicking on another piece of our color
      const piece = chessInstance.current.get(square);
      if (piece) {
        const pieceColor = piece.color === 'w' ? 'white' : 'black';
        if (pieceColor === playerColor) {
          setSelectedSquare(square);
          const moves = chessInstance.current.moves({ square, verbose: true });
          const highlights = {};
          moves.forEach((move) => {
            highlights[move.to] = { background: 'rgba(102, 126, 234, 0.3)' };
          });
          setHighlightedSquares(highlights);
          return;
        }
      }
      // Otherwise clear selection
      setSelectedSquare(null);
      setHighlightedSquares({});
    }
  };

  const handleMove = (source, target) => {
    // Don't allow moves if not player's turn or no player color assigned
    if (!isPlayerTurn || !playerColor) {
      return false;
    }

    // Only allow moves for pieces of the player's color
    const piece = chessInstance.current.get(source);
    if (!piece) {
      return false;
    }

    // Check if piece belongs to player
    const pieceColor = piece.color === 'w' ? 'white' : 'black';
    if (pieceColor !== playerColor) {
      return false;
    }

    // Try the move
    return onMove(source, target);
  };

  return (
    <div className="chessboard-wrapper">
      <Chessboard
        position={fen}
        onPieceDrop={handleMove}
        onSquareClick={handleSquareClick}
        boardWidth={responsiveBoardSize}
        boardOrientation={boardOrientation}
        arePiecesDraggable={isPlayerTurn}
        customDarkSquareStyle={{
          backgroundColor: '#1a1a1a',
        }}
        customLightSquareStyle={{
          backgroundColor: '#3a3a3a',
        }}
        boardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
          maxWidth: '100%',
          margin: '0 auto',
        }}
        customSquareStyles={{
          [selectedSquare]: {
            backgroundColor: 'rgba(102, 126, 234, 0.5)',
          },
          ...highlightedSquares,
        }}
        customBoardStyle={{
          cursor: isPlayerTurn ? 'grab' : 'not-allowed',
          opacity: isPlayerTurn ? 1 : 0.6,
        }}
      />
      {!isPlayerTurn && (
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          color: '#999',
          fontSize: '0.9rem',
        }}>
          Waiting for {currentTurn === 'white' ? 'white' : 'black'}...
        </div>
      )}
    </div>
  );
}

export default ChessBoard;
