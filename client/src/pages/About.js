import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/About.css';

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="about-content">
        <div className="about-header">
          <h1>About This Website</h1>
          <p className="subtitle">And the person behind the chaos ♟️</p>
        </div>

        <div className="about-card">
          <div className="profile-section">
            <div className="profile-avatar">S.R.</div>
            <div className="profile-info">
              <h2>Satadal Ray</h2>
              <div className="profile-details">
                <span className="badge age">30</span>
                <span className="badge gender">Male</span>
                <span className="badge location">🇮🇳 India</span>
                <span className="badge profession">Developer</span>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h3>About This Website</h3>
            <p>
              Welcome to Chess.io, where two players can duke it out in the world's most elegant game. 
              Or challenge an AI bot that may or may not be plotting world domination through 64 squares.
            </p>
            <p>
              This application was built because someone once said "chess is boring without code" 
              and I took that as a personal challenge. Spoiler alert: I won't be retiring to the International Master circuit anytime soon.
            </p>
          </div>

          <div className="about-section">
            <h3>Features</h3>
            <ul className="features-list">
              <li>⚔️ Play against other players in real-time</li>
              <li>🤖 Challenge AI opponents of varying difficulty</li>
              <li>📊 Real-time position analysis</li>
              <li>📱 Fully responsive design (mobile, tablet, desktop)</li>
              <li>🎨 Beautiful dark theme UI</li>
              <li>💾 Game history and move tracking</li>
              <li>🚀 Socket.IO powered multiplayer</li>
            </ul>
          </div>

          <div className="about-section funny-section">
            <h3>Fun Facts</h3>
            <ul className="fun-facts">
              <li>This bot has never heard of "throwing the game." It's annoyingly consistent.</li>
              <li>If you beat the bot, there's a 99% chance it's because the bot felt generous that day.</li>
              <li>The code was written while listening to intense classical music. Mozart was judging me.</li>
              <li>Every bug fixed was replaced with two new ones. It's called "feature expansion."</li>
              <li>This took way longer than I said it would. Story of my life.</li>
              <li>Somewhere, a chess grandmaster is shaking their head at this entire project.</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>Tech Stack</h3>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Node.js</span>
              <span className="tech-badge">Socket.IO</span>
              <span className="tech-badge">Chess.js</span>
              <span className="tech-badge">Express</span>
              <span className="tech-badge">CSS3</span>
            </div>
          </div>

          <div className="about-section">
            <h3>A Note From The Developer</h3>
            <p className="note">
              "If you enjoy this game, please pretend you do even if you don't. 
              If you find bugs, please also pretend you didn't. 
              Most importantly, enjoy the game and may the best player (or the luckiest one) win! 🏆"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
