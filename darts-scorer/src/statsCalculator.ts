import type { Match, GameMode } from './types';

export interface PlayerStats {
  playerId: string;
  matchesPlayed: number;
  matchesWon: number;
  legsPlayed: number;
  legsWon: number;
  /** Mean score per non-bust turn (3-dart average). */
  average: number;
  /** Highest single-turn score (excluding busts). */
  bestScore: number;
  /** Turns scoring 100–139. */
  tons: number;
  /** Turns scoring 140–179. */
  ton40s: number;
  /** Turns scoring 180. */
  max180s: number;
  /** Fraction of all turns that were busts. */
  bustRate: number;
  /** Turns where remaining before the throw was ≤ 170 (reachable checkout). */
  checkoutAttempts: number;
  /** legsWon / checkoutAttempts. */
  checkoutRate: number;
  /** Highest remaining score hit to win a leg (= score of the winning turn). */
  bestCheckout: number;
}

/**
 * Derives statistics for one player from completed match history.
 * Pass a gameMode to restrict to 301 or 501 only.
 * All matches in matchHistory are expected to have winner !== null.
 */
export function calculatePlayerStats(
  playerId: string,
  matches: Match[],
  gameMode?: GameMode,
): PlayerStats {
  const relevant = matches.filter(
    (m) => m.players.includes(playerId) && (gameMode == null || m.gameMode === gameMode),
  );

  let matchesWon = 0;
  let legsPlayed = 0;
  let legsWon = 0;
  let totalScore = 0;
  let nonBustCount = 0;
  let bustCount = 0;
  let bestScore = 0;
  let tons = 0;
  let ton40s = 0;
  let max180s = 0;
  let checkoutAttempts = 0;
  let bestCheckout = 0;

  for (const match of relevant) {
    if (match.winner === playerId) matchesWon++;
    legsWon += match.legWins[playerId] ?? 0;

    for (const leg of match.legs) {
      // Only count legs the player actually participated in.
      const participated = leg.turns.some((t) => t.playerId === playerId);
      if (!participated) continue;
      legsPlayed++;

      for (const turn of leg.turns) {
        if (turn.playerId !== playerId) continue;

        // Remaining score before this throw:
        //   normal/winning turn → remainingAfter + score
        //   bust → remainingAfter (unchanged, score reverted)
        const remainingBefore = turn.isBust
          ? turn.remainingAfter
          : turn.remainingAfter + turn.score;

        if (turn.isBust) {
          bustCount++;
        } else {
          nonBustCount++;
          totalScore += turn.score;
          if (turn.score > bestScore) bestScore = turn.score;
          if (turn.score >= 100 && turn.score < 140) tons++;
          if (turn.score >= 140 && turn.score < 180) ton40s++;
          if (turn.score === 180) max180s++;
          // Winning turn: remainingAfter === 0
          if (turn.remainingAfter === 0 && turn.score > bestCheckout) {
            bestCheckout = turn.score;
          }
        }

        // Checkout opportunity: could theoretically finish in 3 darts
        if (remainingBefore <= 170) checkoutAttempts++;
      }
    }
  }

  const allTurns = nonBustCount + bustCount;

  return {
    playerId,
    matchesPlayed: relevant.length,
    matchesWon,
    legsPlayed,
    legsWon,
    average: nonBustCount > 0 ? totalScore / nonBustCount : 0,
    bestScore,
    tons,
    ton40s,
    max180s,
    bustRate: allTurns > 0 ? bustCount / allTurns : 0,
    checkoutAttempts,
    checkoutRate: checkoutAttempts > 0 ? legsWon / checkoutAttempts : 0,
    bestCheckout,
  };
}
