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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* Header */}
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

      <div className="screen" style={{ paddingTop: 12, overflowY: 'auto', flex: 1 }}>
        <Scoreboard match={currentMatch} />

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <strong style={{ color: 'var(--accent)' }}>{currentPlayerName}</strong>'s turn
          {' · '}needs <strong style={{ color: 'var(--text-primary)' }}>{currentRemaining}</strong> to checkout
        </div>

        <ScoreEntry onSubmit={handleScore} maxScore={currentRemaining} />

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
