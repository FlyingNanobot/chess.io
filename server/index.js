const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const GameManager = require('./gameManager');
const setupSocketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize game manager
const gameManager = new GameManager();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
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
  console.log(`🎮 Chess server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
