import { useState } from 'react';
import { useStore } from '../store';

export default function PlayerManager() {
  const { state, dispatch } = useStore();
  const { players } = state;
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const duplicate = players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) return;
    dispatch({ type: 'ADD_PLAYER', name: trimmed });
    setName('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => dispatch({ type: 'NAVIGATE', view: 'home' })}>
          ← Back
        </button>
        <h1>Players</h1>
      </div>

      <div className="screen" style={{ paddingTop: 8 }}>
        <div>
          <div className="label">Add New Player</div>
          <div className="input-row">
            <input
              type="text"
              placeholder="Player name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              autoFocus
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 20px' }}
              onClick={handleAdd}
              disabled={!name.trim()}
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <div className="label">{players.length} Player{players.length !== 1 ? 's' : ''}</div>
          {players.length === 0 ? (
            <div className="empty-state">No players yet. Add one above.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {players.map((player) => (
                <div key={player.id} className="player-list-item">
                  <span className="player-name">{player.name}</span>
                  <button
                    className="btn-danger"
                    onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
