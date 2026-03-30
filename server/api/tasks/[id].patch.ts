import { eq } from 'drizzle-orm'
import { tasks } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import type { TaskPatchPayload } from '~/types/focuspocus'
import { serializeTask } from '~/server/utils/serializers'
import {
  completeTask,
  normalizePomodoroEstimate,
  normalizeRecurrenceInterval,
  normalizeRecurrenceType,
  normalizeTaskNote,
} from '~/utils/tasks'

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id')
  const body = await readBody<TaskPatchPayload>(event)

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  const updates: Record<string, unknown> = {}
  const db = useDb()
  const existing = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Task title is required.',
      })
    }

    updates.title = body.title.trim()
  }

  if (body.isDaily !== undefined) {
    updates.isDaily = body.isDaily
  }

  if (body.note !== undefined) {
    updates.note = normalizeTaskNote(body.note)
  }

  if (body.completed !== undefined) {
    if (body.completed) {
      Object.assign(
        updates,
        completeTask(
          {
            dueDate:
              body.dueDate !== undefined ? body.dueDate : existing.dueDate,
            recurrenceType: normalizeRecurrenceType(
              String(
                body.recurrenceType !== undefined
                  ? body.recurrenceType
                  : existing.recurrenceType,
              ),
            ),
            recurrenceInterval: normalizeRecurrenceInterval(
              Number(
                body.recurrenceInterval !== undefined
                  ? body.recurrenceInterval
                  : existing.recurrenceInterval,
              ),
            ),
          },
          new Date(),
        ),
      )
    } else {
      updates.completed = false
    }
  }

  if (body.dueDate !== undefined) {
    updates.dueDate = body.dueDate
  }

  if (body.recurrenceType !== undefined) {
    updates.recurrenceType = normalizeRecurrenceType(body.recurrenceType)
  }

  if (body.recurrenceInterval !== undefined) {
    updates.recurrenceInterval = normalizeRecurrenceInterval(
      body.recurrenceInterval,
    )
  }

  if (body.lastCompletedAt !== undefined) {
    updates.lastCompletedAt = body.lastCompletedAt
  }

  if (body.pomodoroEstimate !== undefined) {
    updates.pomodoroEstimate = normalizePomodoroEstimate(body.pomodoroEstimate)
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, taskId))
  const updated = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return serializeTask(updated)
})
