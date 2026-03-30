import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as schema from '../database/schema'

type FocusPocusDb = ReturnType<typeof drizzle<typeof schema>>

declare global {
  var __focusPocusSqlite__: Database.Database | undefined
  var __focusPocusDb__: FocusPocusDb | undefined
}

function initializeSchema(sqlite: Database.Database) {
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      is_daily INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      due_date TEXT,
      recurrence_type TEXT NOT NULL DEFAULT 'none',
      recurrence_interval INTEGER NOT NULL DEFAULT 1,
      last_completed_at TEXT,
      pomodoro_estimate INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      tracker_mode TEXT,
      tracker_phase TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `)

  const columns = sqlite.prepare('PRAGMA table_info(tasks)').all() as Array<{
    name: string
  }>

  const existingColumns = new Set(columns.map((column) => column.name))

  if (!existingColumns.has('note')) {
    sqlite.exec('ALTER TABLE tasks ADD COLUMN note TEXT')
  }

  if (!existingColumns.has('recurrence_type')) {
    sqlite.exec(
      "ALTER TABLE tasks ADD COLUMN recurrence_type TEXT NOT NULL DEFAULT 'none'",
    )
  }

  if (!existingColumns.has('recurrence_interval')) {
    sqlite.exec(
      'ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER NOT NULL DEFAULT 1',
    )
  }

  if (!existingColumns.has('last_completed_at')) {
    sqlite.exec('ALTER TABLE tasks ADD COLUMN last_completed_at TEXT')
  }

  if (!existingColumns.has('pomodoro_estimate')) {
    sqlite.exec('ALTER TABLE tasks ADD COLUMN pomodoro_estimate INTEGER')
  }

  const logColumns = sqlite
    .prepare('PRAGMA table_info(time_logs)')
    .all() as Array<{ name: string }>

  const existingLogColumns = new Set(logColumns.map((column) => column.name))

  if (!existingLogColumns.has('tracker_mode')) {
    sqlite.exec('ALTER TABLE time_logs ADD COLUMN tracker_mode TEXT')
  }

  if (!existingLogColumns.has('tracker_phase')) {
    sqlite.exec('ALTER TABLE time_logs ADD COLUMN tracker_phase TEXT')
  }
}

export function useDb() {
  if (!globalThis.__focusPocusDb__) {
    const config = useRuntimeConfig()
    const databasePath = resolve(process.cwd(), config.databasePath)
    mkdirSync(dirname(databasePath), { recursive: true })

    const sqlite = globalThis.__focusPocusSqlite__ ?? new Database(databasePath)
    initializeSchema(sqlite)

    globalThis.__focusPocusSqlite__ = sqlite
    globalThis.__focusPocusDb__ = drizzle(sqlite, { schema })
  }

  return globalThis.__focusPocusDb__
}
