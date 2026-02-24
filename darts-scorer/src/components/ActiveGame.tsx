import { useStore } from '../store';
import { getCurrentPlayerId, getPlayerRemaining } from '../gameLogic';
import Scoreboard from './Scoreboard';
import ScoreEntry from './ScoreEntry';
import TurnHistory from './TurnHistory';
import DoubleOutModal from './DoubleOutModal';

export default function ActiveGame() {
  const { state, dispatch } = useStore();
  const { currentMatch, pendingDoubleOut, pendingScore, undoStack, redoStack } = state;

  if (!currentMatch) return null;

  const currentPlayerId = getCurrentPlayerId(currentMatch);
  const currentPlayerName = currentMatch.playerNames[currentPlayerId];
  const currentRemaining = getPlayerRemaining(currentMatch, currentPlayerId);

  const currentLegIndex = currentMatch.legs.length;
  const currentLeg = currentMatch.legs[currentMatch.legs.length - 1];
  const canSelectStarter = currentLeg.turns.length === 0;
  const [p1, p2] = currentMatch.players;
  const w1 = currentMatch.legWins[p1] ?? 0;
  const w2 = currentMatch.legWins[p2] ?? 0;

  function handleScore(score: number) {
    dispatch({ type: 'SUBMIT_TURN', score });
  }

  function handleAbandon() {
    if (window.confirm('Abandon this match? Progress will be lost.')) {
      dispatch({ type: 'ABANDON_MATCH' });
    }
  }

  return (
    <div className="active-game">
      {/* ── Fixed top section ── */}
      <div className="game-top">
        <div className="game-header">
          <div className="match-info">
            <strong>Leg {currentLegIndex}</strong> of {currentMatch.bestOf}
            {'  ·  '}
            <strong>{w1}–{w2}</strong>
            {'  ·  '}
            {currentMatch.gameMode}
          </div>
          <div className="header-actions">
            <button
              className="btn-icon"
              title="Undo"
              disabled={undoStack.length === 0}
              onClick={() => dispatch({ type: 'UNDO' })}
            >
              ↩
            </button>
            <button
              className="btn-icon"
              title="Redo"
              disabled={redoStack.length === 0}
              onClick={() => dispatch({ type: 'REDO' })}
            >
              ↪
            </button>
            <button
              className="btn-icon"
              title="Abandon match"
              style={{ color: 'var(--danger)' }}
              onClick={handleAbandon}
            >
              ✕
            </button>
          </div>
        </div>

        <Scoreboard
          match={currentMatch}
          canSelectStarter={canSelectStarter}
          onSelectStarter={(playerId) => dispatch({ type: 'SET_LEG_STARTER', playerId })}
        />

        <div className="turn-indicator">
          <span className="turn-player">{currentPlayerName}</span>
          <span className="turn-needs"> needs {currentRemaining} to checkout</span>
        </div>

        <ScoreEntry onSubmit={handleScore} currentPlayerName={currentPlayerName} />
      </div>

      {/* ── Scrollable history ── */}
      <div className="game-history">
        <TurnHistory match={currentMatch} />
      </div>

      {pendingDoubleOut && (
        <DoubleOutModal
          score={pendingScore}
          playerName={currentPlayerName}
          onConfirm={(confirmed) =>
            dispatch({ type: 'CONFIRM_DOUBLE_OUT', confirmed })
          }
        />
      )}
    </div>
  );
}
