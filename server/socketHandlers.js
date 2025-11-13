const { Chess } = require('chess.js');

/**
 * Setup Socket.IO event handlers for game logic
 * @param {Socket} socket
 * @param {GameManager} gameManager
 */
function setupSocketHandlers(socket, gameManager) {
  /**
   * Handle player joining a game
   */
  socket.on('joinGame', (data) => {
    const { gameId } = data;

    try {
      // Get or create game
      let game = gameManager.getGame(gameId);
      if (!game) {
        game = gameManager.createGame(gameId);
      }

      // Assign player a color
      const { color } = gameManager.assignPlayer(gameId, socket.id);

      // Join socket to game room
      socket.join(gameId);

      // Notify player of their assigned color
      socket.emit('playerAssigned', { color, gameId, fen: game.fen });

      // Notify opponent that a player joined
      socket.to(gameId).emit('playerJoined', { playerColor: color });

      // If both players are connected, notify them
      if (game.status === 'active') {
        socket.to(gameId).emit('opponentJoined');
        socket.emit('opponentJoined');
      }

      console.log(`Player ${socket.id} joined game ${gameId} as ${color}`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error joining game:', error);
    }
  });

  /**
   * Handle player making a move
   */
  socket.on('makeMove', (data) => {
    const { gameId, move, playerColor } = data;

    try {
      const game = gameManager.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Validate move using chess.js
      const chess = new Chess(game.fen);
      const result = chess.move(move, { sloppy: true });

      if (!result) {
        throw new Error('Invalid move');
      }

      // Record the move
      const newFen = chess.fen();
      gameManager.recordMove(gameId, move, newFen);

      // Broadcast move to opponent
      socket.to(gameId).emit('moveReceived', {
        move: result.san,
        playerColor,
        fen: newFen,
      });

      socket.emit('moveAccepted', { move: result.san });

      console.log(`Move ${move} in game ${gameId}`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error making move:', error);
    }
  });

  /**
   * Handle player disconnection
   */
  socket.on('disconnect', () => {
    console.log(`Player ${socket.id} disconnected`);
    // Notify opponent
    socket.broadcast.emit('opponentDisconnected');
  });

  /**
   * Handle player surrender/resignation
   */
  socket.on('resign', (data) => {
    const { gameId } = data;

    try {
      const game = gameManager.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      gameManager.endGame(gameId);

      const playerColor = gameManager.getPlayerColor(gameId, socket.id);
      socket.to(gameId).emit('opponentResigned', { playerColor });
      socket.emit('resigned');

      console.log(`Player ${socket.id} resigned from game ${gameId}`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error resigning:', error);
    }
  });

  /**
   * Handle chat messages (optional)
   */
  socket.on('sendMessage', (data) => {
    const { gameId, message } = data;

    socket.to(gameId).emit('messageReceived', {
      message,
      timestamp: new Date(),
    });
  });
}

module.exports = setupSocketHandlers;
