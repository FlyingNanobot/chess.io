import { Chess } from 'chess.js';

/**
 * PositionAnalyzer: Analyzes chess positions and finds best moves
 * Provides evaluation scores similar to chess.com
 */
class PositionAnalyzer {
  /**
   * Simple piece value evaluation
   */
  static pieceValues = {
    p: 1,
    n: 3,
    b: 3.25,
    r: 5,
    q: 9,
    k: 0,
  };

  /**
   * Evaluate a position (simplified evaluation)
   * Positive = White advantage, Negative = Black advantage
   * @param {string} fen - Current board position
   * @returns {number} - Evaluation in centipawns
   */
  static evaluatePosition(fen) {
    const chess = new Chess(fen);
    let evaluation = 0;

    // Iterate through all squares
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square);

        if (piece) {
          const value = this.pieceValues[piece.type] || 0;
          const color = piece.color === 'w' ? 1 : -1;
          evaluation += value * color * 100; // Convert to centipawns
        }
      }
    }

    // Add positional factors
    evaluation += this.getPositionalBonus(chess, fen);

    return Math.round(evaluation);
  }

  /**
   * Get positional bonuses (simplified)
   */
  static getPositionalBonus(chess, fen) {
    let bonus = 0;

    // Bonus for center control
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    centerSquares.forEach((square) => {
      const piece = chess.get(square);
      if (piece) {
        const color = piece.color === 'w' ? 1 : -1;
        bonus += color * 5; // 5 centipawn bonus for center
      }
    });

    // Bonus/penalty for king safety
    const whiteKing = this.findKing(chess, 'w');
    const blackKing = this.findKing(chess, 'b');

    if (whiteKing && this.isKingExposed(chess, whiteKing)) {
      bonus -= 20; // Penalty for exposed white king
    }
    if (blackKing && this.isKingExposed(chess, blackKing)) {
      bonus += 20; // Penalty for exposed black king
    }

    return bonus;
  }

  /**
   * Find king position
   */
  static findKing(chess, color) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square);
        if (piece && piece.type === 'k' && piece.color === color) {
          return square;
        }
      }
    }
    return null;
  }

  /**
   * Check if king is exposed (simplified)
   */
  static isKingExposed(chess, kingSquare) {
    const moves = chess.moves({ square: kingSquare, verbose: true });
    // If king has few escape squares, consider it exposed
    return moves.length < 2;
  }

  /**
   * Find the best move using minimax with alpha-beta pruning
   * @param {string} fen - Current position
   * @param {number} depth - Search depth
   * @param {number} difficulty - Difficulty level (1-10, affects depth)
   * @returns {Object} - { move: string, evaluation: number }
   */
  static findBestMove(fen, depth = 3, difficulty = 5) {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) {
      return { move: null, evaluation: 0 };
    }

    let bestMove = moves[0];
    let bestValue = -Infinity;
    const isWhiteTurn = chess.turn() === 'w';

    for (const move of moves) {
      chess.move(move);
      const value = this.minimax(chess, depth - 1, -Infinity, Infinity, !isWhiteTurn);
      chess.undo();

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return {
      move: `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`,
      evaluation: bestValue,
    };
  }

  /**
   * Minimax with alpha-beta pruning
   */
  static minimax(chess, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluatePosition(chess.fen());
    }

    const moves = chess.moves();

    if (isMaximizing) {
      let maxValue = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const value = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();

        maxValue = Math.max(maxValue, value);
        alpha = Math.max(alpha, value);
        if (beta <= alpha) break;
      }
      return maxValue;
    } else {
      let minValue = Infinity;
      for (const move of moves) {
        chess.move(move);
        const value = this.minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();

        minValue = Math.min(minValue, value);
        beta = Math.min(beta, value);
        if (beta <= alpha) break;
      }
      return minValue;
    }
  }

  /**
   * Get all legal moves with their evaluations
   */
  static getMoveEvaluations(fen, depth = 2) {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    const isWhiteTurn = chess.turn() === 'w';

    const moveEvals = moves.map((move) => {
      chess.move(move);
      const evaluation = this.minimax(chess, depth - 1, -Infinity, Infinity, !isWhiteTurn);
      chess.undo();

      return {
        move: `${move.from}${move.to}${move.promotion || ''}`,
        evaluation,
      };
    });

    // Sort by evaluation (best first)
    return moveEvals.sort((a, b) => b.evaluation - a.evaluation);
  }
}

export default PositionAnalyzer;
