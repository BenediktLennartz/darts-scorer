import { useStore } from '../store';
import type { Match } from '../types';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function MatchHistoryItem({ match }: { match: Match }) {
  const [p1, p2] = match.players;
  const n1 = match.playerNames[p1];
  const n2 = match.playerNames[p2];
  const winnerName = match.winner ? match.playerNames[match.winner] : null;
  const w1 = match.legWins[p1] ?? 0;
  const w2 = match.legWins[p2] ?? 0;

  return (
    <div className="match-history-item">
      <div>
        <div className="players-line">{n1} vs {n2}</div>
        <div className="result-line">
          {match.gameMode} · Best of {match.bestOf} · {w1}–{w2} · {formatDate(match.startedAt)}
        </div>
      </div>
      {winnerName && <div className="winner-badge">{winnerName}</div>}
    </div>
  );
}

export default function Home() {
  const { state, dispatch } = useStore();
  const { players, matchHistory, currentMatch } = state;

  const recentHistory = [...matchHistory].reverse().slice(0, 10);

  return (
    <>
      <div className="home-logo">
        <div className="dart-icon">🎯</div>
        <h1>Darts</h1>
        <div className="subtitle">Double out · Keep score</div>
      </div>

      <div className="screen" style={{ paddingTop: 0 }}>
        {currentMatch && (
          <div className="card active" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Game in progress
            </div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {currentMatch.playerNames[currentMatch.players[0]]} vs{' '}
              {currentMatch.playerNames[currentMatch.players[1]]}
            </div>
            <button className="btn-primary" onClick={() => dispatch({ type: 'NAVIGATE', view: 'game' })}>
              Resume Game
            </button>
          </div>
        )}

        <div className="home-actions">
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: 'NAVIGATE', view: 'setup' })}
            disabled={players.length < 2}
          >
            New Game
          </button>
          {players.length < 2 && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Add at least 2 players to start a game
            </div>
          )}
          <button
            className="btn-secondary"
            onClick={() => dispatch({ type: 'NAVIGATE', view: 'players' })}
          >
            Manage Players
          </button>
          <button
            className="btn-secondary"
            onClick={() => dispatch({ type: 'NAVIGATE', view: 'stats' })}
            disabled={matchHistory.length === 0}
          >
            Statistics
          </button>
        </div>

        {recentHistory.length > 0 && (
          <div>
            <div className="label">Recent Matches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentHistory.map((m) => (
                <MatchHistoryItem key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {recentHistory.length === 0 && players.length >= 2 && (
          <div className="empty-state">No matches played yet. Start a game!</div>
        )}
      </div>
    </>
  );
}
