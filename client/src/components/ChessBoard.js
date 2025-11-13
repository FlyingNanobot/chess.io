import React from 'react';
import { Chessboard } from 'chessboardjsx';
import { Chess } from 'chess.js';

function ChessBoard({ fen, onMove }) {
  const [chess] = React.useState(new Chess(fen));

  const handleMove = (move) => {
    const result = chess.move(move, { sloppy: true });
    if (result) {
      onMove(move, chess.fen());
      return true;
    }
    return false;
  };

  return (
    <div className="chessboard-wrapper">
      <Chessboard
        position={fen}
        onMove={handleMove}
        width={350}
        boardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        }}
      />
    </div>
  );
}

export default ChessBoard;
