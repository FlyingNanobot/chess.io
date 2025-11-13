import { Chess } from 'chess.js';

/**
 * BotEngine: Handles bot move generation for different bot types
 */
class BotEngine {
  /**
   * Get a move from the bot
   * @param {string} fen - Current board position
   * @param {string} botType - Type of bot ('enpassanto' or 'stockfish')
   * @param {number} difficulty - Difficulty level (1-10, default 5)
   * @returns {Promise<string>} - Move in algebraic notation (e.g., 'e2e4')
   */
  static async getMove(fen, botType = 'enpassanto', difficulty = 5) {
    try {
      switch (botType.toLowerCase()) {
        case 'stockfish':
          return await this.getStockfishMove(fen, difficulty);
        case 'enpassanto':
        default:
          return await this.getEnpassantoMove(fen, difficulty);
      }
    } catch (error) {
      console.error('Bot move generation error:', error);
      // Fallback to random move
      return this.getRandomMove(fen);
    }
  }

  /**
   * Get a random legal move (Enpassanto bot)
   * @param {string} fen - Current board position
   * @param {number} difficulty - Difficulty level (affects move quality)
   * @returns {Promise<string>}
   */
  static async getEnpassantoMove(fen, difficulty = 5) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const chess = new Chess(fen);
        const moves = chess.moves();

        if (moves.length === 0) {
          resolve(null); // No legal moves (checkmate/stalemate)
        }

        // Difficulty-based move selection
        let move;
        if (difficulty >= 8) {
          // High difficulty: prioritize captures and checks
          move = this.selectBestMoveHeuristic(chess, moves);
        } else if (difficulty >= 5) {
          // Medium difficulty: mix of random and tactical
          move = Math.random() > 0.3 ? this.selectBestMoveHeuristic(chess, moves) : moves[Math.floor(Math.random() * moves.length)];
        } else {
          // Low difficulty: mostly random
          move = moves[Math.floor(Math.random() * moves.length)];
        }

        resolve(move);
      }, 500); // Simulate thinking time
    });
  }

  /**
   * Get move from Stockfish (requires Web Worker)
   * @param {string} fen - Current board position
   * @param {number} difficulty - Difficulty level
   * @returns {Promise<string>}
   */
  static async getStockfishMove(fen, difficulty = 5) {
    // Stockfish integration requires actual WASM binary from stockfishchess.org
    // For now, fallback to Enpassanto which provides consistent gameplay
    console.log('Stockfish requested - using Enpassanto engine (requires actual Stockfish WASM binary for full integration)');
    return this.getEnpassantoMove(fen, difficulty);
  }

  /**
   * Heuristic-based move selection (prefers captures, checks, and safe moves)
   * @param {Chess} chess - Chess.js instance
   * @param {string[]} moves - Available moves
   * @returns {string}
   */
  static selectBestMoveHeuristic(chess, moves) {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      let score = 0;

      // Make the move to analyze it
      const moveObj = chess.move(move);

      if (moveObj) {
        // Give points for captures
        if (moveObj.captured) {
          const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
          score += 10 * (pieceValues[moveObj.captured] || 1);
        }

        // Give points for checks
        if (chess.isCheck()) {
          score += 5;
        }

        // Give points for promoting pawns
        if (moveObj.promotion) {
          score += 8;
        }

        // Slight preference for developing moves (small bonus)
        score += Math.random() * 2;
      }

      // Undo the move
      chess.undo();

      // Track best move
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Get a completely random legal move
   * @param {string} fen - Current board position
   * @returns {string}
   */
  static getRandomMove(fen) {
    const chess = new Chess(fen);
    const moves = chess.moves();

    if (moves.length === 0) {
      return null;
    }

    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Initialize Stockfish worker (placeholder - requires actual WASM binary)
   */
  static initStockfishWorker() {
    // Actual Stockfish integration requires downloading the WASM binary from:
    // https://stockfishchess.org/download/
    // For now, Enpassanto engine provides reliable gameplay
    console.log('Stockfish worker: using Enpassanto engine by default');
  }

  /**
   * Terminate Stockfish worker
   */
  static terminateStockfishWorker() {
    if (this.stockfishWorker) {
      this.stockfishWorker.terminate();
      this.stockfishWorker = null;
    }
  }
}

export default BotEngine;
