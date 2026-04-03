<script setup lang="ts">
import { applyOptimisticNoteUpdate, createPendingNoteSave } from '~/utils/notes'
import type { Note } from '~/types/focuspocus'
import { formatUtcDateTime } from '~/utils/dates'

definePageMeta({
  layout: 'default',
})

const initialNotes = await $fetch<Note[]>('/api/notes')
const notes = ref<Note[]>(initialNotes)
const activeNoteId = ref<string | null>(notes.value[0]?.id ?? null)
const draftTitle = ref('')
const draftContent = ref('')
let debounceHandle: ReturnType<typeof setTimeout> | null = null
const pendingSave = ref<{
  noteId: string
  title: string
  content: string
} | null>(null)

const activeNote = computed(
  () => notes.value.find((note) => note.id === activeNoteId.value) ?? null,
)

watch(
  activeNote,
  (note) => {
    draftTitle.value = note?.title ?? ''
    draftContent.value = note?.content ?? ''
  },
  { immediate: true },
)

async function createNote() {
  const note = await $fetch<Note>('/api/notes', {
    method: 'POST',
    body: {
      title: `Untitled ${notes.value.length + 1}`,
      content: '',
    },
  })

  notes.value.unshift(note)
  activeNoteId.value = note.id
}

function queueAutosave() {
  if (!activeNote.value) {
    return
  }

  if (debounceHandle) {
    clearTimeout(debounceHandle)
  }

  const currentNoteId = activeNote.value.id
  const content = draftContent.value
  pendingSave.value = createPendingNoteSave(
    currentNoteId,
    draftTitle.value,
    content,
  )

  notes.value = applyOptimisticNoteUpdate(notes.value, pendingSave.value)

  debounceHandle = setTimeout(async () => {
    const updated = await $fetch<Note>(`/api/notes/${currentNoteId}`, {
      method: 'PUT',
      body: {
        title: pendingSave.value?.title ?? 'Untitled',
        content: pendingSave.value?.content ?? '',
      },
    })

    const updatedIndex = notes.value.findIndex((note) => note.id === updated.id)
    if (updatedIndex >= 0) {
      notes.value[updatedIndex] = updated
    }

    pendingSave.value = null
  }, 500)
}

async function flushAutosave() {
  if (debounceHandle) {
    clearTimeout(debounceHandle)
    debounceHandle = null
  }

  if (!pendingSave.value) {
    return
  }

  const { noteId, title, content } = pendingSave.value
  const updated = await $fetch<Note>(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: {
      title,
      content,
    },
  })

  const updatedIndex = notes.value.findIndex((note) => note.id === updated.id)
  if (updatedIndex >= 0) {
    notes.value[updatedIndex] = updated
  }

  pendingSave.value = null
}

onBeforeRouteLeave(async () => {
  await flushAutosave()
})

onBeforeUnmount(() => {
  if (debounceHandle) {
    clearTimeout(debounceHandle)
  }
})
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <p class="page-kicker">Notes</p>
      <h2 class="page-title">Persistent notes without clutter</h2>
      <p class="page-copy">
        Keep a lightweight notebook beside your tasks. Changes save
        automatically as you type.
      </p>
    </section>

    <div class="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <section class="panel overflow-hidden">
        <header class="panel-header">
          <div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Notebook
            </h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {{ notes.length }} saved
              {{ notes.length === 1 ? 'note' : 'notes' }}
            </p>
          </div>
          <button class="button-secondary" @click="createNote">New</button>
        </header>

        <div class="max-h-[70vh] overflow-auto p-3">
          <button
            v-for="note in notes"
            :key="note.id"
            class="mb-2 w-full rounded-2xl border px-4 py-3 text-left outline-none focus:ring-4 focus:ring-accent/10"
            :class="
              activeNoteId === note.id
                ? 'border-blue-200 bg-blue-50 dark:border-blue-400/40 dark:bg-blue-500/10'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
            "
            @click="activeNoteId = note.id"
          >
            <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {{ note.title }}
            </p>
            <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {{ formatUtcDateTime(note.updatedAt) }}
            </p>
          </button>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <div class="min-w-0 flex-1">
            <input
              v-model="draftTitle"
              class="w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              type="text"
              placeholder="Note title"
              @input="queueAutosave"
            />
          </div>
        </header>

        <div class="panel-body">
          <textarea
            v-model="draftContent"
            class="min-h-[70vh] w-full resize-none rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 text-sm leading-7 text-zinc-800 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Write here..."
            @input="queueAutosave"
          />
        </div>
      </section>
    </div>
  </div>
</template>
