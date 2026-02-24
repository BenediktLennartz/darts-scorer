export interface Player {
  id: string;
  name: string;
  createdAt: number;
}

export type GameMode = 301 | 501;

export interface Turn {
  playerId: string;
  score: number;          // score entered this turn
  remainingAfter: number; // remaining score after this turn
  isBust: boolean;
}

export interface Leg {
  id: string;
  startingPlayerId: string; // who throws first in this leg
  turns: Turn[];
  winner: string | null;
}

export interface Match {
  id: string;
  players: [string, string];            // player IDs
  playerNames: Record<string, string>;  // id -> name snapshot
  gameMode: GameMode;
  bestOf: number;       // total legs (1 | 3 | 5 | 7 | 9)
  legsToWin: number;    // Math.ceil(bestOf / 2)
  legs: Leg[];
  legWins: Record<string, number>; // playerId -> legs won
  winner: string | null;
  startedAt: number;
  completedAt: number | null;
}

export interface AppState {
  players: Player[];
  matchHistory: Match[];
  currentMatch: Match | null;
  pendingDoubleOut: boolean; // waiting for double-out confirmation
  pendingScore: number;      // the score that triggered the double-out prompt
  undoStack: Match[];
  redoStack: Match[];
  view: 'home' | 'players' | 'setup' | 'game' | 'result' | 'stats';
}

export type Action =
  | { type: 'NAVIGATE'; view: AppState['view'] }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'START_MATCH'; players: [string, string]; gameMode: GameMode; bestOf: number }
  | { type: 'SET_LEG_STARTER'; playerId: string }
  | { type: 'SUBMIT_TURN'; score: number }
  | { type: 'CONFIRM_DOUBLE_OUT'; confirmed: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ABANDON_MATCH' };
