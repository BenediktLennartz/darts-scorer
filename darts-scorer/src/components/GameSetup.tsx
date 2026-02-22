import { useState } from 'react';
import { useStore } from '../store';
import type { GameMode } from '../types';

const BEST_OF_OPTIONS = [1, 3, 5, 7, 9];

export default function GameSetup() {
  const { state, dispatch } = useStore();
  const { players } = state;

  const [player1Id, setPlayer1Id] = useState(players[0]?.id ?? '');
  const [player2Id, setPlayer2Id] = useState(players[1]?.id ?? '');
  const [gameMode, setGameMode] = useState<GameMode>(501);
  const [bestOf, setBestOf] = useState(3);

  const isValid = player1Id && player2Id && player1Id !== player2Id;

  function handleStart() {
    if (!isValid) return;
    dispatch({
      type: 'START_MATCH',
      players: [player1Id, player2Id],
      gameMode,
      bestOf,
    });
  }

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => dispatch({ type: 'NAVIGATE', view: 'home' })}>
          ← Back
        </button>
        <h1>New Game</h1>
      </div>

      <div className="screen" style={{ paddingTop: 8 }}>
        <div>
          <div className="label">Player 1</div>
          <select value={player1Id} onChange={(e) => setPlayer1Id(e.target.value)}>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="label">Player 2</div>
          <select value={player2Id} onChange={(e) => setPlayer2Id(e.target.value)}>
            {players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === player1Id}>
                {p.name}
              </option>
            ))}
          </select>
          {player1Id === player2Id && (
            <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6 }}>
              Players must be different
            </div>
          )}
        </div>

        <div>
          <div className="label">Starting Score</div>
          <div className="pill-group">
            {([301, 501] as GameMode[]).map((mode) => (
              <button
                key={mode}
                className={`pill${gameMode === mode ? ' selected' : ''}`}
                onClick={() => setGameMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Format</div>
          <div className="pill-group">
            {BEST_OF_OPTIONS.map((n) => (
              <button
                key={n}
                className={`pill${bestOf === n ? ' selected' : ''}`}
                onClick={() => setBestOf(n)}
              >
                Best of {n}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
            First to win {Math.ceil(bestOf / 2)} leg{Math.ceil(bestOf / 2) !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="btn-primary" onClick={handleStart} disabled={!isValid}>
            Start Game
          </button>
        </div>
      </div>
    </>
  );
}
