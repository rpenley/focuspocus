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
  <div class="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
    <section class="panel overflow-hidden">
      <header class="panel-header">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Notes
          </p>
          <h2 class="mt-2 text-xl font-semibold text-white">
            Simple persistent notes
          </h2>
        </div>
        <button class="button-secondary" @click="createNote">New</button>
      </header>

      <div class="max-h-[70vh] overflow-auto p-3">
        <button
          v-for="note in notes"
          :key="note.id"
          class="mb-2 w-full rounded-2xl border px-4 py-3 text-left outline-none focus:ring-2 focus:ring-accent/60"
          :class="
            activeNoteId === note.id
              ? 'border-accent bg-accent/10'
              : 'border-white/10 bg-white/5'
          "
          @click="activeNoteId = note.id"
        >
          <p class="truncate text-sm font-medium text-white">
            {{ note.title }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
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
            class="w-full bg-transparent text-xl font-semibold text-white outline-none"
            type="text"
            placeholder="Note title"
            @input="queueAutosave"
          />
        </div>
      </header>

      <div class="panel-body">
        <textarea
          v-model="draftContent"
          class="min-h-[70vh] w-full resize-none rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-100 outline-none focus:border-accent"
          placeholder="Write here..."
          @input="queueAutosave"
        />
      </div>
    </section>
  </div>
</template>
