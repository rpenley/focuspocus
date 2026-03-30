import { nanoid } from 'nanoid'
import { notes } from '~/server/database/schema'
import { useDb } from '~/server/utils/db'
import type { NotePayload } from '~/types/focuspocus'
import { serializeNote } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const body = await readBody<NotePayload>(event)

  if (!body?.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note title is required.',
    })
  }

  const db = useDb()
  const note = {
    id: nanoid(),
    title: body.title.trim(),
    content: body.content ?? '',
    updatedAt: new Date().toISOString(),
  }

  await db.insert(notes).values(note)
  return serializeNote(note)
})
