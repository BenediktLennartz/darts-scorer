import type { Match } from '../types';
import { getCurrentPlayerId, getPlayerRemaining } from '../gameLogic';

interface Props {
  match: Match;
}

export default function Scoreboard({ match }: Props) {
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
            <div className="player-name">{name}</div>
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
