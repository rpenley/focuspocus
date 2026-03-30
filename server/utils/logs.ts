import { nanoid } from 'nanoid'
import type { LogPayload } from '~/types/focuspocus'
export { getLocalDayRange } from '../../utils/dates'

export function createTimeLogRecord(body: LogPayload) {
  return {
    id: nanoid(),
    taskId: body.taskId,
    startTime: new Date(body.startTime).toISOString(),
    endTime: new Date(body.endTime).toISOString(),
    durationSeconds: Math.max(0, Math.floor(Number(body.durationSeconds ?? 0))),
    trackerMode: body.trackerMode ?? null,
    trackerPhase: body.trackerPhase ?? null,
  }
}
