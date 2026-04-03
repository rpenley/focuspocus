import type {
  RecurrenceType,
  Task,
  TaskCompletionResult,
  TaskDueState,
} from '~/types/focuspocus'
import { getLocalDayRange } from './dates'

export function normalizeTaskNote(note?: string | null) {
  const normalized = note?.trim()
  return normalized ? normalized : null
}

export function normalizeRecurrenceInterval(value?: number | null) {
  return Math.max(1, Math.floor(Number(value ?? 1)))
}

export function normalizePomodoroEstimate(value?: number | null) {
  if (
    value === null ||
    value === undefined ||
    value === 0 ||
    Number.isNaN(value)
  ) {
    return null
  }

  return Math.max(1, Math.floor(Number(value)))
}

export function normalizeRecurrenceType(
  value?: RecurrenceType | string | null,
): RecurrenceType {
  return value && ['daily', 'weekly', 'monthly'].includes(value)
    ? (value as RecurrenceType)
    : 'none'
}

export function calculateNextDueDate(
  dueDate: string | null,
  recurrenceType: RecurrenceType,
  recurrenceInterval: number,
  now = new Date(),
) {
  if (recurrenceType === 'none') {
    return dueDate
  }

  const safeInterval = normalizeRecurrenceInterval(recurrenceInterval)
  const base = dueDate ? new Date(dueDate) : new Date(now)
  const cursor = new Date(base)

  const advance = () => {
    switch (recurrenceType) {
      case 'daily':
        cursor.setDate(cursor.getDate() + safeInterval)
        break
      case 'weekly':
        cursor.setDate(cursor.getDate() + safeInterval * 7)
        break
      case 'monthly':
        cursor.setMonth(cursor.getMonth() + safeInterval)
        break
      default:
        break
    }
  }

  advance()

  while (cursor.getTime() <= now.getTime()) {
    advance()
  }

  return cursor.toISOString()
}

export function completeTask(
  task: Pick<Task, 'dueDate' | 'recurrenceType' | 'recurrenceInterval'>,
  now = new Date(),
): TaskCompletionResult {
  if (task.recurrenceType === 'none') {
    return {
      completed: true,
      dueDate: task.dueDate,
      lastCompletedAt: now.toISOString(),
    }
  }

  return {
    completed: false,
    dueDate: calculateNextDueDate(
      task.dueDate,
      task.recurrenceType,
      task.recurrenceInterval,
      now,
    ),
    lastCompletedAt: now.toISOString(),
  }
}

export function getTaskDueState(
  dueDate: string | null,
  now = new Date(),
): TaskDueState {
  if (!dueDate) {
    return 'none'
  }

  const date = new Date(dueDate)
  const { start, end } = getLocalDayRange(now)
  const dayStart = new Date(start).getTime()
  const dayEnd = new Date(end).getTime()
  const dueTime = date.getTime()

  if (dueTime < dayStart) {
    return 'overdue'
  }

  if (dueTime >= dayStart && dueTime < dayEnd) {
    return 'today'
  }

  return 'upcoming'
}

export function getTaskDueMeta(dueDate: string | null, now = new Date()) {
  const state = getTaskDueState(dueDate, now)

  switch (state) {
    case 'overdue':
      return {
        state,
        label: 'Overdue',
        className:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200',
      }
    case 'today':
      return {
        state,
        label: 'Due Today',
        className:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200',
      }
    case 'upcoming':
      return {
        state,
        label: 'Upcoming',
        className:
          'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-200',
      }
    default:
      return {
        state,
        label: 'No Date',
        className:
          'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300',
      }
  }
}

export function getRecurrenceLabel(
  task: Pick<Task, 'recurrenceType' | 'recurrenceInterval'>,
) {
  if (task.recurrenceType === 'none') {
    return null
  }

  const interval = normalizeRecurrenceInterval(task.recurrenceInterval)
  const unit =
    task.recurrenceType === 'daily'
      ? 'day'
      : task.recurrenceType === 'weekly'
        ? 'week'
        : 'month'

  return interval === 1
    ? `Repeats every ${unit}`
    : `Repeats every ${interval} ${unit}s`
}

export function getTaskSortValue(task: Pick<Task, 'dueDate' | 'createdAt'>) {
  return task.dueDate ?? task.createdAt
}
