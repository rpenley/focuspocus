# FocusPocus

FocusPocus is a local-first productivity app built with Nuxt 3. It combines task management, calendar scheduling, time tracking, and notes in a single SQLite-backed application.

## Stack

- Nuxt 3 with Vue 3 and TypeScript
- Tailwind CSS for styling
- Pinia for client state
- Nitro server routes for the app API
- SQLite via `better-sqlite3` and Drizzle ORM
- `date-fns` for calendar and timer date logic

## Feature Outline

- Today: planner-first dashboard for overdue work, due-today tasks, daily focus, and the active timer
- Tasks: daily focus items and backlog tasks with task-local notes, due dates, recurrence, and Pomodoro estimates
- Calendar: month grid with date-based task scheduling and per-day previews
- Tracker: free stopwatch, task-attached stopwatch sessions, and Pomodoro-style focus sessions with persisted time logs
- Notes: simple autosaving note editor

## Project Layout

```text
assets/css/                Shared styling
components/                Reusable UI pieces
composables/               Cross-page client logic
layouts/                   Global app layout
pages/                     Route-level UI
plugins/                   Nuxt client plugins
server/api/                Nitro API endpoints
server/database/           Drizzle schema
server/utils/              DB bootstrap and serializers
stores/                    Pinia stores
types/                     Shared TypeScript interfaces
design.md                  Product and implementation spec
```

## Local Development

1. Install dependencies.
2. Start the Nuxt dev server.
3. Open the app at `http://127.0.0.1:3000/`.

```bash
npm install
npm run dev
```

The SQLite database defaults to `server/database/focuspocus.sqlite`.

## Environment

Optional environment variables:

- `NUXT_DATABASE_PATH`: override the SQLite database path

Example:

```bash
cp .env.example .env
```

## Docker Development

Use Docker when you want a consistent local environment without installing Node tooling directly on the host.

```bash
docker compose up --build
```

The Compose setup mounts the repository for live editing, keeps `node_modules` in a named volume, and persists the SQLite file on the host.

## Development Process

Recommended workflow for feature work:

1. Read `design.md` and inspect the relevant route, store, composable, and API handler before making changes.
2. Run the app with `npm run dev`.
3. Make changes in the smallest layer that owns the behavior:
   frontend route or component for UI changes,
   store or composable for client state,
   `server/api` or `server/utils` for persistence and server behavior.
4. Verify the affected flow in the browser.
5. Run automated checks and a production build before handing work off.

Current verification commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## API Surface

Current server routes:

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/notes`
- `GET /api/notes/:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `GET /api/logs`
- `POST /api/logs`

## Quality Status

Current repo quality gates are minimal:

- There is a Prettier formatter and format-check command.
- There is an ESLint command for baseline structural checks.
- There is a TypeScript typecheck command.
- There is a production build command.
- There is a small Vitest suite covering date, task, tracker, logs, and note helpers.
- Coverage is still limited and should be expanded for API handlers and route-level behavior.
