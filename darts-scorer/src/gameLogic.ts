import type { Match, Leg, Turn } from './types';

/** Returns the current active leg (last leg in the array). */
export function getCurrentLeg(match: Match): Leg {
  return match.legs[match.legs.length - 1];
}

/**
 * Returns the player whose turn it currently is in the given leg.
 * Turns alternate starting from leg.startingPlayerId.
 */
export function getCurrentPlayerId(match: Match): string {
  const leg = getCurrentLeg(match);
  const [p0, p1] = match.players;
  // Count turns already played this leg
  const turnCount = leg.turns.length;
  const starterIndex = match.players.indexOf(leg.startingPlayerId);
  const currentIndex = (starterIndex + turnCount) % 2;
  return currentIndex === 0 ? p0 : p1;
}

/**
 * Returns the remaining score for a player in the current leg.
 * Starts at gameMode and subtracts all non-bust turns for that player.
 */
export function getPlayerRemaining(match: Match, playerId: string): number {
  const leg = getCurrentLeg(match);
  let remaining = match.gameMode;
  for (const turn of leg.turns) {
    if (turn.playerId === playerId && !turn.isBust) {
      remaining -= turn.score;
    }
  }
  return remaining;
}

/**
 * Evaluates what happens when a player submits a score.
 * Returns:
 *   'bust'                - score takes remaining below 0 (or exactly 0 but can't double out)
 *   'needs-double-confirm'- score would reach exactly 0; ask if they doubled out
 *   'normal'              - valid score, subtract it
 */
export function evaluateTurn(
  remaining: number,
  score: number
): 'bust' | 'needs-double-confirm' | 'normal' {
  const next = remaining - score;
  if (next < 0 || next === 1) return 'bust';
  if (next === 0) return 'needs-double-confirm';
  return 'normal';
}

/**
 * Creates a new leg for the given match.
 * startingPlayerId alternates: odd-indexed legs start with players[1].
 */
export function createNewLeg(match: Match): Leg {
  const legIndex = match.legs.length;
  const startingPlayerId = match.players[legIndex % 2];
  return {
    id: crypto.randomUUID(),
    startingPlayerId,
    turns: [],
    winner: null,
  };
}

/** Returns true if the match has a winner. */
export function isMatchOver(match: Match): boolean {
  return match.winner !== null;
}

/**
 * Applies a confirmed-win turn to the current leg and potentially ends the match.
 * Returns an updated match.
 */
export function applyWin(match: Match, playerId: string, score: number): Match {
  const leg = getCurrentLeg(match);

  const winTurn: Turn = {
    playerId,
    score,
    remainingAfter: 0,
    isBust: false,
  };

  const updatedLeg: Leg = {
    ...leg,
    turns: [...leg.turns, winTurn],
    winner: playerId,
  };

  const newLegWins = {
    ...match.legWins,
    [playerId]: (match.legWins[playerId] ?? 0) + 1,
  };

  const matchWinner =
    newLegWins[playerId] >= match.legsToWin ? playerId : null;

  // If match is not over, start a new leg
  const newLegs = matchWinner
    ? [...match.legs.slice(0, -1), updatedLeg]
    : [...match.legs.slice(0, -1), updatedLeg, createNewLeg({ ...match, legs: [...match.legs.slice(0, -1), updatedLeg] })];

  return {
    ...match,
    legs: newLegs,
    legWins: newLegWins,
    winner: matchWinner,
    completedAt: matchWinner ? Date.now() : null,
  };
}

/**
 * Applies a bust turn (score unchanged, turn recorded as bust).
 */
export function applyBust(match: Match, playerId: string, score: number): Match {
  const leg = getCurrentLeg(match);
  const remaining = getPlayerRemaining(match, playerId);

  const bustTurn: Turn = {
    playerId,
    score,
    remainingAfter: remaining, // unchanged
    isBust: true,
  };

  const updatedLeg: Leg = {
    ...leg,
    turns: [...leg.turns, bustTurn],
  };

  return {
    ...match,
    legs: [...match.legs.slice(0, -1), updatedLeg],
  };
}

/**
 * Applies a normal (non-bust, non-winning) turn.
 */
export function applyNormalTurn(match: Match, playerId: string, score: number): Match {
  const leg = getCurrentLeg(match);
  const remaining = getPlayerRemaining(match, playerId);

  const turn: Turn = {
    playerId,
    score,
    remainingAfter: remaining - score,
    isBust: false,
  };

  const updatedLeg: Leg = {
    ...leg,
    turns: [...leg.turns, turn],
  };

  return {
    ...match,
    legs: [...match.legs.slice(0, -1), updatedLeg],
  };
}

// ── Checkout suggestion ──────────────────────────────────────────────────────

interface DartOption { score: number; label: string }

const NON_DOUBLE_OPTIONS: DartOption[] = [
  { score: 60, label: 'T20' }, { score: 57, label: 'T19' }, { score: 54, label: 'T18' },
  { score: 51, label: 'T17' }, { score: 48, label: 'T16' }, { score: 45, label: 'T15' },
  { score: 42, label: 'T14' }, { score: 39, label: 'T13' }, { score: 36, label: 'T12' },
  { score: 33, label: 'T11' }, { score: 30, label: 'T10' }, { score: 27, label: 'T9'  },
  { score: 25, label: 'Bull'}, { score: 24, label: 'T8'  }, { score: 21, label: 'T7'  },
  { score: 20, label: '20'  }, { score: 19, label: '19'  }, { score: 18, label: 'T6'  },
  { score: 17, label: '17'  }, { score: 16, label: '16'  }, { score: 15, label: 'T5'  },
  { score: 14, label: '14'  }, { score: 13, label: '13'  }, { score: 12, label: 'T4'  },
  { score: 11, label: '11'  }, { score: 10, label: '10'  }, { score:  9, label: 'T3'  },
  { score:  8, label: '8'   }, { score:  7, label: '7'   }, { score:  6, label: 'T2'  },
  { score:  5, label: '5'   }, { score:  4, label: '4'   }, { score:  3, label: 'T1'  },
  { score:  2, label: '2'   }, { score:  1, label: '1'   },
];

const DOUBLE_OPTIONS: DartOption[] = [
  { score: 50, label: 'Bull' },
  { score: 40, label: 'D20' }, { score: 38, label: 'D19' }, { score: 36, label: 'D18' },
  { score: 34, label: 'D17' }, { score: 32, label: 'D16' }, { score: 30, label: 'D15' },
  { score: 28, label: 'D14' }, { score: 26, label: 'D13' }, { score: 24, label: 'D12' },
  { score: 22, label: 'D11' }, { score: 20, label: 'D10' }, { score: 18, label: 'D9'  },
  { score: 16, label: 'D8'  }, { score: 14, label: 'D7'  }, { score: 12, label: 'D6'  },
  { score: 10, label: 'D5'  }, { score:  8, label: 'D4'  }, { score:  6, label: 'D3'  },
  { score:  4, label: 'D2'  }, { score:  2, label: 'D1'  },
];

/**
 * Suggests the shortest standard checkout route (1–3 darts) for the given
 * remaining score. Returns null if the score cannot be checked out in 3 darts.
 */
export function getCheckoutSuggestion(remaining: number): string | null {
  if (remaining < 2 || remaining > 170) return null;

  // 1-dart checkout
  for (const d of DOUBLE_OPTIONS) {
    if (d.score === remaining) return d.label;
  }

  // 2-dart checkout
  for (const d1 of NON_DOUBLE_OPTIONS) {
    const need = remaining - d1.score;
    if (need < 2) continue;
    for (const d of DOUBLE_OPTIONS) {
      if (d.score === need) return `${d1.label} ${d.label}`;
    }
  }

  // 3-dart checkout
  for (const d1 of NON_DOUBLE_OPTIONS) {
    for (const d2 of NON_DOUBLE_OPTIONS) {
      const need = remaining - d1.score - d2.score;
      if (need < 2) continue;
      for (const d of DOUBLE_OPTIONS) {
        if (d.score === need) return `${d1.label} ${d2.label} ${d.label}`;
      }
    }
  }

  return null;
}

// ── In-game averages ─────────────────────────────────────────────────────────

/**
 * Mean score per turn in the current leg. Busts count as 0.
 * Returns null if the player has no turns yet this leg.
 */
export function getPlayerLegAvg(match: Match, playerId: string): number | null {
  const leg = getCurrentLeg(match);
  const turns = leg.turns.filter((t) => t.playerId === playerId);
  if (turns.length === 0) return null;
  return turns.reduce((s, t) => s + (t.isBust ? 0 : t.score), 0) / turns.length;
}

/**
 * Mean score per turn across all legs in the match. Busts count as 0.
 * Returns null if the player has no turns yet.
 */
export function getPlayerGameAvg(match: Match, playerId: string): number | null {
  const turns = match.legs.flatMap((l) => l.turns).filter((t) => t.playerId === playerId);
  if (turns.length === 0) return null;
  return turns.reduce((s, t) => s + (t.isBust ? 0 : t.score), 0) / turns.length;
}

/** Returns all turns from the current leg in reverse order (most recent first). */
export function getTurnHistory(match: Match): Array<Turn & { turnNumber: number; legNumber: number }> {
  const result: Array<Turn & { turnNumber: number; legNumber: number }> = [];
  match.legs.forEach((leg, legIndex) => {
    leg.turns.forEach((turn, turnIndex) => {
      result.push({ ...turn, turnNumber: turnIndex + 1, legNumber: legIndex + 1 });
    });
  });
  return result.reverse();
}
