import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  isDaily: integer('is_daily', { mode: 'boolean' }).notNull().default(false),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  note: text('note'),
  dueDate: text('due_date'),
  recurrenceType: text('recurrence_type').notNull().default('none'),
  recurrenceInterval: integer('recurrence_interval').notNull().default(1),
  lastCompletedAt: text('last_completed_at'),
  pomodoroEstimate: integer('pomodoro_estimate'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const timeLogs = sqliteTable('time_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  trackerMode: text('tracker_mode'),
  trackerPhase: text('tracker_phase'),
})

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const taskRelations = relations(tasks, ({ many }) => ({
  timeLogs: many(timeLogs),
}))

export const timeLogRelations = relations(timeLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [timeLogs.taskId],
    references: [tasks.id],
  }),
}))
