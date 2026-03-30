import { eq } from 'drizzle-orm'
import { notes } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import { serializeNote } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id')

  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note id is required.',
    })
  }

  const db = useDb()
  const note = await db.select().from(notes).where(eq(notes.id, noteId)).get()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found.' })
  }

  return serializeNote(note)
})
