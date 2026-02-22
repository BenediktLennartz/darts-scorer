import type { Match } from '../types';
import { getTurnHistory } from '../gameLogic';

interface Props {
  match: Match;
}

export default function TurnHistory({ match }: Props) {
  const history = getTurnHistory(match);

  if (history.length === 0) {
    return (
      <div className="turn-history">
        <h3>Turn History</h3>
        <div className="empty-state" style={{ padding: '16px 0' }}>
          No turns yet
        </div>
      </div>
    );
  }

  // Group rows: insert leg separators
  type Row =
    | { type: 'separator'; legNumber: number }
    | { type: 'turn'; legNumber: number; turnNumber: number; playerId: string; score: number; remaining: number; isBust: boolean };

  const rows: Row[] = [];
  let lastLeg = -1;

  for (const t of history) {
    if (t.legNumber !== lastLeg) {
      rows.push({ type: 'separator', legNumber: t.legNumber });
      lastLeg = t.legNumber;
    }
    rows.push({
      type: 'turn',
      legNumber: t.legNumber,
      turnNumber: t.turnNumber,
      playerId: t.playerId,
      score: t.score,
      remaining: t.remainingAfter,
      isBust: t.isBust,
    });
  }

  return (
    <div className="turn-history">
      <h3>Turn History</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Score</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.type === 'separator') {
              return (
                <tr key={`sep-${i}`} className="leg-separator">
                  <td colSpan={4}>Leg {row.legNumber}</td>
                </tr>
              );
            }
            return (
              <tr key={`turn-${i}`} className={row.isBust ? 'bust-row' : ''}>
                <td style={{ color: 'var(--text-muted)' }}>{row.turnNumber}</td>
                <td>{match.playerNames[row.playerId]}</td>
                <td>
                  {row.isBust ? (
                    <>
                      {row.score}
                      <span className="bust-badge">BUST</span>
                    </>
                  ) : (
                    row.score
                  )}
                </td>
                <td>{row.remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
