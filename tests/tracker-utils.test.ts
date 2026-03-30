import { describe, expect, it } from 'vitest'
import {
  calculateElapsedSeconds,
  DEFAULT_POMODORO_SETTINGS,
  getPomodoroProgress,
  getNextPomodoroBreakPhase,
  normalizePomodoroSettings,
  shouldCountCompletedFocusSession,
} from '../utils/tracker'
import type { TrackerSessionSnapshot } from '../types/focuspocus'

describe('tracker utils', () => {
  it('normalizes invalid pomodoro settings', () => {
    expect(
      normalizePomodoroSettings({
        focusMinutes: 0.2,
        shortBreakMinutes: -5,
        longBreakMinutes: 2.8,
        sessionsUntilLongBreak: 1,
      }),
    ).toEqual({
      focusMinutes: 1,
      shortBreakMinutes: 1,
      longBreakMinutes: 2,
      sessionsUntilLongBreak: 2,
    })
  })

  it('returns the correct next break phase', () => {
    expect(getNextPomodoroBreakPhase(1, DEFAULT_POMODORO_SETTINGS)).toBe(
      'short-break',
    )
    expect(getNextPomodoroBreakPhase(4, DEFAULT_POMODORO_SETTINGS)).toBe(
      'long-break',
    )
  })

  it('counts only completed pomodoro focus sessions', () => {
    const completedFocus: TrackerSessionSnapshot = {
      taskId: 'task-1',
      mode: 'pomodoro',
      phase: 'focus',
      startTime: new Date().toISOString(),
      elapsedSeconds: 1500,
      targetDurationSeconds: 1500,
    }

    const interruptedFocus: TrackerSessionSnapshot = {
      ...completedFocus,
      elapsedSeconds: 600,
    }

    const breakSession: TrackerSessionSnapshot = {
      ...completedFocus,
      phase: 'short-break',
      taskId: null,
    }

    expect(shouldCountCompletedFocusSession(completedFocus)).toBe(true)
    expect(shouldCountCompletedFocusSession(interruptedFocus)).toBe(false)
    expect(shouldCountCompletedFocusSession(breakSession)).toBe(false)
  })

  it('calculates elapsed time across paused and resumed state', () => {
    expect(calculateElapsedSeconds(120, null)).toBe(120)
    expect(
      calculateElapsedSeconds(
        120,
        '2026-03-30T10:00:00.000Z',
        new Date('2026-03-30T10:01:15.000Z').getTime(),
      ),
    ).toBe(195)
  })

  it('compares pomodoro estimate against completed focus sessions', () => {
    expect(getPomodoroProgress(4, 1)).toEqual({
      estimate: 4,
      completed: 1,
      remaining: 3,
    })
    expect(getPomodoroProgress(null, 2)).toBe(null)
  })
})
