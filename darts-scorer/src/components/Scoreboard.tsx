import type { Match } from '../types';
import { getCurrentPlayerId, getPlayerRemaining } from '../gameLogic';

interface Props {
  match: Match;
  canSelectStarter?: boolean;
  onSelectStarter?: (playerId: string) => void;
}

export default function Scoreboard({ match, canSelectStarter, onSelectStarter }: Props) {
  const currentPlayerId = getCurrentPlayerId(match);

  return (
    <div className="scoreboard">
      {match.players.map((playerId) => {
        const name = match.playerNames[playerId];
        const remaining = getPlayerRemaining(match, playerId);
        const wins = match.legWins[playerId] ?? 0;
        const isActive = playerId === currentPlayerId;

        return (
          <div key={playerId} className={`score-card${isActive ? ' active' : ''}`}>
            <div className="throw-arrow">▼</div>
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
            <div className="leg-wins">
              {wins} leg{wins !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
