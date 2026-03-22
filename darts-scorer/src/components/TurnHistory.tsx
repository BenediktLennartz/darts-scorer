import type { Turn, Match } from '../types';
import { getCurrentLeg } from '../gameLogic';

interface Props {
  match: Match;
}

function scoreClass(t: Turn): string {
  if (t.isBust) return 'vh-score bust';
  if (t.score >= 100) return 'vh-score high';
  return 'vh-score';
}

export default function TurnHistory({ match }: Props) {
  const leg = getCurrentLeg(match);
  const [p1, p2] = match.players;

  const p1Rev = leg.turns.filter((t) => t.playerId === p1).reverse();
  const p2Rev = leg.turns.filter((t) => t.playerId === p2).reverse();
  const rowCount = Math.max(p1Rev.length, p2Rev.length);

  return (
    <div className="visit-history">
      <div className="vh-header">
        <span className="vh-col-name">{match.playerNames[p1]}</span>
        <span className="vh-col-name">{match.playerNames[p2]}</span>
      </div>

      <div className="vh-rows">
        {rowCount === 0 && (
          <div className="vh-empty">No turns yet</div>
        )}
        {Array.from({ length: rowCount }, (_, i) => {
          const t1 = p1Rev[i] ?? null;
          const t2 = p2Rev[i] ?? null;
          return (
            <div key={i} className="vh-row">
              <div className="vh-cell left">
                {t1 && (
                  <>
                    <span className={scoreClass(t1)}>{t1.isBust ? 0 : t1.score}</span>
                    <span className="vh-remaining">{t1.remainingAfter}</span>
                  </>
                )}
              </div>
              <div className="vh-cell right">
                {t2 && (
                  <>
                    <span className="vh-remaining">{t2.remainingAfter}</span>
                    <span className={scoreClass(t2)}>{t2.isBust ? 0 : t2.score}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
