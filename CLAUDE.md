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
VITE_GROQ_API_KEY=...
```

`VITE_GROQ_API_KEY` is used by `src/lib/nutritionApi.js` to call the Groq LLM API (`llama-3.3-70b-versatile`) for food nutrition lookups on the Diet page.

## Architecture

**Stack:** React 18 + React Router v7 + Vite + Supabase (PostgreSQL + Auth + Storage) + Recharts. No TypeScript — plain JSX throughout. Styling is entirely inline styles with design tokens from `src/lib/constants.js`.

**Data layer (`src/lib/db.js`):** All Supabase queries live in one file, organized by domain (auth, daily logs, gym, reading, job prep, CAT prep, custom tasks, diet, analytics). Always throws errors — no silent failures. Uses upsert with `onConflict` for idempotency. Nested relationships fetched via Supabase select syntax (e.g., `gym_workouts(*, gym_exercises(*, gym_sets(*)))`).

**State management (`src/hooks/useTracker.js`):** Core hook that manages daily log state. Implements lazy range loading (tracks loaded date ranges to avoid duplicate fetches), optimistic UI updates with rollback on error, and computed selectors (streak calculation, completion rates). Domain-specific pages fetch their own data at mount via `useCallback` on `user.id`.

**Routing (`src/App.jsx`):** All routes wrapped in `AuthGuard` except `/login`. `AppShell` provides the responsive layout — sidebar on desktop, bottom nav on mobile, controlled by `useMediaQuery`.

**Key design patterns:**
- `daily_logs.metadata` — flexible JSON column for domain-specific extensions without schema changes; all domain forms store extra data here
- `src/lib/constants.js` — single source of truth for `TRACKED_TASKS` (11 predefined tasks with color tokens), `MUSCLE_GROUPS`, `DEFAULT_EXERCISES`, `DIET_MEAL_DEFS`, and font definitions (`FONTS.syne`, `FONTS.mono`, `FONTS.sans`)
- `C` object in constants.js — per-task color scheme (`C.gym.bg`, `C.gym.bd`, `C.gym.tx`) used for task-specific theming throughout
- `DIET_MEAL_DEFS` — defines the 3 default meals (Breakfast/Lunch/Dinner) with `sortOrder: 0/10/20`. Snacks inserted between them use integer sort_orders (e.g. 15, 25). **Never use fractional sort_orders** — the `diet_logs.sort_order` column is `int`.
- Migration utility (`src/lib/migrate.js`) — one-time localStorage → Supabase migration, runs on first authenticated render via `AuthGuard`
- Date helpers in diet/tracker pages must use local time (not `toISOString()`) to avoid UTC offset skipping dates in non-UTC timezones. Pattern: `new Date(y, mo-1, d)` constructor + manual `getFullYear/getMonth/getDate` formatting.
- Sub-components are defined inline within their domain page file (e.g. all Diet sub-components live in `DietPage.jsx`). Do not split into separate files unless the page becomes unmanageable.
- The `Input` component (`src/components/ui/Input.jsx`) calls `onChange(value)` — passes the string directly, not a React event. Handlers must accept a string, not `e.target.value`.

**Supabase Storage:**
- `gym-photos` bucket — workout photos. Policies named `user_upload`, `user_read`, `user_delete`.
- `diet-photos` bucket — food item photos. Policies named `diet_upload`, `diet_read`, `diet_delete`. Storage policies are global across all buckets — always use bucket-specific name prefixes to avoid conflicts.

**Database schema:**
- `daily_logs` — `(user_id, log_date, task_id, done, duration_min, notes, metadata)`
- `gym_workouts` → `gym_exercises` → `gym_sets` (nested 3-level structure)
- `exercise_library` — user's personal exercise catalog with PR tracking
- `books` + `reading_sessions`
- `job_prep_sessions` + `leetcode_problems`
- `cat_prep_sessions`
- `custom_tasks` + `task_sessions`
- `diet_logs` — `(user_id, log_date, meal_type, meal_time, sort_order int, notes)` — one row per meal per day
- `diet_items` — `(meal_id, user_id, food_name, weight_g, calories, protein_g, carbs_g, fat_g, photo_storage_path, raw_api_data)`

**Diet page specifics (`src/pages/diet/DietPage.jsx`):**
- Auto-creates 3 default meals (Breakfast/Lunch/Dinner) on first visit to any date.
- Auto-migrates old sort_orders (0,1,2) to new scale (0,10,20) on first load of each date, so integer snacks can be inserted.
- Snack sort_order = `parentMeal.sort_order + 5 + countOfSnacksAlreadyInSlot` — always an integer.
- Nutrition data fetched from Groq LLM API via `src/lib/nutritionApi.js`. Response may include markdown code fences — strip them before JSON.parse.
- Insights tab supports Day / Week / Month / Year ranges. "Day" view uses the already-loaded `meals` state (no extra DB call). "Year" view aggregates `getDietLogsForRange` results by month.

**Adding a new domain:** Create a page in `src/pages/<domain>/`, add db functions to `src/lib/db.js`, register the route in `src/App.jsx`, add nav links to `src/components/layout/Sidebar.jsx` and `src/components/layout/BottomNav.jsx`, and if it's a daily-trackable task, add it to `TRACKED_TASKS` in `src/lib/constants.js`.
