<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { getTaskDueMeta } from '~/utils/tasks'

definePageMeta({
  layout: 'default',
})

const taskStore = useTaskStore()
await taskStore.fetchTasks()

const currentMonth = ref(startOfMonth(new Date()))
const modalOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const newTitle = ref('')
const newStream = ref<'daily' | 'vault'>('daily')
const todayKey = ref<string | null>(null)

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value)
  const monthEnd = endOfMonth(currentMonth.value)

  return eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  })
})

const tasksByDate = computed(() => {
  const map = new Map<string, typeof taskStore.tasks>()

  for (const task of taskStore.tasks) {
    if (!task.dueDate) {
      continue
    }

    const key = format(new Date(task.dueDate), 'yyyy-MM-dd')
    const group = map.get(key) ?? []
    group.push(task)
    map.set(key, group)
  }

  return map
})

const selectedDateTasks = computed(() => {
  if (!selectedDate.value) {
    return []
  }

  return tasksByDate.value.get(format(selectedDate.value, 'yyyy-MM-dd')) ?? []
})

function getTasksForDay(day: Date) {
  return tasksByDate.value.get(format(day, 'yyyy-MM-dd')) ?? []
}

function isCurrentDay(day: Date) {
  return todayKey.value === format(day, 'yyyy-MM-dd')
}

function openModal(day: Date) {
  selectedDate.value = day
  newTitle.value = ''
  newStream.value = 'daily'
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function goToPreviousMonth() {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

function goToNextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

function goToToday() {
  currentMonth.value = startOfMonth(new Date())
}

async function submitTask() {
  if (!selectedDate.value || !newTitle.value.trim()) {
    return
  }

  await taskStore.addTask({
    title: newTitle.value.trim(),
    isDaily: newStream.value === 'daily',
    dueDate: selectedDate.value.toISOString(),
  })

  closeModal()
}

onMounted(() => {
  todayKey.value = format(new Date(), 'yyyy-MM-dd')
})
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <p class="page-kicker">Calendar</p>
      <div
        class="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <h2 class="page-title mt-0">
            {{ format(currentMonth, 'MMMM yyyy') }}
          </h2>
          <p class="page-copy">
            Schedule tasks directly on the month grid and scan upcoming load
            without noisy table chrome.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="button-secondary" @click="goToPreviousMonth">
            Prev
          </button>
          <button class="button-secondary" @click="goToToday">Today</button>
          <button class="button-secondary" @click="goToNextMonth">Next</button>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-body">
        <div
          class="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500"
        >
          <span
            v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
            :key="day"
            >{{ day }}</span
          >
        </div>

        <div class="mt-3 grid grid-cols-7 gap-2">
          <button
            v-for="day in calendarDays"
            :key="day.toISOString()"
            class="min-h-32 rounded-3xl border p-3 text-left outline-none transition hover:border-zinc-300 hover:shadow-sm focus:ring-4 focus:ring-accent/10"
            :class="[
              isSameMonth(day, currentMonth)
                ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                : 'border-zinc-100 bg-zinc-50 text-zinc-400 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-500',
              isCurrentDay(day) ? 'ring-2 ring-blue-200 dark:ring-blue-400/50' : '',
            ]"
            @click="openModal(day)"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <span
                  class="text-sm font-medium"
                  :class="
                    isCurrentDay(day)
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-zinc-900 dark:text-zinc-100'
                  "
                >
                  {{ format(day, 'd') }}
                </span>
                <p
                  class="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
                >
                  {{ format(day, 'EEE') }}
                </p>
              </div>

              <span
                v-if="getTasksForDay(day).length"
                class="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {{ getTasksForDay(day).length }}
              </span>
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="task in getTasksForDay(day).slice(0, 3)"
                :key="task.id"
                class="rounded-2xl border px-2 py-1 text-xs"
                :class="
                  task.isDaily
                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-200'
                    : `${getTaskDueMeta(task.dueDate).className} bg-white`
                "
              >
                {{ task.title }}
              </div>

              <p
                v-if="getTasksForDay(day).length > 3"
                class="text-xs text-zinc-500 dark:text-zinc-400"
              >
                +{{ getTasksForDay(day).length - 3 }} more
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>

    <Dialog :open="modalOpen" class="relative z-50" @close="closeModal">
      <div class="fixed inset-0 bg-zinc-950/30 backdrop-blur-sm" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="panel w-full max-w-lg p-6">
          <DialogTitle class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {{
              selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : 'Add task'
            }}
          </DialogTitle>

          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Capture what needs to happen on this date and choose where it
            belongs.
          </p>

          <form class="mt-5 space-y-4" @submit.prevent="submitTask">
            <input
              v-model="newTitle"
              class="field"
              type="text"
              placeholder="Task title"
            />

            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
                >Stream</span
              >
              <select v-model="newStream" class="field">
                <option value="daily">Daily Focus</option>
                <option value="vault">The Vault</option>
              </select>
            </label>

            <div
              v-if="selectedDateTasks.length"
              class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Already Scheduled
              </p>
              <div class="mt-3 space-y-2">
                <div
                v-for="task in selectedDateTasks"
                :key="task.id"
                class="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                  <span class="text-zinc-900 dark:text-zinc-50">{{ task.title }}</span>
                  <span
                    class="text-xs uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
                  >
                    {{ task.isDaily ? 'Daily' : 'Vault' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button
                class="button-secondary"
                type="button"
                @click="closeModal"
              >
                Cancel
              </button>
              <button class="button-primary" type="submit">Add Task</button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template>
