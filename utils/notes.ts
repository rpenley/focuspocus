import type { Note } from '~/types/focuspocus'

export interface PendingNoteSave {
  noteId: string
  title: string
  content: string
}

export function createPendingNoteSave(
  noteId: string,
  title: string,
  content: string,
): PendingNoteSave {
  return {
    noteId,
    title: title.trim() ? title : 'Untitled',
    content,
  }
}

export function applyOptimisticNoteUpdate(
  notes: Note[],
  pendingSave: PendingNoteSave,
  timestamp = new Date().toISOString(),
) {
  return notes.map((note) =>
    note.id === pendingSave.noteId
      ? {
          ...note,
          title: pendingSave.title,
          content: pendingSave.content,
          updatedAt: timestamp,
        }
      : note,
  )
}
