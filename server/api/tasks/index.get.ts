import { asc } from 'drizzle-orm'
import { tasks } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import { serializeTask } from '~/server/utils/serializers'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(tasks).orderBy(asc(tasks.createdAt))

  return results.map((task) => serializeTask(task))
})
