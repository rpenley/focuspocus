import { describe, expect, it } from 'vitest'
import { formatUtcDate, formatUtcDateTime } from '../utils/dates'

describe('date utils', () => {
  it('formats UTC dates deterministically', () => {
    expect(formatUtcDate('2026-03-30T04:30:18.000Z')).toBe('3/30/2026')
  })

  it('formats UTC date-times deterministically', () => {
    expect(formatUtcDateTime('2026-03-30T04:30:18.000Z')).toBe(
      '3/30/2026, 4:30:18 AM UTC',
    )
  })
})
