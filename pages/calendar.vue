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
  <section class="panel">
    <header class="panel-header">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.25em] text-accent"
        >
          Calendar
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white">
          {{ format(currentMonth, 'MMMM yyyy') }}
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Schedule tasks directly on the month grid.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="button-secondary" @click="goToPreviousMonth">
          Prev
        </button>
        <button class="button-secondary" @click="goToToday">Today</button>
        <button class="button-secondary" @click="goToNextMonth">Next</button>
      </div>
    </header>

    <div class="panel-body">
      <div
        class="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
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
          class="min-h-32 rounded-3xl border p-3 text-left outline-none focus:ring-2 focus:ring-accent/60"
          :class="[
            isSameMonth(day, currentMonth)
              ? 'border-white/10 bg-white/5'
              : 'border-white/5 bg-white/[0.02] text-slate-600',
            isCurrentDay(day) ? 'ring-1 ring-accent' : '',
          ]"
          @click="openModal(day)"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <span
                class="text-sm font-medium"
                :class="isCurrentDay(day) ? 'text-accent' : 'text-slate-200'"
              >
                {{ format(day, 'd') }}
              </span>
              <p
                class="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500"
              >
                {{ format(day, 'EEE') }}
              </p>
            </div>

            <span
              v-if="getTasksForDay(day).length"
              class="rounded-full border border-white/10 bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-slate-300"
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
                  ? 'border-accent/20 bg-accent/15 text-accent'
                  : `${getTaskDueMeta(task.dueDate).className} bg-slate-950/80`
              "
            >
              {{ task.title }}
            </div>

            <p
              v-if="getTasksForDay(day).length > 3"
              class="text-xs text-slate-500"
            >
              +{{ getTasksForDay(day).length - 3 }} more
            </p>
          </div>
        </button>
      </div>
    </div>

    <Dialog :open="modalOpen" class="relative z-50" @close="closeModal">
      <div class="fixed inset-0 bg-slate-950/80" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="panel w-full max-w-lg p-6">
          <DialogTitle class="text-lg font-semibold text-white">
            {{
              selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : 'Add task'
            }}
          </DialogTitle>

          <p class="mt-2 text-sm text-slate-400">
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
                class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                >Stream</span
              >
              <select v-model="newStream" class="field">
                <option value="daily">Daily Focus</option>
                <option value="vault">The Vault</option>
              </select>
            </label>

            <div
              v-if="selectedDateTasks.length"
              class="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
            >
              <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                Already Scheduled
              </p>
              <div class="mt-3 space-y-2">
                <div
                  v-for="task in selectedDateTasks"
                  :key="task.id"
                  class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-2 text-sm"
                >
                  <span class="text-white">{{ task.title }}</span>
                  <span
                    class="text-xs uppercase tracking-[0.15em] text-slate-500"
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
  </section>
</template>
