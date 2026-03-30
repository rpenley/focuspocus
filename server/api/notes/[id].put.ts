import { eq } from 'drizzle-orm'
import { notes } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import type { NotePayload } from '~/types/focuspocus'
import { serializeNote } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id')
  const body = await readBody<NotePayload>(event)

  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note id is required.',
    })
  }

  if (!body?.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note title is required.',
    })
  }

  const db = useDb()
  await db
    .update(notes)
    .set({
      title: body.title.trim(),
      content: body.content ?? '',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(notes.id, noteId))

  const updated = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .get()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found.' })
  }

  return serializeNote(updated)
})
