const { v4: uuidv4 } = require('uuid');

/**
 * GameManager: Handles concurrent game sessions with proper isolation
 * Each game has its own state, players, and turn tracking
 */
class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> game state
    this.playerGameMap = new Map(); // socketId -> gameId (for quick lookup)
  }

  /**
   * Create a new game session with unique ID
   * @param {string} gameId - Unique game ID (generated on client)
   * @returns {Object} Game object
   */
  createGame(gameId) {
    if (this.games.has(gameId)) {
      return this.games.get(gameId);
    }

    const game = {
      id: gameId,
      players: {
        white: null,
        black: null,
      },
      playerInfo: {
        // Track both socketId and player metadata
        white: null,
        black: null,
      },
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      currentTurn: 'white',
      createdAt: new Date(),
      status: 'waiting', // waiting, active, finished
      lastActivity: Date.now(),
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
   * Get game ID by player socket ID
   * @param {string} socketId
   * @returns {string|null}
   */
  getGameByPlayer(socketId) {
    return this.playerGameMap.get(socketId) || null;
  }

  /**
   * Assign a player to a game (isolated session)
   * @param {string} gameId
   * @param {string} socketId
   * @returns {Object} { color, game }
   */
  assignPlayer(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Prevent rejoin if player is already in this game
    if (game.players.white === socketId || game.players.black === socketId) {
      const color = game.players.white === socketId ? 'white' : 'black';
      return { color, game, isReconnect: true };
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
      throw new Error('Game is full - both players already joined');
    }

    // Track player-to-game mapping for quick lookup
    this.playerGameMap.set(socketId, gameId);
    game.lastActivity = Date.now();

    return { color, game };
  }

  /**
   * Remove a player from a game and clean up if needed
   * @param {string} gameId
   * @param {string} socketId
   */
  removePlayer(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) return;

    if (game.players.white === socketId) {
      game.players.white = null;
    } else if (game.players.black === socketId) {
      game.players.black = null;
    }

    this.playerGameMap.delete(socketId);
    game.lastActivity = Date.now();

    // Mark game as finished if no players left
    if (!game.players.white && !game.players.black) {
      game.status = 'finished';
    }
  }

  /**
   * Clean up old/inactive games (games older than 24 hours or without players)
   */
  cleanupOldGames() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [gameId, game] of this.games) {
      // Remove games with no players
      if (!game.players.white && !game.players.black) {
        this.games.delete(gameId);
        continue;
      }

      // Remove games older than 24 hours
      if (now - game.lastActivity > maxAge) {
        this.games.delete(gameId);
      }
    }
  }

  /**
   * Get active game count
   * @returns {number}
   */
  getActiveGameCount() {
    return this.games.size;
  }

  /**
   * Record a move and switch turns in an isolated game session
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
    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
    game.lastActivity = Date.now();
  }

  /**
   * End a game session
   * @param {string} gameId
   */
  endGame(gameId) {
    const game = this.getGame(gameId);
    if (game) {
      game.status = 'finished';
      game.lastActivity = Date.now();
    }
  }

  /**
   * Delete a game session (permanent removal)
   * @param {string} gameId
   */
  deleteGame(gameId) {
    const game = this.getGame(gameId);
    if (game) {
      // Remove all player mappings
      if (game.players.white) {
        this.playerGameMap.delete(game.players.white);
      }
      if (game.players.black) {
        this.playerGameMap.delete(game.players.black);
      }
    }
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

  /**
   * Check if it's a player's turn
   * @param {string} gameId
   * @param {string} socketId
   * @returns {boolean}
   */
  isPlayersTurn(gameId, socketId) {
    const game = this.getGame(gameId);
    if (!game) return false;

    const playerColor = this.getPlayerColor(gameId, socketId);
    return playerColor === game.currentTurn;
  }

  /**
   * Get current game state
   * @param {string} gameId
   * @returns {Object}
   */
  getGameState(gameId) {
    const game = this.getGame(gameId);
    if (!game) return null;

    return {
      id: game.id,
      fen: game.fen,
      currentTurn: game.currentTurn,
      status: game.status,
      players: game.players,
    };
  }
}

module.exports = GameManager;
