# Darts Scorer

A browser-based score tracker for two-player darts matches (301 and 501). Built as an experimental project to get familiar with coding with LLM assistance.

## Features

- **Match setup** — choose game mode (301/501), best-of format (1–9 legs), and starting player
- **Score entry** with automatic bust detection and double-out confirmation
- **Undo/redo** for any turn during a match
- **Match history** with per-player statistics (average, checkout rate, 180s, and more)
- **Persistent state** — reloading the page resumes the current match

## Tech Stack

React 19 · TypeScript · Vite · Custom CSS · localStorage (no backend)

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/darts-scorer/

## Build

```bash
npm run build    # type-check + bundle
npm run preview  # preview the production build
```

## Deployment

Automatically deployed to GitHub Pages on push to `main`.

## About

This project is being developed as a hands-on experiment in AI-assisted development using Claude Code.
