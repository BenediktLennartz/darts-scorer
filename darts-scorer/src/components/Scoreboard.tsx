import type { Match } from '../types';
import {
  getCurrentPlayerId,
  getPlayerRemaining,
  getCheckoutSuggestion,
  getPlayerLegAvg,
  getPlayerGameAvg,
} from '../gameLogic';

interface Props {
  match: Match;
  canSelectStarter?: boolean;
  onSelectStarter?: (playerId: string) => void;
}

export default function Scoreboard({ match, canSelectStarter, onSelectStarter }: Props) {
  const currentPlayerId = getCurrentPlayerId(match);

  return (
    <div className="scoreboard">
      {match.players.map((playerId, index) => {
        const isLeft = index === 0;
        const name = match.playerNames[playerId];
        const remaining = getPlayerRemaining(match, playerId);
        const wins = match.legWins[playerId] ?? 0;
        const isActive = playerId === currentPlayerId;

        const legAvg = getPlayerLegAvg(match, playerId);
        const gameAvg = getPlayerGameAvg(match, playerId);
        const checkout = isActive ? getCheckoutSuggestion(remaining) : null;

        return (
          <div
            key={playerId}
            className={`score-card${isActive ? ' active' : ''} ${isLeft ? 'card-left' : 'card-right'}`}
          >
            {/* Top section */}
            <div className="card-top">
              <div className="card-stats">
                <div className="stat-row">
                  <span className="stat-label">Leg avg</span>
                  <span className="stat-value">{legAvg !== null ? legAvg.toFixed(1) : '—'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Game avg</span>
                  <span className="stat-value">{gameAvg !== null ? gameAvg.toFixed(1) : '—'}</span>
                </div>
              </div>

              <div className="card-score-info">
                <div
                  className={`player-name${canSelectStarter ? ' selectable' : ''}`}
                  onClick={canSelectStarter ? () => onSelectStarter?.(playerId) : undefined}
                  title={canSelectStarter && !isActive ? 'Tap to go first' : undefined}
                >
                  {name}
                </div>
                {canSelectStarter && (
                  <div className="starter-hint">
                    {isActive ? 'going first' : 'tap to go first'}
                  </div>
                )}
                <div className="remaining">{remaining}</div>
                <div className="leg-wins">{wins} leg{wins !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Divider */}
            <div className="card-divider" />

            {/* Checkout section */}
            <div className="card-checkout">
              <span className="checkout-label">Checkout</span>
              <span className="checkout-value">{checkout ?? '—'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
