import { eq } from 'drizzle-orm'
import { tasks } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  const db = useDb()
  await db.delete(tasks).where(eq(tasks.id, taskId))

  return { ok: true }
})
