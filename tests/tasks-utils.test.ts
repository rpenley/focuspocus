import { describe, expect, it } from 'vitest'
import {
  completeTask,
  getTaskDueState,
  normalizePomodoroEstimate,
  normalizeRecurrenceInterval,
} from '../utils/tasks'

describe('task utils', () => {
  it('normalizes recurrence and estimate inputs', () => {
    expect(normalizeRecurrenceInterval(0)).toBe(1)
    expect(normalizePomodoroEstimate(0)).toBe(null)
    expect(normalizePomodoroEstimate(2.8)).toBe(2)
  })

  it('rolls recurring tasks forward instead of leaving them completed', () => {
    const result = completeTask(
      {
        dueDate: '2026-03-29T12:00:00.000Z',
        recurrenceType: 'daily',
        recurrenceInterval: 1,
      },
      new Date('2026-03-30T16:00:00.000Z'),
    )

    expect(result.completed).toBe(false)
    expect(result.dueDate).toBe('2026-03-31T12:00:00.000Z')
    expect(result.lastCompletedAt).toBe('2026-03-30T16:00:00.000Z')
  })

  it('advances recurring tasks even when completed before the due timestamp', () => {
    const result = completeTask(
      {
        dueDate: '2026-03-30T12:00:00.000Z',
        recurrenceType: 'weekly',
        recurrenceInterval: 2,
      },
      new Date('2026-03-30T05:07:59.217Z'),
    )

    expect(result.completed).toBe(false)
    expect(result.dueDate).toBe('2026-04-13T12:00:00.000Z')
  })

  it('marks non-recurring tasks completed without changing due date', () => {
    const result = completeTask(
      {
        dueDate: '2026-03-30T12:00:00.000Z',
        recurrenceType: 'none',
        recurrenceInterval: 1,
      },
      new Date('2026-03-30T16:00:00.000Z'),
    )

    expect(result).toEqual({
      completed: true,
      dueDate: '2026-03-30T12:00:00.000Z',
      lastCompletedAt: '2026-03-30T16:00:00.000Z',
    })
  })

  it('derives due state against the local day boundary', () => {
    const now = new Date('2026-03-30T16:00:00.000Z')

    expect(getTaskDueState('2026-03-29T12:00:00.000Z', now)).toBe('overdue')
    expect(getTaskDueState('2026-03-30T12:00:00.000Z', now)).toBe('today')
    expect(getTaskDueState('2026-03-31T12:00:00.000Z', now)).toBe('upcoming')
    expect(getTaskDueState(null, now)).toBe('none')
  })
})
