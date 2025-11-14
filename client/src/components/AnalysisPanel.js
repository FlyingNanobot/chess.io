import React from 'react';
import './AnalysisPanel.css';

function AnalysisPanel({ bestMove, evaluation, isAnalyzing, playerColor }) {
  /**
   * Convert evaluation to percentage for the bar
   * -300 to +300 centipawns maps to 0-100%
   */
  const getEvaluationPercentage = () => {
    const normalized = Math.max(-300, Math.min(300, evaluation));
    return ((normalized + 300) / 600) * 100;
  };

  /**
   * Format evaluation display
   */
  const formatEvaluation = () => {
    if (evaluation === 0) return '0.00';
    if (Math.abs(evaluation) >= 10000) return evaluation > 0 ? '+#' : '#';
    return (evaluation / 100).toFixed(2);
  };

  const percentage = getEvaluationPercentage();
  const isWhiteAdvantage = evaluation > 0;

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h3>Position Analysis</h3>
      </div>

      {isAnalyzing && (
        <div className="analysis-loading">
          <div className="spinner"></div>
          <p>Analyzing...</p>
        </div>
      )}

      {!isAnalyzing && (
        <>
          {/* Evaluation Bar */}
          <div className="evaluation-bar-container">
            <div className="evaluation-bar">
              <div
                className={`evaluation-fill ${isWhiteAdvantage ? 'white-advantage' : 'black-advantage'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="evaluation-score">{formatEvaluation()}</div>
          </div>

          {/* Best Move */}
          {bestMove ? (
            <div className="best-move-section">
              <p className="best-move-label">Best Move:</p>
              <div className="best-move-display">
                {bestMove.from.toUpperCase()} → {bestMove.to.toUpperCase()}
              </div>
              <p className="move-description">
                {bestMove.from} to {bestMove.to}
              </p>
            </div>
          ) : (
            <div className="best-move-section">
              <p className="best-move-label">No legal moves</p>
            </div>
          )}

          {/* Position Assessment */}
          <div className="position-assessment">
            {Math.abs(evaluation) > 300 ? (
              <p className="assessment-text">
                {isWhiteAdvantage ? '⚪ White is winning' : '⚫ Black is winning'}
              </p>
            ) : Math.abs(evaluation) > 100 ? (
              <p className="assessment-text">
                {isWhiteAdvantage ? '⚪ White is better' : '⚫ Black is better'}
              </p>
            ) : (
              <p className="assessment-text">Position is roughly equal</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AnalysisPanel;
