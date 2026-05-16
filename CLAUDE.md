# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build at http://localhost:4173
```

No test runner or linter is configured.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** React 18 + React Router v7 + Vite + Supabase (PostgreSQL + Auth) + Recharts. No TypeScript — plain JSX throughout. Styling is entirely inline styles with design tokens from `src/lib/constants.js`.

**Data layer (`src/lib/db.js`):** All Supabase queries live in one file, organized by domain (auth, daily logs, gym, reading, job prep, CAT prep, custom tasks, analytics). Always throws errors — no silent failures. Uses upsert with `onConflict` for idempotency. Nested relationships fetched via Supabase select syntax (e.g., `gym_workouts(*, gym_exercises(*, gym_sets(*)))`).

**State management (`src/hooks/useTracker.js`):** Core hook that manages daily log state. Implements lazy range loading (tracks loaded date ranges to avoid duplicate fetches), optimistic UI updates with rollback on error, and computed selectors (streak calculation, completion rates). Domain-specific pages fetch their own data at mount via `useCallback` on `user.id`.

**Routing (`src/App.jsx`):** All routes wrapped in `AuthGuard` except `/login`. `AppShell` provides the responsive layout — sidebar on desktop, bottom nav on mobile, controlled by `useMediaQuery`.

**Key design patterns:**
- `daily_logs.metadata` — flexible JSON column for domain-specific extensions without schema changes; all domain forms store extra data here
- `src/lib/constants.js` — single source of truth for `TRACKED_TASKS` (12 predefined tasks with color tokens), `MUSCLE_GROUPS`, `DEFAULT_EXERCISES`, and font definitions (`FONTS.syne`, `FONTS.mono`, `FONTS.sans`)
- `C` object in constants.js — per-task color scheme (`C.gym.bg`, `C.gym.bd`, `C.gym.tx`) used for task-specific theming throughout
- Migration utility (`src/lib/migrate.js`) — one-time localStorage → Supabase migration, runs on first authenticated render via `AuthGuard`

**Database schema (inferred from db.js):**
- `daily_logs` — `(user_id, log_date, task_id, done, duration_min, notes, metadata)`
- `gym_workouts` → `gym_exercises` → `gym_sets` (nested 3-level structure)
- `exercise_library` — user's personal exercise catalog with PR tracking
- `books` + `reading_sessions`
- `job_prep_sessions` + `leetcode_problems`
- `cat_prep_sessions`
- `custom_tasks` + `task_sessions`

**Adding a new domain:** Create a page in `src/pages/<domain>/`, add db functions to `src/lib/db.js`, register the route in `src/App.jsx`, add nav links to `src/components/layout/Sidebar.jsx` and `src/components/layout/BottomNav.jsx`, and if it's a daily-trackable task, add it to `TRACKED_TASKS` in `src/lib/constants.js`.
