import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const gameId = uuidv4();
      // Optional: Call backend to register game session
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to start game:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center' }}>
        <h2>Welcome to Instant Chess!</h2>
        <p>Start a new game and share the link with a friend to play together.</p>
        <button 
          onClick={handleStartGame} 
          disabled={loading}
          style={{ marginTop: '20px', padding: '15px 40px', fontSize: '1.1rem' }}
        >
          {loading ? 'Creating Game...' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}

export default Home;
