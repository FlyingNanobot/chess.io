import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import BotEngine from '../utils/BotEngine';

function BotGame() {
  const { botType, color } = useParams();
  const navigate = useNavigate();

  // Generate unique bot game instance ID if not provided
  const [gameId] = useState(() => {
    return uuidv4();
  });

  const chessRef = React.useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [currentTurn, setCurrentTurn] = useState('white');
  const [gameStatus, setGameStatus] = useState('Loading...');
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [botThinking, setBotThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const playerColor = color; // Use the color from URL params directly

  // Store bot game session in sessionStorage (each game instance is isolated)
  useEffect(() => {
    const sessionKey = `botgame_${gameId}`;
    sessionStorage.setItem(sessionKey, JSON.stringify({
      gameId,
      botType,
      playerColor,
      timestamp: Date.now(),
    }));
  }, [gameId, botType, playerColor]);

  // Initialize game
  useEffect(() => {
    if (playerColor === 'black') {
      setGameStatus('Bot is thinking...');
      setBotThinking(true);
    } else {
      setGameStatus('Your turn! Play as White');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger bot move when it's bot's turn
  useEffect(() => {
    if (currentTurn !== playerColor && !gameOver && !botThinking) {
      triggerBotMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, gameOver, botThinking]);

  const triggerBotMove = async () => {
    setBotThinking(true);
    try {
      const botColor = playerColor === 'white' ? 'black' : 'white';
      const move = await BotEngine.getMove(fen, botType, 6); // Difficulty level 6

      if (!move) {
        // No legal moves available
        handleGameEnd();
        return;
      }

      // Make the bot's move
      const result = chessRef.current.move(move, { sloppy: true });
      if (!result) {
        console.error('Invalid bot move:', move);
        setBotThinking(false);
        return;
      }

      const newFen = chessRef.current.fen();
      setFen(newFen);

      const history = chessRef.current.history();
      setMoveHistory(history);

      // Switch turn
      const newTurn = currentTurn === 'white' ? 'black' : 'white';
      setCurrentTurn(newTurn);

      // Update status
      if (chessRef.current.isCheckmate()) {
        handleGameEnd();
      } else if (chessRef.current.isCheck()) {
        setGameStatus(`${botColor} moved. You are in check!`);
      } else if (chessRef.current.isStalemate()) {
        setGameStatus('Stalemate!');
        handleGameEnd();
      } else {
        setGameStatus('Your turn!');
      }

      setErrorMessage('');
    } catch (error) {
      console.error('Bot move error:', error);
      setErrorMessage('Bot encountered an error');
    } finally {
      setBotThinking(false);
    }
  };

  const handleGameEnd = () => {
    setGameOver(true);
    if (chessRef.current.isCheckmate()) {
      const winner = currentTurn === playerColor ? 'Bot' : 'You';
      setGameResult(`Checkmate! ${winner} won!`);
      setGameStatus(`Checkmate! ${winner} won!`);
    } else if (chessRef.current.isStalemate()) {
      setGameResult('Stalemate - Draw!');
      setGameStatus('Stalemate - Draw!');
    } else if (chessRef.current.isInsufficientMaterial()) {
      setGameResult('Draw - Insufficient Material');
      setGameStatus('Draw - Insufficient Material');
    }
  };

  const handleMove = (source, target) => {
    if (gameOver) {
      setErrorMessage('Game is over');
      return false;
    }

    if (currentTurn !== playerColor) {
      setErrorMessage("It's not your turn!");
      return false;
    }

    if (botThinking) {
      setErrorMessage('Bot is thinking...');
      return false;
    }

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

      const newFen = chessRef.current.fen();
      setFen(newFen);

      const history = chessRef.current.history();
      setMoveHistory(history);

      // Switch turn
      const newTurn = currentTurn === 'white' ? 'black' : 'white';
      setCurrentTurn(newTurn);

      // Check game status
      if (chessRef.current.isCheckmate()) {
        setGameStatus('Checkmate! You won!');
        setGameResult('Checkmate! You won!');
        setGameOver(true);
      } else if (chessRef.current.isCheck()) {
        setGameStatus('Bot is in check... Bot is thinking...');
        setBotThinking(true);
      } else if (chessRef.current.isStalemate()) {
        setGameStatus('Stalemate!');
        setGameResult('Stalemate - Draw!');
        setGameOver(true);
      } else {
        setGameStatus('Bot is thinking...');
        setBotThinking(true);
      }

      setErrorMessage('');
      return true;
    } catch (error) {
      console.error('Move error:', error);
      setErrorMessage('Invalid move');
      return false;
    }
  };

  const handleResign = () => {
    setGameStatus('You resigned - Bot wins!');
    setGameResult('You resigned - Bot wins!');
    setGameOver(true);
  };

  const handleNewGame = () => {
    navigate('/bots');
  };

  const isPlayerTurn = currentTurn === playerColor && !botThinking && !gameOver;
  const botName = botType === 'stockfish' ? 'Stockfish' : 'Enpassanto';

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#ffffff', margin: 0 }}>vs {botName}</h2>
        <button
          onClick={handleNewGame}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            background: 'transparent',
            border: '1px solid #667eea',
            color: '#667eea',
          }}
        >
          ← New Game
        </button>
      </div>

      <div className={`status ${errorMessage ? 'error' : ''}`}>
        {gameStatus}
      </div>

      {errorMessage && (
        <div className="status error">{errorMessage}</div>
      )}

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
          <p>
            <strong>Your Color:</strong> {playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}
          </p>
          <p>
            <strong>Bot:</strong> {botName}
          </p>
          <p>
            <strong>Current Turn:</strong> {currentTurn === 'white' ? '⚪ White' : '⚫ Black'}
          </p>
          <p>
            <strong>Moves:</strong> {moveHistory.length}
          </p>
          <p>
            <strong>Status:</strong> {botThinking ? '⏳ Bot thinking...' : isPlayerTurn ? '🟢 Your turn' : '⏰ Waiting'}
          </p>

          <h4>Move History:</h4>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'rgba(255,255,255,0.1)',
              padding: '10px',
              borderRadius: '4px',
              color: '#e0e0e0',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          >
            {moveHistory.length === 0 ? (
              <p style={{ margin: 0, color: '#999' }}>No moves yet</p>
            ) : (
              <p style={{ margin: 0 }}>
                {moveHistory.join(' ')}
              </p>
            )}
          </div>

          {gameOver && (
            <div style={{ marginTop: '20px' }}>
              <div className="status success" style={{ marginBottom: '15px' }}>
                {gameResult}
              </div>
              <button onClick={handleNewGame} style={{ width: '100%', marginBottom: '10px' }}>
                Play Again
              </button>
            </div>
          )}

          {!gameOver && (
            <button
              onClick={handleResign}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default BotGame;
