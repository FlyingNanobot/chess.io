
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';

// Determine server URL. Prefer explicit env var; otherwise match the page protocol
const SOCKET_SERVER = process.env.REACT_APP_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

// Session cache utilities
const SessionCache = {
  KEY: 'chess_session',
  
  save: (gameId, playerColor, fen, moves, currentTurn) => {
    try {
      const session = {
        gameId,
        playerColor,
        fen,
        moves,
        currentTurn,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(SessionCache.KEY, JSON.stringify(session));
      console.log('Session saved:', session);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  restore: () => {
    try {
      const cached = sessionStorage.getItem(SessionCache.KEY);
      if (cached) {
        const session = JSON.parse(cached);
        // Only restore if game is relatively recent (within 24 hours)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          console.log('Session restored:', session);
          return session;
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
    return null;
  },

  clear: () => {
    try {
      sessionStorage.removeItem(SessionCache.KEY);
      console.log('Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },
};

function Game() {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const chessRef = React.useRef(new Chess());
  
  // Restore session from cache or initialize fresh
  const cachedSession = SessionCache.restore();
  const isRestoredSession = cachedSession && (cachedSession.gameId === id || !id);
  
  const [fen, setFen] = useState(isRestoredSession ? cachedSession.fen : chessRef.current.fen());
  const [playerColor, setPlayerColor] = useState(isRestoredSession ? cachedSession.playerColor : null);
  const [currentTurn, setCurrentTurn] = useState(isRestoredSession ? cachedSession.currentTurn : 'white');
  const [gameStatus, setGameStatus] = useState(isRestoredSession ? 'Session restored!' : 'Connecting...');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [moveHistory, setMoveHistory] = useState(isRestoredSession ? cachedSession.moves : []);
  const [errorMessage, setErrorMessage] = useState('');
  const gameId = id || (isRestoredSession ? cachedSession.gameId : null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const joinGameId = gameId || id;
      if (joinGameId) {
        newSocket.emit('joinGame', { gameId: joinGameId });
        // Request current game state
        newSocket.emit('getGameState', { gameId: joinGameId });
      }
    });

    newSocket.on('playerAssigned', (data) => {
      console.log('Player color:', data.color);
      setPlayerColor(data.color);
      setGameStatus(`You are ${data.color}. Waiting for opponent...`);
      // Cache session with assigned color
      SessionCache.save(gameId || id, data.color, fen, moveHistory, currentTurn);
    });

    newSocket.on('playerJoined', () => {
      console.log('Another player joined');
      setGameStatus('Opponent joined!');
    });

    newSocket.on('opponentJoined', () => {
      console.log('Opponent joined');
      setOpponentConnected(true);
      setGameStatus('Game started!');
    });

    newSocket.on('gameStateUpdate', (data) => {
      console.log('Game state update:', data);
      const { fen: newFen, currentTurn: turn, playerColor: movePlayerColor } = data;
      
      // Update local chess instance
      chessRef.current.load(newFen);
      setFen(newFen);
      setCurrentTurn(turn);

      // Update move history
      const history = chessRef.current.history();
      setMoveHistory(history);

      // Cache session
      const currentPlayerColor = movePlayerColor || playerColor;
      SessionCache.save(gameId || id, currentPlayerColor, newFen, history, turn);

      // Update game status
      if (movePlayerColor && movePlayerColor !== playerColor) {
        setGameStatus(`${movePlayerColor} moved. ${turn === playerColor ? 'Your turn!' : "Opponent's turn"}`);
      }
      setOpponentConnected(true);
      setErrorMessage('');
    });

    newSocket.on('gameError', (data) => {
      console.error('Game error:', data.message);
      setErrorMessage(data.message);
      setGameStatus(`Error: ${data.message}`);
    });

    newSocket.on('disconnect', () => {
      setGameStatus('Disconnected from server (session cached)');
      setOpponentConnected(false);
      // Session is already saved, don't clear it
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, id, playerColor]);

  const handleMove = (source, target) => {
    if (!socket) {
      setErrorMessage('Not connected to server');
      return false;
    }

    if (!playerColor) {
      setErrorMessage('Waiting to be assigned a color');
      return false;
    }

    if (currentTurn !== playerColor) {
      setErrorMessage("It's not your turn!");
      return false;
    }

    // Validate move locally first
    try {
      const move = chessRef.current.move({
        from: source,
        to: target,
        promotion: 'q',
      });

      if (!move) {
        setErrorMessage('Invalid move');
        return false;
      }

      // Cache optimistically before server confirmation
      const newFen = chessRef.current.fen();
      const newTurn = currentTurn === 'white' ? 'black' : 'white';
      const newHistory = chessRef.current.history();
      SessionCache.save(gameId || id, playerColor, newFen, newHistory, newTurn);

      // Emit move to server
      socket.emit('makeMove', {
        gameId: gameId || id,
        move: `${source}${target}`,
      });

      setErrorMessage('');
      return true;
    } catch (error) {
      console.error('Move error:', error);
      setErrorMessage('Invalid move');
      return false;
    }
  };

  const gameLink = `${window.location.origin}/game/${gameId || id}`;
  const isPlayerTurn = playerColor === currentTurn;

  // Handle session clear on logout/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Optionally add logic here to sync session state before unload
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="container">
      <h2>Game ID: {gameId || id}</h2>
      
      <div className={`status ${errorMessage ? 'error' : isPlayerTurn ? 'success' : ''}`}>
        {gameStatus}
      </div>

      {errorMessage && (
        <div className="status error">
          {errorMessage}
        </div>
      )}

      <div className="game-info">
        <h3>Share this link:</h3>
        <input 
          type="text" 
          value={gameLink} 
          readOnly 
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button 
          onClick={async () => {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(gameLink);
                setErrorMessage('Link copied!');
                setTimeout(() => setErrorMessage(''), 2000);
              } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = gameLink;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setErrorMessage('Link copied!');
                setTimeout(() => setErrorMessage(''), 2000);
              }
            } catch (err) {
              console.error('Failed to copy:', err);
              setErrorMessage('Could not copy link');
            }
          }}
          style={{ width: '100%' }}
        >
          Copy Link
        </button>
      </div>

      {playerColor && opponentConnected && (
        <div className="game-container">
          <ChessBoard 
            fen={fen} 
            onMove={handleMove}
            playerColor={playerColor}
            currentTurn={currentTurn}
            isPlayerTurn={isPlayerTurn}
          />
          
          <div className="game-info">
            <h3>Game Info</h3>
            <p><strong>Your Color:</strong> {playerColor}</p>
            <p><strong>Current Turn:</strong> {currentTurn}</p>
            <p><strong>Opponent:</strong> {opponentConnected ? 'Connected ✓' : 'Waiting...'}</p>
            <p><strong>Moves:</strong> {moveHistory.length}</p>
            <p><strong>Status:</strong> {isPlayerTurn ? '🟢 Your Turn' : '⏳ Opponent Turn'}</p>
            
            <h4>Move History:</h4>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px',
              borderRadius: '4px',
              color: '#e0e0e0',
              fontFamily: 'monospace'
            }}>
              {moveHistory.length === 0 ? (
                <p style={{ margin: 0, color: '#999' }}>No moves yet</p>
              ) : (
                <p style={{ margin: 0 }}>
                  {moveHistory.join(' ')}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                if (socket) {
                  socket.emit('resign', { gameId });
                }
                navigate('/');
              }}
              style={{
                width: '100%',
                marginTop: '20px',
                background: 'transparent',
                border: '1px solid #ef5350',
                color: '#ef5350',
              }}
            >
              Resign
            </button>
          </div>
        </div>
      )}

      {!opponentConnected && playerColor && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#e0e0e0' }}>
          <p>Waiting for opponent to join...</p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>Share the link above with a friend</p>
        </div>
      )}
    </div>
  );
}

export default Game;
