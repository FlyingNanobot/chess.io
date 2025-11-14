const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');
const cors = require('cors');
const GameManager = require('./gameManager');
const setupSocketHandlers = require('./socketHandlers');

const app = express();
// Determine whether to run HTTPS
const useHttps = process.argv.includes('--https') || process.env.USE_HTTPS === 'true';

let server;
if (useHttps) {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('HTTPS requested but certificate files not found in `server/certs`.');
    console.error('Run `npm run generate-certs` inside the `server` folder or copy your cert/key to `server/certs`.');
    process.exit(1);
  }

  const https = require('https');
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || (useHttps ? 'https://localhost:3000' : 'http://localhost:3000'),
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || (useHttps ? 'https://localhost:3000' : 'http://localhost:3000') }));
app.use(express.json());

// Initialize game manager
const gameManager = new GameManager();

// Routes
app.get('/ping', (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/game/:id', (req, res) => {
  const { id } = req.params;
  const game = gameManager.getGame(id);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json({
    id: game.id,
    status: game.status,
    fen: game.fen,
    moves: game.moves.length,
    players: {
      white: game.players.white ? 'Connected' : 'Waiting',
      black: game.players.black ? 'Connected' : 'Waiting',
    },
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Setup all socket event handlers
  setupSocketHandlers(socket, gameManager);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  const protocol = useHttps ? 'https' : 'http';
  console.log(`🎮 Chess server running on ${protocol}://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});

// Cleanup old/inactive games every 30 minutes
setInterval(() => {
  gameManager.cleanupOldGames();
  const activeGames = gameManager.getActiveGameCount();
  console.log(`[Cleanup] Active games: ${activeGames}`);
}, 30 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
