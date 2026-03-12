# Darts Scorer

A two-player darts scoring app (301/501) with match history, statistics, and undo/redo. Deployed to GitHub Pages.

## Tech Stack

- **React 19** + **TypeScript 5** (strict)
- **Vite 7** for bundling and dev server
- **ESLint 9** (flat config) with typescript-eslint and react-hooks plugins
- No UI library — custom CSS only
- No backend — localStorage for persistence

## Project Structure

```
darts-scorer/
├── src/
│   ├── types.ts           # All TypeScript interfaces (Player, Turn, Leg, Match, AppState, Action)
│   ├── store.tsx          # Global state: useReducer + Context + localStorage persistence
│   ├── gameLogic.ts       # Pure functions for game rules (bust detection, turn application, etc.)
│   ├── statsCalculator.ts # Derives statistics from match history
│   ├── App.tsx            # View router — switches between 6 views based on state.view
│   ├── main.tsx           # Entry point
│   └── components/        # One file per view or sub-component (10 files)
├── .github/workflows/
│   └── deploy.yml         # CI: tsc + vite build → GitHub Pages
├── vite.config.ts         # base: '/darts-scorer/' for GitHub Pages subdirectory
└── index.html
```

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # tsc -b && vite build (type-check then bundle)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

Deployment is automatic on push to `main` via GitHub Actions.

## Key Files

- Data model: `darts-scorer/src/types.ts:1`
- State management: `darts-scorer/src/store.tsx:47` (reducer), `darts-scorer/src/store.tsx:274` (useStore hook)
- Game rules: `darts-scorer/src/gameLogic.ts:44` (evaluateTurn), `darts-scorer/src/gameLogic.ts:78` (applyWin)
- View routing: `darts-scorer/src/App.tsx`
- localStorage key: `darts-scorer/src/store.tsx:12` (`darts_app_v1`)

## Additional Documentation

| File | When to check |
|---|---|
| `.claude/docs/architectural_patterns.md` | Adding features, modifying state, or working with game logic |
