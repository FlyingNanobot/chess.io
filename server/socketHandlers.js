const { Chess } = require('chess.js');

/**
 * Setup Socket.IO event handlers for isolated concurrent game sessions
 * Each game is completely isolated - moves are only broadcast to players in that game
 * @param {Socket} socket
 * @param {GameManager} gameManager
 */
function setupSocketHandlers(socket, gameManager) {
  /**
   * Handle player joining a specific game room
   * Prevents more than 2 players in the same game
   */
  socket.on('joinGame', (data) => {
    const { gameId } = data;

    try {
      // Get or create game for this gameId
      let game = gameManager.getGame(gameId);
      if (!game) {
        game = gameManager.createGame(gameId);
      }

      // Check if game is full
      const playersInGame = (game.players.white ? 1 : 0) + (game.players.black ? 1 : 0);
      if (playersInGame >= 2 && !game.players.white === socket.id && !game.players.black === socket.id) {
        socket.emit('gameError', { message: 'Game is full - cannot join' });
        return;
      }

      // Assign player to this game session
      const { color, isReconnect } = gameManager.assignPlayer(gameId, socket.id);

      // Join socket to game-specific room (isolation)
      socket.join(gameId);

      // Notify this player of their color
      socket.emit('playerAssigned', { color, gameId, fen: game.fen });

      if (!isReconnect) {
        // Notify opponent (only in this game room) that a player joined
        socket.to(gameId).emit('playerJoined', { playerColor: color });

        // If both players are connected, notify both
        if (game.status === 'active') {
          socket.to(gameId).emit('opponentJoined');
          socket.emit('opponentJoined');
        }
      } else {
        // Reconnection - send full game state
        socket.emit('gameStateUpdate', {
          fen: game.fen,
          currentTurn: game.currentTurn,
          status: game.status,
          playerColor: color,
        });
      }

      console.log(`[Game ${gameId}] Player ${socket.id.substring(0, 8)} joined as ${color}`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error joining game:', error);
    }
  });

  /**
   * Handle player making a move in an isolated game session
   * Move is only broadcast to the opponent in the same game
   */
  socket.on('makeMove', (data) => {
    const { gameId, move } = data;

    try {
      const game = gameManager.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Verify it's the player's turn
      if (!gameManager.isPlayersTurn(gameId, socket.id)) {
        throw new Error("It is not your turn");
      }

      const playerColor = gameManager.getPlayerColor(gameId, socket.id);

      // Validate move using chess.js
      const chess = new Chess(game.fen);
      const result = chess.move(move, { sloppy: true });

      if (!result) {
        throw new Error('Invalid move');
      }

      // Record the move in this game session
      const newFen = chess.fen();
      gameManager.recordMove(gameId, move, newFen);

      // Get updated game state
      const gameState = gameManager.getGameState(gameId);

      // Broadcast move ONLY to this game room (isolated)
      const io = socket.nsp.server || socket.server;
      io.to(gameId).emit('gameStateUpdate', {
        fen: newFen,
        currentTurn: gameState.currentTurn,
        lastMove: result.san,
        playerColor,
      });

      console.log(`[Game ${gameId}] Move ${result.san} by ${playerColor}`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error making move:', error);
    }
  });

  /**
   * Handle request for current game state (for new connections or page refresh)
   */
  socket.on('getGameState', (data) => {
    const { gameId } = data;
    try {
      const gameState = gameManager.getGameState(gameId);
      if (!gameState) {
        throw new Error('Game not found');
      }

      const playerColor = gameManager.getPlayerColor(gameId, socket.id);
      socket.emit('gameStateUpdate', {
        fen: gameState.fen,
        currentTurn: gameState.currentTurn,
        playerColor,
        status: gameState.status,
      });
    } catch (error) {
      socket.emit('gameError', { message: error.message });
    }
  });

  /**
   * Handle player disconnection
   * Remove player from game but keep game active if opponent still connected
   */
  socket.on('disconnect', () => {
    const gameId = gameManager.getGameByPlayer(socket.id);
    if (gameId) {
      gameManager.removePlayer(gameId, socket.id);
      const game = gameManager.getGame(gameId);

      // Notify opponent in this game room only
      const io = socket.nsp.server || socket.server;
      io.to(gameId).emit('opponentDisconnected', {
        message: 'Opponent disconnected',
      });

      console.log(`[Game ${gameId}] Player ${socket.id.substring(0, 8)} disconnected`);

      // Clean up if both players are gone
      if (!game.players.white && !game.players.black) {
        gameManager.deleteGame(gameId);
        console.log(`[Game ${gameId}] Game deleted (no players)`);
      }
    }
  });

  /**
   * Handle player resignation (surrender)
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
      const io = socket.nsp.server || socket.server;

      // Broadcast resignation only to this game room
      io.to(gameId).emit('opponentResigned', { playerColor });
      socket.emit('resignConfirmed');

      console.log(`[Game ${gameId}] ${playerColor} resigned`);
    } catch (error) {
      socket.emit('gameError', { message: error.message });
      console.error('Error resigning:', error);
    }
  });
}

module.exports = setupSocketHandlers;
