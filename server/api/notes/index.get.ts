import { desc } from 'drizzle-orm'
import { notes } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import { serializeNote } from '~/server/utils/serializers'

export default defineEventHandler(async () => {
  const db = useDb()
  const results = await db.select().from(notes).orderBy(desc(notes.updatedAt))
  return results.map((note) => serializeNote(note))
})
