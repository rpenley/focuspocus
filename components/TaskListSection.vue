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
        <h2 class="text-lg font-semibold text-white">{{ props.title }}</h2>
        <p class="mt-1 text-sm text-slate-400">
          {{ props.tasks.length }} visible
        </p>
      </div>
    </header>

    <div class="panel-body space-y-3">
      <p
        v-if="!props.tasks.length"
        class="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500"
      >
        Nothing here yet.
      </p>

      <article
        v-for="task in props.tasks"
        :key="task.id"
        class="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
        :class="task.completed ? 'opacity-50' : ''"
      >
        <div class="flex items-start gap-3">
          <button
            :aria-pressed="task.completed"
            class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 outline-none focus:ring-2 focus:ring-accent/60"
            :class="
              task.completed
                ? 'bg-accent text-slate-950'
                : 'bg-transparent text-slate-400'
            "
            @click="emit('toggle', task)"
          >
            <Check class="h-4 w-4" />
          </button>

          <div class="min-w-0 flex-1">
            <h3 class="break-words text-sm font-medium text-white">
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
              <span
                v-if="getRecurrenceLabel(task)"
                class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
              >
                {{ getRecurrenceLabel(task) }}
              </span>
              <span
                v-if="task.pomodoroEstimate"
                class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
              >
                {{ task.pomodoroEstimate }} pomodoros
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Created {{ formatUtcDate(task.createdAt) }}
              <span v-if="task.dueDate">
                · Due {{ formatUtcDate(task.dueDate) }}</span
              >
            </p>
            <p v-if="task.note" class="mt-2 text-sm text-slate-400">
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
            class="button-secondary px-3 py-2 text-xs"
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
