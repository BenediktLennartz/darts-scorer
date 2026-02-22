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
  if (next < 0) return 'bust';
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
