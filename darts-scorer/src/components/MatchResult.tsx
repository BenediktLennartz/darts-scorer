import { useStore } from '../store';
import type { GameMode } from '../types';

export default function MatchResult() {
  const { state, dispatch } = useStore();
  const { currentMatch } = state;

  if (!currentMatch || !currentMatch.winner) return null;

  const { winner, players, playerNames, legWins, gameMode, bestOf } = currentMatch;
  const [p1, p2] = players;
  const winnerName = playerNames[winner];
  const w1 = legWins[p1] ?? 0;
  const w2 = legWins[p2] ?? 0;

  function handleRematch() {
    dispatch({
      type: 'START_MATCH',
      players: [p2, p1], // swap who goes first
      gameMode: gameMode as GameMode,
      bestOf,
    });
  }

  return (
    <div className="result-screen">
      <div className="trophy">🏆</div>
      <div>
        <h1>Winner</h1>
        <div className="winner-name">{winnerName}</div>
      </div>
      <div className="leg-breakdown">
        <div className="leg-stat">
          <div className={`leg-count${winner === p1 ? ' winner-count' : ''}`}>{w1}</div>
          <div className="leg-player-name">{playerNames[p1]}</div>
        </div>
        <div className="vs-divider">–</div>
        <div className="leg-stat">
          <div className={`leg-count${winner === p2 ? ' winner-count' : ''}`}>{w2}</div>
          <div className="leg-player-name">{playerNames[p2]}</div>
        </div>
      </div>
      <div className="result-actions">
        <button className="btn-primary" onClick={handleRematch}>
          Rematch
        </button>
        <button
          className="btn-secondary"
          onClick={() => dispatch({ type: 'ABANDON_MATCH' })}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
