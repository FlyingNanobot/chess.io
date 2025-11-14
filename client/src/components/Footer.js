import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © 2025 Chess.io - Made with ♟️ and ☕
        </p>
        <button 
          className="about-link"
          onClick={() => navigate('/about')}
        >
          About This Website
        </button>
      </div>
    </footer>
  );
}

export default Footer;
