const { v4: uuidv4 } = require('uuid');

class GameManager {
  constructor() {
    this.games = new Map();
  }

  /**
   * Create a new game session
   * @param {string} gameId - Unique game ID
   * @returns {Object} Game object
   */
  createGame(gameId) {
    const game = {
      id: gameId,
      players: {
        white: null,
        black: null,
      },
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      createdAt: new Date(),
      status: 'waiting', // waiting, active, finished
    };

    this.games.set(gameId, game);
    return game;
  }

  /**
   * Get a game by ID
   * @param {string} gameId
   * @returns {Object|null}
   */
  getGame(gameId) {
    return this.games.get(gameId) || null;
  }

  /**
   * Assign a player to a game
   * @param {string} gameId
   * @param {string} socketId
   * @returns {Object} { color, game }
   */
  assignPlayer(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    let color;
    if (!game.players.white) {
      color = 'white';
      game.players.white = socketId;
    } else if (!game.players.black) {
      color = 'black';
      game.players.black = socketId;
      game.status = 'active';
    } else {
      throw new Error('Game is full');
    }

    return { color, game };
  }

  /**
   * Record a move
   * @param {string} gameId
   * @param {string} move
   * @param {string} fen
   */
  recordMove(gameId, move, fen) {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    game.moves.push({
      move,
      timestamp: new Date(),
    });
    game.fen = fen;
  }

  /**
   * End a game
   * @param {string} gameId
   */
  endGame(gameId) {
    const game = this.getGame(gameId);
    if (game) {
      game.status = 'finished';
    }
  }

  /**
   * Remove a game
   * @param {string} gameId
   */
  deleteGame(gameId) {
    this.games.delete(gameId);
  }

  /**
   * Get player's color by socket ID
   * @param {string} gameId
   * @param {string} socketId
   * @returns {string|null}
   */
  getPlayerColor(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) return null;

    if (game.players.white === socketId) return 'white';
    if (game.players.black === socketId) return 'black';
    return null;
  }

  /**
   * Get opponent's socket ID
   * @param {string} gameId
   * @param {string} socketId
   * @returns {string|null}
   */
  getOpponent(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) return null;

    if (game.players.white === socketId) return game.players.black;
    if (game.players.black === socketId) return game.players.white;
    return null;
  }
}

module.exports = GameManager;
