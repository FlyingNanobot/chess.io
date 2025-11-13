import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Bots() {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const bots = [
    { value: 'enpassanto', label: 'Enpassanto (Random Moves)' },
    { value: 'stockfish', label: 'Stockfish (Advanced)' },
  ];

  const colors = [
    { value: 'white', label: 'White (You move first)' },
    { value: 'black', label: 'Black (Bot moves first)' },
  ];

  const handleStartGame = () => {
    if (selectedBot && selectedColor) {
      navigate(`/bot-game/${selectedBot}/${selectedColor}`);
    }
  };

  const isReady = selectedBot && selectedColor;

  return (
    <div className="container">
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '30px' }}>
          Play Against a Bot
        </h2>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', color: '#e0e0e0', marginBottom: '10px', fontWeight: 'bold' }}>
            Select Bot Opponent:
          </label>
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e0e0e0',
              border: '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <option value="">-- Choose a bot --</option>
            {bots.map((bot) => (
              <option key={bot.value} value={bot.value}>
                {bot.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', color: '#e0e0e0', marginBottom: '10px', fontWeight: 'bold' }}>
            Select Your Color:
          </label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e0e0e0',
              border: '1px solid rgba(102, 126, 234, 0.5)',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <option value="">-- Choose your color --</option>
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStartGame}
          disabled={!isReady}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '1.1rem',
            marginTop: '20px',
            opacity: isReady ? 1 : 0.5,
            cursor: isReady ? 'pointer' : 'not-allowed',
          }}
        >
          🎮 Start Game
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.95rem',
            marginTop: '15px',
            background: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Bots;
