<script setup lang="ts">
import {
  ArchiveX,
  Check,
  PencilLine,
  RotateCcw,
  Timer,
  Trash2,
} from 'lucide-vue-next'
import type { Task } from '~/types/focuspocus'
import { formatUtcDate } from '~/utils/dates'
import { getRecurrenceLabel, getTaskDueMeta } from '~/utils/tasks'

const props = defineProps<{
  title: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  toggle: [task: Task]
  delete: [task: Task]
  move: [task: Task]
  edit: [task: Task]
  startTimer: [task: Task]
}>()
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {{ props.title }}
        </h2>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {{ props.tasks.length }} visible
        </p>
      </div>
    </header>

    <div class="panel-body space-y-3">
      <p v-if="!props.tasks.length" class="empty-state">Nothing here yet.</p>

      <article
        v-for="task in props.tasks"
        :key="task.id"
        class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-zinc-700"
        :class="task.completed ? 'opacity-60' : ''"
      >
        <div class="flex items-start gap-3">
          <button
            :aria-pressed="task.completed"
            class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border outline-none focus:ring-4 focus:ring-accent/10"
            :class="
              task.completed
                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-zinc-950'
                : 'border-zinc-300 bg-white text-zinc-400 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500 dark:hover:border-blue-400 dark:hover:text-blue-300'
            "
            @click="emit('toggle', task)"
          >
            <Check class="h-4 w-4" />
          </button>

          <div class="min-w-0 flex-1">
            <h3 class="break-words text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {{ task.title }}
            </h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-if="task.dueDate"
                class="rounded-full border px-2 py-1 text-[11px] font-medium"
                :class="getTaskDueMeta(task.dueDate).className"
              >
                {{ getTaskDueMeta(task.dueDate).label }}
              </span>
              <span v-if="getRecurrenceLabel(task)" class="tag">
                {{ getRecurrenceLabel(task) }}
              </span>
              <span
                v-if="task.pomodoroEstimate"
                class="tag font-mono tabular-nums"
              >
                {{ task.pomodoroEstimate }} pomodoros
              </span>
            </div>
            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Created {{ formatUtcDate(task.createdAt) }}
              <span v-if="task.dueDate">
                · Due {{ formatUtcDate(task.dueDate) }}</span
              >
            </p>
            <p
              v-if="task.note"
              class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
            >
              {{ task.note }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="button-secondary px-3 py-2 text-xs"
            @click="emit('edit', task)"
          >
            <PencilLine class="mr-2 inline h-3.5 w-3.5" />
            Details
          </button>
          <button
            class="button-secondary px-3 py-2 text-xs"
            @click="emit('startTimer', task)"
          >
            <Timer class="mr-2 inline h-3.5 w-3.5" />
            Start Timer
          </button>
          <button
            class="button-secondary px-3 py-2 text-xs"
            @click="emit('move', task)"
          >
            <component
              :is="task.isDaily ? ArchiveX : RotateCcw"
              class="mr-2 inline h-3.5 w-3.5"
            />
            {{ task.isDaily ? 'Move to Vault' : 'Move to Daily' }}
          </button>
          <button
            class="button-danger px-3 py-2 text-xs"
            @click="emit('delete', task)"
          >
            <Trash2 class="mr-2 inline h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
