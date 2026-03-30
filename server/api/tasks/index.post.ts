import { nanoid } from 'nanoid'
import { tasks } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import type { TaskPayload } from '~/types/focuspocus'
import { serializeTask } from '~/server/utils/serializers'
import {
  normalizePomodoroEstimate,
  normalizeRecurrenceInterval,
  normalizeRecurrenceType,
  normalizeTaskNote,
} from '~/utils/tasks'

export default defineEventHandler(async (event) => {
  const body = await readBody<TaskPayload>(event)

  if (!body?.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task title is required.',
    })
  }

  const db = useDb()
  const newTask = {
    id: nanoid(),
    title: body.title.trim(),
    isDaily: Boolean(body.isDaily),
    completed: false,
    note: normalizeTaskNote(body.note),
    dueDate: body.dueDate ?? null,
    recurrenceType: normalizeRecurrenceType(body.recurrenceType),
    recurrenceInterval: normalizeRecurrenceInterval(body.recurrenceInterval),
    lastCompletedAt: null,
    pomodoroEstimate: normalizePomodoroEstimate(body.pomodoroEstimate),
    createdAt: new Date().toISOString(),
  }

  await db.insert(tasks).values(newTask)
  return serializeTask(newTask)
})
