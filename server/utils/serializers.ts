import type { Note, Task, TimeLog } from '~/types/focuspocus'
import {
  normalizePomodoroEstimate,
  normalizeRecurrenceInterval,
  normalizeRecurrenceType,
  normalizeTaskNote,
} from '~/utils/tasks'

export function serializeTask(task: Record<string, unknown>): Task {
  return {
    id: String(task.id),
    title: String(task.title),
    isDaily: Boolean(task.isDaily),
    completed: Boolean(task.completed),
    note: normalizeTaskNote(task.note ? String(task.note) : null),
    dueDate: task.dueDate ? String(task.dueDate) : null,
    recurrenceType: normalizeRecurrenceType(
      String(task.recurrenceType ?? 'none'),
    ),
    recurrenceInterval: normalizeRecurrenceInterval(
      Number(task.recurrenceInterval ?? 1),
    ),
    lastCompletedAt: task.lastCompletedAt ? String(task.lastCompletedAt) : null,
    pomodoroEstimate: normalizePomodoroEstimate(
      Number(task.pomodoroEstimate ?? 0),
    ),
    createdAt: String(task.createdAt),
  }
}

export function serializeNote(note: Record<string, unknown>): Note {
  return {
    id: String(note.id),
    title: String(note.title),
    content: String(note.content),
    updatedAt: String(note.updatedAt),
  }
}

export function serializeTimeLog(log: Record<string, unknown>): TimeLog {
  return {
    id: String(log.id),
    taskId: String(log.taskId),
    startTime: String(log.startTime),
    endTime: log.endTime ? String(log.endTime) : null,
    durationSeconds: Number(log.durationSeconds ?? 0),
    trackerMode: log.trackerMode
      ? (String(log.trackerMode) as TimeLog['trackerMode'])
      : null,
    trackerPhase: log.trackerPhase
      ? (String(log.trackerPhase) as TimeLog['trackerPhase'])
      : null,
  }
}
