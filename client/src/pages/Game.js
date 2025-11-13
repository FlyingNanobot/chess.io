import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';

const SOCKET_SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

function Game() {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStatus, setGameStatus] = useState('Connecting...');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      // Join the game room
      newSocket.emit('joinGame', { gameId: id });
    });

    newSocket.on('playerAssigned', (data) => {
      console.log('Player color:', data.color);
      setPlayerColor(data.color);
      setGameStatus(`You are ${data.color}. Waiting for opponent...`);
    });

    newSocket.on('opponentJoined', () => {
      console.log('Opponent joined');
      setOpponentConnected(true);
      setGameStatus('Game started! Your turn' || `${playerColor} to move`);
    });

    newSocket.on('moveReceived', (data) => {
      console.log('Move received:', data.move);
      const result = chess.move(data.move, { sloppy: true });
      if (result) {
        setFen(chess.fen());
        setMoveHistory([...moveHistory, data.move]);
        setGameStatus(`${data.playerColor} moved. Your turn!`);
      }
    });

    newSocket.on('gameError', (data) => {
      setGameStatus(`Error: ${data.message}`);
    });

    newSocket.on('disconnect', () => {
      setGameStatus('Disconnected from server');
      setOpponentConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleMove = (move, newFen) => {
    setFen(newFen);
    setMoveHistory([...moveHistory, move]);

    // Emit move to opponent via Socket.IO
    if (socket) {
      socket.emit('makeMove', {
        gameId: id,
        move: move,
        playerColor: playerColor,
      });
    }

    setGameStatus(`Waiting for opponent's move...`);
  };

  const gameLink = `${window.location.origin}/game/${id}`;

  return (
    <div className="container">
      <h2>Game ID: {id}</h2>
      
      <div className="status">
        {gameStatus}
      </div>

      <div className="game-info">
        <h3>Share this link:</h3>
        <input 
          type="text" 
          value={gameLink} 
          readOnly 
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button 
          onClick={() => navigator.clipboard.writeText(gameLink)}
          style={{ width: '100%' }}
        >
          Copy Link
        </button>
      </div>

      {playerColor && opponentConnected && (
        <div className="game-container">
          <ChessBoard fen={fen} onMove={handleMove} />
          
          <div className="game-info">
            <h3>Game Info</h3>
            <p><strong>Your Color:</strong> {playerColor}</p>
            <p><strong>Opponent:</strong> {opponentConnected ? 'Connected ✓' : 'Waiting...'}</p>
            <p><strong>Moves:</strong> {moveHistory.length}</p>
            
            <h4>Move History:</h4>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              background: '#f9f9f9', 
              padding: '10px',
              borderRadius: '4px'
            }}>
              {moveHistory.length === 0 ? (
                <p style={{ margin: 0, color: '#999' }}>No moves yet</p>
              ) : (
                <p style={{ margin: 0, fontFamily: 'monospace' }}>
                  {moveHistory.join(' ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!opponentConnected && playerColor && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Waiting for opponent to join...</p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>Share the link above with a friend</p>
        </div>
      )}
    </div>
  );
}

export default Game;
