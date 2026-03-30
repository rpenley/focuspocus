import { describe, expect, it, vi } from 'vitest'
import { createTimeLogRecord, getLocalDayRange } from '../server/utils/logs'

describe('log utils', () => {
  it('builds the local day range from a supplied date', () => {
    const range = getLocalDayRange(new Date('2026-03-30T15:45:12.000Z'))

    expect(
      new Date(range.end).getTime() - new Date(range.start).getTime(),
    ).toBe(24 * 60 * 60 * 1000)
    expect(new Date(range.start).getUTCHours()).toBe(
      new Date(range.end).getUTCHours(),
    )
  })

  it('normalizes a time log record payload', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

    const record = createTimeLogRecord({
      taskId: 'task-1',
      startTime: '2026-03-30T10:00:00.000Z',
      endTime: '2026-03-30T10:24:59.900Z',
      durationSeconds: 1499.9,
    })

    expect(record).toMatchObject({
      taskId: 'task-1',
      startTime: '2026-03-30T10:00:00.000Z',
      endTime: '2026-03-30T10:24:59.900Z',
      durationSeconds: 1499,
    })

    vi.restoreAllMocks()
  })
})
