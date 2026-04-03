<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { dateInputValueFromIso, isoFromDateInput } from '~/utils/dates'
import type { RecurrenceType, Task, TaskPatchPayload } from '~/types/focuspocus'

const props = defineProps<{
  open: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { taskId: string; updates: TaskPatchPayload }]
}>()

const title = ref('')
const note = ref('')
const dueDate = ref('')
const recurrenceType = ref<RecurrenceType>('none')
const recurrenceInterval = ref(1)
const pomodoroEstimate = ref<number | null>(null)

watch(
  () => props.task,
  (task) => {
    title.value = task?.title ?? ''
    note.value = task?.note ?? ''
    dueDate.value = dateInputValueFromIso(task?.dueDate ?? null)
    recurrenceType.value = task?.recurrenceType ?? 'none'
    recurrenceInterval.value = task?.recurrenceInterval ?? 1
    pomodoroEstimate.value = task?.pomodoroEstimate ?? null
  },
  { immediate: true },
)

function closeDialog() {
  emit('close')
}

function submit() {
  if (!props.task || !title.value.trim()) {
    return
  }

  emit('save', {
    taskId: props.task.id,
    updates: {
      title: title.value.trim(),
      note: note.value,
      dueDate: isoFromDateInput(dueDate.value),
      recurrenceType: recurrenceType.value,
      recurrenceInterval:
        recurrenceType.value === 'none' ? 1 : recurrenceInterval.value,
      pomodoroEstimate: pomodoroEstimate.value,
    },
  })
}
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="closeDialog">
    <div class="fixed inset-0 bg-zinc-950/30 backdrop-blur-sm" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="panel w-full max-w-2xl p-6">
        <DialogTitle class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Task Details
        </DialogTitle>

        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Title
              </span>
            <input
              v-model="title"
              class="field"
              type="text"
              placeholder="Task title"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Due Date
              </span>
              <input v-model="dueDate" class="field" type="date" />
            </label>

            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Pomodoro Estimate
              </span>
              <input
                v-model.number="pomodoroEstimate"
                class="field"
                min="1"
                type="number"
                placeholder="Optional"
              />
            </label>
          </div>

          <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem]">
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Recurrence
              </span>
              <select v-model="recurrenceType" class="field">
                <option value="none">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>

            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Interval
              </span>
              <input
                v-model.number="recurrenceInterval"
                :disabled="recurrenceType === 'none'"
                class="field disabled:cursor-not-allowed disabled:opacity-50"
                min="1"
                type="number"
              />
            </label>
          </div>

          <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Task Note
              </span>
            <textarea
              v-model="note"
              class="field min-h-40 resize-y"
              placeholder="Context, links, or next-step notes for this task"
            />
          </label>

          <div class="flex justify-end gap-2">
            <button class="button-secondary" type="button" @click="closeDialog">
              Cancel
            </button>
            <button class="button-primary" type="submit">Save</button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>
