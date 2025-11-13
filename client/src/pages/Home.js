import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      // Generate unique game ID for each new game session
      const gameId = uuidv4();
      // Always create a fresh game - no caching of old games
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to start game:', error);
      setLoading(false);
    }
  };

  const handleBotGame = () => {
    navigate('/bots');
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '20px' }}>Welcome to chess.io!</h2>
        <p style={{ color: '#b0b0b0', fontSize: '1.1rem', marginBottom: '30px' }}>
          Play chess with friends online or challenge a bot opponent.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleStartGame} 
            disabled={loading}
            style={{ 
              padding: '15px 40px', 
              fontSize: '1rem',
              minWidth: '200px'
            }}
          >
            {loading ? 'Creating Game...' : '👥 Play Against Player'}
          </button>
          
          <button 
            onClick={handleBotGame}
            style={{ 
              padding: '15px 40px', 
              fontSize: '1rem',
              minWidth: '200px'
            }}
          >
            🤖 Play Against Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
