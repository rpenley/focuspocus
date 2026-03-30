import { describe, expect, it } from 'vitest'
import {
  applyOptimisticNoteUpdate,
  createPendingNoteSave,
} from '../utils/notes'
import type { Note } from '../types/focuspocus'

describe('notes utils', () => {
  it('creates a pending save with a fallback title', () => {
    expect(createPendingNoteSave('note-1', '   ', 'draft')).toEqual({
      noteId: 'note-1',
      title: 'Untitled',
      content: 'draft',
    })
  })

  it('applies an optimistic note update to the matching note only', () => {
    const notes: Note[] = [
      {
        id: 'note-1',
        title: 'Before',
        content: 'Old',
        updatedAt: '2026-03-30T10:00:00.000Z',
      },
      {
        id: 'note-2',
        title: 'Keep',
        content: 'Same',
        updatedAt: '2026-03-30T09:00:00.000Z',
      },
    ]

    const updated = applyOptimisticNoteUpdate(
      notes,
      createPendingNoteSave('note-1', ' After ', 'New body'),
      '2026-03-30T11:00:00.000Z',
    )

    expect(updated).toEqual([
      {
        id: 'note-1',
        title: ' After ',
        content: 'New body',
        updatedAt: '2026-03-30T11:00:00.000Z',
      },
      notes[1],
    ])
  })
})
