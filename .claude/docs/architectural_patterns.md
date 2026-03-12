# Architectural Patterns

## 1. Redux-Style State with React Context

All global state lives in a single `AppState` object managed by `useReducer`. Components access it via a `useStore()` hook — never through prop drilling.

- Reducer: `darts-scorer/src/store.tsx:47`
- Context + provider: `darts-scorer/src/store.tsx:253`
- Hook: `darts-scorer/src/store.tsx:274`
- State shape: `darts-scorer/src/types.ts:37`

**Convention:** Every action type is a discriminated union member in `Action` (`types.ts:48`). Add new actions there first, then handle them in the reducer.

## 2. Immutable State Updates

All reducer cases use spread operators to produce new objects — no mutations. This is required for undo/redo correctness.

```
// Pattern used throughout store.tsx:
return { ...state, currentMatch: { ...match, legs: [...match.legs.slice(0, -1), updatedLeg] } }
```

`deepClone` (`store.tsx:14`) is used only when saving a snapshot to the undo stack, not for routine updates.

## 3. Pure Game Logic Module

All game rules are pure functions in `gameLogic.ts` — they take data in, return new data out, with no side effects and no imports from React or the store.

- `evaluateTurn(remaining, score)` → `'bust' | 'needs-double-confirm' | 'normal'` (`gameLogic.ts:44`)
- `applyBust`, `applyNormalTurn`, `applyWin` each return a new `Match` (`gameLogic.ts:78–163`)
- The reducer in `store.tsx` orchestrates: calls game logic, then wraps the result into the new `AppState`

**Convention:** Keep game rule changes in `gameLogic.ts`. The reducer handles state orchestration (undo stack, view transitions, localStorage); game logic functions handle only match data.

## 4. Undo/Redo via Snapshot Stacks

`AppState` carries `undoStack: Match[]` and `redoStack: Match[]`. Before any state-mutating turn action, a `deepClone` of `currentMatch` is pushed onto `undoStack`. Redo stack is cleared on every new action.

- Undo/Redo cases: `darts-scorer/src/store.tsx:197–229`
- Undo/redo stacks are **not** persisted to localStorage (reset on load: `store.tsx:25–26`)

## 5. View-as-State Routing

There is no router library. Navigation is a state field: `AppState.view` is one of `'home' | 'players' | 'setup' | 'game' | 'result' | 'stats'`. `App.tsx` renders the matching component via a switch/conditional. Navigation dispatches `{ type: 'NAVIGATE', view: '...' }`.

- View type: `darts-scorer/src/types.ts:45`
- Navigate action: `darts-scorer/src/store.tsx:49`

## 6. Two-Phase Score Submission (Double-Out)

Finishing on exactly 0 requires landing on a double. The reducer cannot know this automatically, so it uses a two-step flow:

1. `SUBMIT_TURN` with a finishing score → sets `pendingDoubleOut: true`, `pendingScore: score`, renders `DoubleOutModal`
2. `CONFIRM_DOUBLE_OUT` with `confirmed: boolean` → either applies `applyWin` or `applyBust`

- Flow: `darts-scorer/src/store.tsx:124–195`
- Guard: `SUBMIT_TURN` is a no-op when `pendingDoubleOut` is true (`store.tsx:125`)

## 7. localStorage Persistence

A `useEffect` in `StoreProvider` writes three fields on every relevant state change: `players`, `matchHistory`, `currentMatch`. On load, transient fields (`undoStack`, `redoStack`, `pendingDoubleOut`, `view`) are reset to safe defaults.

- Save effect: `darts-scorer/src/store.tsx:258–265`
- Load + reset: `darts-scorer/src/store.tsx:18–45`
- Storage key constant: `darts-scorer/src/store.tsx:12`

## 8. Stateless Statistics Computation

`statsCalculator.ts` derives all statistics from the immutable `matchHistory` array on demand — nothing is stored pre-computed. It accepts an optional `GameMode` filter (`301 | 501 | undefined`).

- Entry point: `darts-scorer/src/statsCalculator.ts`
- Called from: `darts-scorer/src/components/Stats.tsx`

## 9. playerNames Snapshot in Match

When a match starts, player names are snapshotted into `Match.playerNames: Record<string, string>`. This means renaming or deleting a player after a match doesn't corrupt historical records.

- Snapshot creation: `darts-scorer/src/store.tsx:72–76`
- Type: `darts-scorer/src/types.ts:26`
