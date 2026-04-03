export interface Task {
  id: string
  title: string
  isDaily: boolean
  completed: boolean
  note: string | null
  dueDate: string | null
  recurrenceType: RecurrenceType
  recurrenceInterval: number
  lastCompletedAt: string | null
  pomodoroEstimate: number | null
  createdAt: string
}

export interface TimeLog {
  id: string
  taskId: string
  startTime: string
  endTime: string | null
  durationSeconds: number
  trackerMode: TrackerMode | null
  trackerPhase: TrackerPhase | null
}

export type TrackerMode = 'stopwatch' | 'pomodoro'

export type TrackerPhase = 'focus' | 'short-break' | 'long-break'

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export type TaskDueState = 'overdue' | 'today' | 'upcoming' | 'none'

export interface TaskPayload {
  title: string
  isDaily?: boolean
  note?: string | null
  dueDate?: string | null
  recurrenceType?: RecurrenceType
  recurrenceInterval?: number
  pomodoroEstimate?: number | null
}

export interface TaskPatchPayload {
  title?: string
  isDaily?: boolean
  completed?: boolean
  note?: string | null
  dueDate?: string | null
  recurrenceType?: RecurrenceType
  recurrenceInterval?: number
  lastCompletedAt?: string | null
  pomodoroEstimate?: number | null
}

export interface NotePayload {
  title: string
  content?: string
}

export interface LogPayload {
  taskId: string
  startTime: string
  endTime: string
  durationSeconds: number
  trackerMode?: TrackerMode | null
  trackerPhase?: TrackerPhase | null
}

export interface DailySummaryItem {
  taskId: string
  taskTitle: string
  totalSeconds: number
}

export interface PomodoroSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsUntilLongBreak: number
}

export interface TrackerSessionSnapshot {
  taskId: string | null
  mode: TrackerMode
  phase: TrackerPhase
  startTime: string
  elapsedSeconds: number
  targetDurationSeconds: number | null
}

export interface TaskCompletionResult {
  completed: boolean
  dueDate: string | null
  lastCompletedAt: string | null
}
