import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import AnalysisPanel from '../components/AnalysisPanel';
import GameModal from '../components/GameModal';
import BotEngine from '../utils/BotEngine';
import PositionAnalyzer from '../utils/PositionAnalyzer';

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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [bestMove, setBestMove] = useState(null);
  const [evaluation, setEvaluation] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    buttons: [],
  });

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
    } else {
      setGameStatus('Your turn! Play as White');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger bot move when it's bot's turn
  useEffect(() => {
    console.log('[BotGame] useEffect triggered:', { 
      currentTurn, 
      playerColor, 
      gameOver, 
      botThinking,
      shouldTrigger: currentTurn !== playerColor && !gameOver && !botThinking
    });
    
    if (currentTurn !== playerColor && !gameOver && !botThinking) {
      console.log('[BotGame] Triggering bot move...');
      triggerBotMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, gameOver, botThinking]);

  const triggerBotMove = async () => {
    console.log('[BotGame] triggerBotMove called');
    
    // Set botThinking immediately to prevent re-triggering
    setBotThinking(true);
    
    // Use chessRef.current.fen() directly to avoid state sync issues
    const currentFen = chessRef.current.fen();
    console.log('[BotGame] Current state:', { 
      fen: currentFen, 
      botType, 
      playerColor, 
      currentTurn,
      botThinking: true
    });
    
    try {
      const botColor = playerColor === 'white' ? 'black' : 'white';
      console.log('[BotGame] Requesting bot move with:', { fen: currentFen.substring(0, 50) + '...', botType, difficulty: 6 });
      
      const move = await BotEngine.getMove(currentFen, botType, 6); // Difficulty level 6
      
      console.log('[BotGame] Bot returned move:', move);

      if (!move) {
        // No legal moves available
        console.log('[BotGame] No legal moves - calling handleGameEnd');
        handleGameEnd();
        return;
      }

      // Make the bot's move
      console.log('[BotGame] Making bot move:', move);
      const result = chessRef.current.move(move, { sloppy: true });
      
      if (!result) {
        console.error('[BotGame] Invalid bot move:', move, 'on FEN:', currentFen);
        console.error('[BotGame] Available moves:', chessRef.current.moves().slice(0, 10));
        setBotThinking(false);
        return;
      }

      const newFen = chessRef.current.fen();
      console.log('[BotGame] Move successful. New FEN:', newFen.substring(0, 50) + '...');
      
      // Update both fen state AND ensure chessRef is synced
      setFen(newFen);

      const history = chessRef.current.history();
      setMoveHistory(history);

      // Switch turn
      const newTurn = currentTurn === 'white' ? 'black' : 'white';
      console.log('[BotGame] Switching turn from', currentTurn, 'to', newTurn);
      setCurrentTurn(newTurn);

      // Update status
      if (chessRef.current.isCheckmate()) {
        console.log('[BotGame] Checkmate detected');
        handleGameEnd();
      } else if (chessRef.current.isCheck()) {
        console.log('[BotGame] Check detected');
        setGameStatus(`${botColor} moved. You are in check!`);
      } else if (chessRef.current.isStalemate()) {
        console.log('[BotGame] Stalemate detected');
        setGameStatus('Stalemate!');
        handleGameEnd();
      } else {
        console.log('[BotGame] Game continues - player turn');
        setGameStatus('Your turn!');
      }

      setErrorMessage('');
    } catch (error) {
      console.error('[BotGame] Bot move error:', error);
      setErrorMessage('Bot encountered an error');
    } finally {
      setBotThinking(false);
    }
  };

  const handleGameEnd = () => {
    console.log('[BotGame] handleGameEnd called');
    setGameOver(true);
    
    if (chessRef.current.isCheckmate()) {
      const winner = currentTurn === playerColor ? 'Bot' : 'You';
      const resultMessage = winner === 'You' ? 'You defeated the bot!' : 'The bot got you!';
      setGameResult(`Checkmate! ${winner} won!`);
      setGameStatus(`Checkmate! ${winner} won!`);
      
      setModalData({
        title: '♟️ Checkmate!',
        message: resultMessage,
        buttons: [
          {
            label: 'Play Again',
            variant: 'primary',
            onClick: () => navigate('/bots'),
          },
          {
            label: 'Back to Home',
            variant: 'secondary',
            onClick: () => navigate('/'),
          },
        ],
      });
    } else if (chessRef.current.isStalemate()) {
      setGameResult('Stalemate - Draw!');
      setGameStatus('Stalemate - Draw!');
      
      setModalData({
        title: '🤝 Stalemate',
        message: 'The game is a draw.',
        buttons: [
          {
            label: 'Play Again',
            variant: 'primary',
            onClick: () => navigate('/bots'),
          },
          {
            label: 'Back to Home',
            variant: 'secondary',
            onClick: () => navigate('/'),
          },
        ],
      });
    } else if (chessRef.current.isInsufficientMaterial()) {
      setGameResult('Draw - Insufficient Material');
      setGameStatus('Draw - Insufficient Material');
      
      setModalData({
        title: '🤝 Draw',
        message: 'Insufficient material to continue.',
        buttons: [
          {
            label: 'Play Again',
            variant: 'primary',
            onClick: () => navigate('/bots'),
          },
          {
            label: 'Back to Home',
            variant: 'secondary',
            onClick: () => navigate('/'),
          },
        ],
      });
    }
    
    setModalOpen(true);
  };

  const handleMove = (source, target) => {
    console.log('[BotGame] handleMove called:', { source, target, gameOver, currentTurn, playerColor, botThinking });
    
    if (gameOver) {
      console.log('[BotGame] Game is over - move rejected');
      setErrorMessage('Game is over');
      return false;
    }

    if (currentTurn !== playerColor) {
      console.log('[BotGame] Not player turn:', { currentTurn, playerColor });
      setErrorMessage("It's not your turn!");
      return false;
    }

    if (botThinking) {
      console.log('[BotGame] Bot is thinking - move rejected');
      setErrorMessage('Bot is thinking...');
      return false;
    }

    try {
      console.log('[BotGame] Attempting move from', source, 'to', target);
      const move = chessRef.current.move({
        from: source,
        to: target,
        promotion: 'q',
      });

      if (!move) {
        console.log('[BotGame] Move rejected as illegal');
        setErrorMessage('Invalid move');
        return false;
      }

      console.log('[BotGame] Move successful:', move.san);
      const newFen = chessRef.current.fen();
      console.log('[BotGame] New FEN:', newFen.substring(0, 50) + '...');
      setFen(newFen);

      const history = chessRef.current.history();
      setMoveHistory(history);

      // Switch turn
      const newTurn = currentTurn === 'white' ? 'black' : 'white';
      console.log('[BotGame] Switching turn to:', newTurn);
      setCurrentTurn(newTurn);

      // Check game status
      if (chessRef.current.isCheckmate()) {
        console.log('[BotGame] You achieved checkmate!');
        setGameStatus('Checkmate! You won!');
        setGameResult('Checkmate! You won!');
        setGameOver(true);
      } else if (chessRef.current.isCheck()) {
        console.log('[BotGame] Bot is in check');
        setGameStatus('Bot is in check... Bot is thinking...');
        setBotThinking(true);
      } else if (chessRef.current.isStalemate()) {
        console.log('[BotGame] Stalemate!');
        setGameStatus('Stalemate!');
        setGameResult('Stalemate - Draw!');
        setGameOver(true);
      } else {
        console.log('[BotGame] Game continues - bot turn');
        setGameStatus('Bot is thinking...');
        setBotThinking(true);
      }

      setErrorMessage('');
      return true;
    } catch (error) {
      console.error('[BotGame] Move error:', error);
      setErrorMessage('Invalid move');
      return false;
    }
  };

  const handleResign = () => {
    setGameStatus('You resigned - Bot wins!');
    setGameResult('You resigned - Bot wins!');
    setGameOver(true);
    
    setModalData({
      title: '🏳️ Resignation',
      message: 'You resigned. The bot wins!',
      buttons: [
        {
          label: 'Play Again',
          variant: 'primary',
          onClick: () => navigate('/bots'),
        },
        {
          label: 'Back to Home',
          variant: 'secondary',
          onClick: () => navigate('/'),
        },
      ],
    });
    setModalOpen(true);
  };

  const handleNewGame = () => {
    navigate('/bots');
  };

  const handleAnalyzePosition = async () => {
    setShowAnalysis(!showAnalysis);
    if (!showAnalysis) {
      setIsAnalyzing(true);
      try {
        // Run analysis in a timeout to avoid blocking UI
        setTimeout(() => {
          const best = PositionAnalyzer.findBestMove(fen, 3, 6);
          const eval_ = PositionAnalyzer.evaluatePosition(fen);
          setBestMove(best.move ? { from: best.move.substring(0, 2), to: best.move.substring(2, 4) } : null);
          setEvaluation(eval_);
          setIsAnalyzing(false);
        }, 100);
      } catch (error) {
        console.error('Analysis error:', error);
        setIsAnalyzing(false);
      }
    }
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
          boardSize={500}
          boardOrientation={playerColor}
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

          <button
            onClick={handleAnalyzePosition}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '15px',
              marginBottom: '15px',
              background: showAnalysis ? '#667eea' : 'transparent',
              border: '1px solid #667eea',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showAnalysis ? '✓ Analysis' : '📊 Analyze Position'}
          </button>

          {showAnalysis && (
            <AnalysisPanel
              bestMove={bestMove}
              evaluation={evaluation}
              isAnalyzing={isAnalyzing}
              playerColor={playerColor}
            />
          )}

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

      <GameModal
        isOpen={modalOpen}
        title={modalData.title}
        message={modalData.message}
        buttons={modalData.buttons}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default BotGame;
