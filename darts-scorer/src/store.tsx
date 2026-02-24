import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, Action, Match, Player } from './types';
import {
  evaluateTurn,
  getCurrentPlayerId,
  getPlayerRemaining,
  applyWin,
  applyBust,
  applyNormalTurn,
} from './gameLogic';

const STORAGE_KEY = 'darts_app_v1';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        undoStack: [],
        redoStack: [],
        pendingDoubleOut: false,
        pendingScore: 0,
        view: parsed.currentMatch ? 'game' : 'home',
      };
    }
  } catch {
    // ignore
  }
  return {
    players: [],
    matchHistory: [],
    currentMatch: null,
    pendingDoubleOut: false,
    pendingScore: 0,
    undoStack: [],
    redoStack: [],
    view: 'home',
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, view: action.view };

    case 'ADD_PLAYER': {
      const trimmed = action.name.trim();
      if (!trimmed) return state;
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: trimmed,
        createdAt: Date.now(),
      };
      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'REMOVE_PLAYER': {
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      };
    }

    case 'START_MATCH': {
      const { players, gameMode, bestOf } = action;
      const playerNames: Record<string, string> = {};
      for (const id of players) {
        const p = state.players.find((pl) => pl.id === id);
        if (p) playerNames[id] = p.name;
      }
      const legsToWin = Math.ceil(bestOf / 2);
      const newMatch: Match = {
        id: crypto.randomUUID(),
        players,
        playerNames,
        gameMode,
        bestOf,
        legsToWin,
        legs: [
          {
            id: crypto.randomUUID(),
            startingPlayerId: players[0],
            turns: [],
            winner: null,
          },
        ],
        legWins: { [players[0]]: 0, [players[1]]: 0 },
        winner: null,
        startedAt: Date.now(),
        completedAt: null,
      };
      return {
        ...state,
        currentMatch: newMatch,
        undoStack: [],
        redoStack: [],
        pendingDoubleOut: false,
        pendingScore: 0,
        view: 'game',
      };
    }

    case 'SET_LEG_STARTER': {
      if (!state.currentMatch) return state;
      const match = state.currentMatch;
      const leg = match.legs[match.legs.length - 1];
      if (leg.turns.length > 0) return state;
      const updatedLeg = { ...leg, startingPlayerId: action.playerId };
      return {
        ...state,
        currentMatch: {
          ...match,
          legs: [...match.legs.slice(0, -1), updatedLeg],
        },
      };
    }

    case 'SUBMIT_TURN': {
      if (!state.currentMatch || state.pendingDoubleOut) return state;
      const match = state.currentMatch;
      const playerId = getCurrentPlayerId(match);
      const remaining = getPlayerRemaining(match, playerId);
      const { score } = action;
      const result = evaluateTurn(remaining, score);

      if (result === 'bust') {
        const snapshot = deepClone(match);
        const updated = applyBust(match, playerId, score);
        return {
          ...state,
          currentMatch: updated,
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        };
      }

      if (result === 'needs-double-confirm') {
        return {
          ...state,
          pendingDoubleOut: true,
          pendingScore: score,
        };
      }

      // normal turn
      const snapshot = deepClone(match);
      const updated = applyNormalTurn(match, playerId, score);
      return {
        ...state,
        currentMatch: updated,
        undoStack: [...state.undoStack, snapshot],
        redoStack: [],
      };
    }

    case 'CONFIRM_DOUBLE_OUT': {
      if (!state.currentMatch || !state.pendingDoubleOut) return state;
      const match = state.currentMatch;
      const playerId = getCurrentPlayerId(match);
      const snapshot = deepClone(match);

      if (action.confirmed) {
        const updated = applyWin(match, playerId, state.pendingScore);
        const isOver = updated.winner !== null;
        return {
          ...state,
          currentMatch: isOver ? updated : updated,
          matchHistory: isOver
            ? [...state.matchHistory, updated]
            : state.matchHistory,
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
          pendingDoubleOut: false,
          pendingScore: 0,
          view: isOver ? 'result' : 'game',
        };
      } else {
        // bust
        const updated = applyBust(match, playerId, state.pendingScore);
        return {
          ...state,
          currentMatch: updated,
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
          pendingDoubleOut: false,
          pendingScore: 0,
        };
      }
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      const newUndo = state.undoStack.slice(0, -1);
      const newRedo = state.currentMatch
        ? [...state.redoStack, deepClone(state.currentMatch)]
        : state.redoStack;
      return {
        ...state,
        currentMatch: prev,
        undoStack: newUndo,
        redoStack: newRedo,
        pendingDoubleOut: false,
        pendingScore: 0,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedo = state.redoStack.slice(0, -1);
      const newUndo = state.currentMatch
        ? [...state.undoStack, deepClone(state.currentMatch)]
        : state.undoStack;
      return {
        ...state,
        currentMatch: next,
        undoStack: newUndo,
        redoStack: newRedo,
        pendingDoubleOut: false,
        pendingScore: 0,
      };
    }

    case 'ABANDON_MATCH': {
      return {
        ...state,
        currentMatch: null,
        undoStack: [],
        redoStack: [],
        pendingDoubleOut: false,
        pendingScore: 0,
        view: 'home',
      };
    }

    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    const toSave = {
      players: state.players,
      matchHistory: state.matchHistory,
      currentMatch: state.currentMatch,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state.players, state.matchHistory, state.currentMatch]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
