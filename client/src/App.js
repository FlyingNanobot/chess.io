import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Bots from './pages/Bots';
import BotGame from './pages/BotGame';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="App">
      <header className="App-header" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <h1 style={{ transition: 'transform 0.2s ease', marginBottom: 0 }}>♟️ chess.io</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/bots" element={<Bots />} />
        <Route path="/bot-game/:botType/:color" element={<BotGame />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
