import type {
  PomodoroSettings,
  TrackerPhase,
  TrackerSessionSnapshot,
} from '~/types/focuspocus'

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
}

export function normalizePomodoroSettings(
  settings: PomodoroSettings,
): PomodoroSettings {
  return {
    focusMinutes: Math.max(1, Math.floor(settings.focusMinutes)),
    shortBreakMinutes: Math.max(1, Math.floor(settings.shortBreakMinutes)),
    longBreakMinutes: Math.max(1, Math.floor(settings.longBreakMinutes)),
    sessionsUntilLongBreak: Math.max(
      2,
      Math.floor(settings.sessionsUntilLongBreak),
    ),
  }
}

export function getNextPomodoroBreakPhase(
  completedFocusSessions: number,
  settings: PomodoroSettings,
): TrackerPhase {
  return completedFocusSessions % settings.sessionsUntilLongBreak === 0
    ? 'long-break'
    : 'short-break'
}

export function shouldCountCompletedFocusSession(
  session: TrackerSessionSnapshot | null,
) {
  return Boolean(
    session &&
    session.mode === 'pomodoro' &&
    session.phase === 'focus' &&
    session.targetDurationSeconds !== null &&
    session.elapsedSeconds >= session.targetDurationSeconds,
  )
}

export function calculateElapsedSeconds(
  accumulatedSeconds: number,
  resumedAt: string | null,
  now = Date.now(),
) {
  if (!resumedAt) {
    return Math.max(0, accumulatedSeconds)
  }

  return Math.max(
    0,
    accumulatedSeconds +
      Math.floor((now - new Date(resumedAt).getTime()) / 1000),
  )
}

export function getPomodoroProgress(
  estimate: number | null,
  completedFocusSessions: number,
) {
  if (!estimate) {
    return null
  }

  return {
    estimate,
    completed: completedFocusSessions,
    remaining: Math.max(estimate - completedFocusSessions, 0),
  }
}
