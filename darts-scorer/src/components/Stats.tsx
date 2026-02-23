import { useState } from 'react';
import { useStore } from '../store';
import { calculatePlayerStats } from '../statsCalculator';
import type { GameMode } from '../types';

type Filter = 'all' | GameMode;

function fmt(n: number, decimals = 1): string {
  return n === 0 ? '0' : n.toFixed(decimals);
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export default function Stats() {
  const { state, dispatch } = useStore();
  const { players, matchHistory } = state;
  const [filter, setFilter] = useState<Filter>('all');

  const gameMode = filter === 'all' ? undefined : (filter as GameMode);

  const playerStats = players.map((p) => ({
    player: p,
    stats: calculatePlayerStats(p.id, matchHistory, gameMode),
  }));

  const withData = playerStats.filter(({ stats }) => stats.matchesPlayed > 0);

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => dispatch({ type: 'NAVIGATE', view: 'home' })}>
          ←
        </button>
        <h1>Statistics</h1>
      </div>

      <div className="screen" style={{ paddingTop: 12 }}>
        <div className="pill-group">
          {(['all', 301, 501] as Filter[]).map((f) => (
            <button
              key={f}
              className={`pill${filter === f ? ' selected' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All modes' : String(f)}
            </button>
          ))}
        </div>

        {players.length === 0 && (
          <div className="empty-state">No players yet. Add players to get started.</div>
        )}

        {players.length > 0 && withData.length === 0 && (
          <div className="empty-state">
            No completed matches{filter !== 'all' ? ` in ${filter}` : ''} yet.
          </div>
        )}

        {withData.map(({ player, stats: s }) => (
          <div key={player.id} className="stats-card card">
            <div className="stats-card-header">
              <div className="stats-player-name">{player.name}</div>
              <div className="stats-record">
                {s.matchesWon}W–{s.matchesPlayed - s.matchesWon}L
              </div>
            </div>

            <div className="stats-hero">
              <div className="stats-hero-item">
                <div className="stats-hero-value">{fmt(s.average)}</div>
                <div className="stats-hero-label">3-dart avg</div>
              </div>
              <div className="stats-hero-divider" />
              <div className="stats-hero-item">
                <div className="stats-hero-value">
                  {s.checkoutAttempts > 0 ? pct(s.checkoutRate) : '—'}
                </div>
                <div className="stats-hero-label">Checkout %</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stats-cell">
                <div className="stats-cell-value">
                  {s.legsWon}/{s.legsPlayed}
                </div>
                <div className="stats-cell-label">Legs won</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.bestScore || '—'}</div>
                <div className="stats-cell-label">Best turn</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.bestCheckout || '—'}</div>
                <div className="stats-cell-label">Best checkout</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{pct(s.bustRate)}</div>
                <div className="stats-cell-label">Bust rate</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.tons}</div>
                <div className="stats-cell-label">Tons</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.ton40s}</div>
                <div className="stats-cell-label">Ton-40s</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.max180s}</div>
                <div className="stats-cell-label">180s</div>
              </div>
              <div className="stats-cell">
                <div className="stats-cell-value">{s.checkoutAttempts}</div>
                <div className="stats-cell-label">Checkout tries</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
