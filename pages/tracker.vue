<script setup lang="ts">
import { formatDistanceStrict } from 'date-fns'
import {
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from '~/utils/notifications'
import {
  getPomodoroProgress,
  normalizePomodoroSettings as normalizePomodoro,
} from '~/utils/tracker'
import type {
  DailySummaryItem,
  PomodoroSettings,
  TimeLog,
  TrackerMode,
} from '~/types/focuspocus'

definePageMeta({
  layout: 'default',
})

const taskStore = useTaskStore()
await taskStore.fetchTasks()

const tracker = useTracker()
const selectedTaskId = ref(tracker.activeTaskId.value ?? '')
const selectedMode = ref<TrackerMode>(tracker.mode.value)
const summary = ref<DailySummaryItem[]>([])
const history = ref<TimeLog[]>([])
const statusMessage = ref(
  'Start a stopwatch anytime, or attach a task for logged focus.',
)
const isFinishingSession = ref(false)
const notificationsEnabled = ref(false)
const pomodoro = reactive<PomodoroSettings>({
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
})

const activeTask = computed(
  () =>
    taskStore.tasks.find((task) => task.id === tracker.activeTaskId.value) ??
    null,
)

const selectedTask = computed(
  () =>
    taskStore.tasks.find((task) => task.id === selectedTaskId.value) ?? null,
)

const activeTaskHistory = computed(() =>
  history.value.filter(
    (log) => log.taskId === (activeTask.value?.id ?? selectedTask.value?.id),
  ),
)

const completedFocusSessionsForTask = computed(
  () =>
    activeTaskHistory.value.filter(
      (log) => log.trackerMode === 'pomodoro' && log.trackerPhase === 'focus',
    ).length,
)

const estimateProgress = computed(() =>
  getPomodoroProgress(
    activeTask.value?.pomodoroEstimate ??
      selectedTask.value?.pomodoroEstimate ??
      null,
    completedFocusSessionsForTask.value,
  ),
)

const displaySeconds = computed(
  () => tracker.remainingSeconds.value ?? tracker.elapsedSeconds.value,
)

const isSessionRunning = computed(() => tracker.isRunning.value)
const isTrackerPaused = computed(() => tracker.isPaused.value)

const displayLabel = computed(() =>
  tracker.isCountdown.value ? 'Remaining' : 'Elapsed',
)

const timerLabel = computed(() => {
  const hours = Math.floor(displaySeconds.value / 3600)
  const minutes = Math.floor((displaySeconds.value % 3600) / 60)
  const seconds = displaySeconds.value % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
})

const elapsedLabel = computed(() =>
  formatDistanceStrict(0, tracker.elapsedSeconds.value * 1000, {
    unit: 'second',
  }),
)

const cycleLabel = computed(() =>
  tracker.completedFocusSessions.value === 0
    ? 'No focus sessions finished yet.'
    : `${tracker.completedFocusSessions.value} focus session${tracker.completedFocusSessions.value === 1 ? '' : 's'} completed.`,
)

const nextBreakLabel = computed(() =>
  tracker.completedFocusSessions.value > 0
    ? tracker.completedFocusSessions.value % pomodoro.sessionsUntilLongBreak ===
      0
      ? `Next break is long (${pomodoro.longBreakMinutes} min).`
      : `Next break is short (${pomodoro.shortBreakMinutes} min).`
    : `Long break triggers every ${pomodoro.sessionsUntilLongBreak} focus sessions.`,
)

const canStartStopwatch = computed(
  () => !isSessionRunning.value && !isTrackerPaused.value,
)
const isStopwatchSessionActive = computed(
  () =>
    selectedMode.value === 'stopwatch' &&
    (isSessionRunning.value || isTrackerPaused.value),
)

const canStartFocus = computed(
  () =>
    Boolean(selectedTaskId.value) &&
    !isSessionRunning.value &&
    !isTrackerPaused.value,
)

const canStartBreak = computed(
  () =>
    tracker.completedFocusSessions.value > 0 &&
    !isSessionRunning.value &&
    !isTrackerPaused.value,
)

const progressPercent = computed(() =>
  Math.max(tracker.progress.value * 100, isSessionRunning.value ? 4 : 0),
)

const canResetCycle = computed(
  () =>
    !isSessionRunning.value &&
    !isTrackerPaused.value &&
    tracker.completedFocusSessions.value > 0,
)

async function loadSummary() {
  summary.value = await $fetch<DailySummaryItem[]>('/api/logs', {
    query: { summary: 'today' },
  })
}

async function loadHistory() {
  history.value = await $fetch<TimeLog[]>('/api/logs')
}

function normalizePomodoroSettings() {
  Object.assign(pomodoro, normalizePomodoro(pomodoro))
}

function maybeNotify(message: string) {
  if (!notificationsEnabled.value) {
    return
  }

  sendBrowserNotification('FocusPocus', message)
}

async function enableNotifications() {
  const permission = await requestBrowserNotificationPermission()
  notificationsEnabled.value = permission === 'granted'
}

async function persistSession() {
  const session = tracker.finishSession()

  if (!session) {
    return
  }

  if (
    session.taskId &&
    session.phase === 'focus' &&
    session.elapsedSeconds > 0
  ) {
    await $fetch('/api/logs', {
      method: 'POST',
      body: {
        taskId: session.taskId,
        startTime: session.startTime,
        endTime: new Date().toISOString(),
        durationSeconds: session.elapsedSeconds,
        trackerMode: session.mode,
        trackerPhase: session.phase,
      },
    })

    await Promise.all([loadSummary(), loadHistory()])
  }

  if (session.mode === 'pomodoro' && session.phase === 'focus') {
    statusMessage.value = 'Focus session complete. Start your break when ready.'
    maybeNotify(statusMessage.value)
    return
  }

  if (session.mode === 'pomodoro') {
    statusMessage.value =
      'Break finished. Start another focus block when you are ready.'
    maybeNotify(statusMessage.value)
    return
  }

  statusMessage.value = 'Session saved.'
}

async function finishActiveSession() {
  if (isFinishingSession.value) {
    return
  }

  isFinishingSession.value = true

  try {
    await persistSession()
  } finally {
    isFinishingSession.value = false
  }
}

function startStopwatch() {
  selectedMode.value = 'stopwatch'
  tracker.startStopwatch(selectedTaskId.value || null)
  statusMessage.value = selectedTask.value
    ? 'Stopwatch running with a task attached.'
    : 'Free stopwatch running.'
}

async function toggleStopwatch() {
  if (isStopwatchSessionActive.value) {
    await finishActiveSession()
    return
  }

  startStopwatch()
}

function startPomodoroFocus() {
  if (!selectedTaskId.value) {
    return
  }

  normalizePomodoroSettings()
  selectedMode.value = 'pomodoro'
  tracker.startPomodoroFocus(selectedTaskId.value, pomodoro)
  statusMessage.value = `Focus session started for ${pomodoro.focusMinutes} minutes.`
}

function startPomodoroBreak() {
  normalizePomodoroSettings()
  selectedMode.value = 'pomodoro'
  tracker.startPomodoroBreak(pomodoro)
  statusMessage.value = 'Break session started.'
}

function pauseTimer() {
  tracker.pause()
  statusMessage.value = 'Timer paused.'
}

function resumeTimer() {
  tracker.resume()
  statusMessage.value = 'Timer resumed.'
}

watch(
  () => tracker.mode.value,
  (mode) => {
    selectedMode.value = mode
  },
)

watch(
  () => tracker.activeTaskId.value,
  (taskId) => {
    if (taskId) {
      selectedTaskId.value = taskId
    }
  },
  { immediate: true },
)

watch(
  () => tracker.isComplete.value,
  async (isComplete) => {
    if (!isComplete) {
      return
    }

    await finishActiveSession()
  },
)

if (import.meta.client && 'Notification' in globalThis) {
  notificationsEnabled.value = Notification.permission === 'granted'
}

await Promise.all([loadSummary(), loadHistory()])
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <p class="page-kicker">Tracker</p>
      <h2 class="page-title">Task timer and Pomodoro sessions</h2>
      <p class="page-copy">
        Run freeform timing or structured focus cycles, then review what got
        logged today.
      </p>
    </section>

    <div
      class="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]"
    >
      <section class="panel">
        <header class="panel-header">
          <div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Focus Controls
            </h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Attach a task, choose a mode, and keep the session state visible.
            </p>
          </div>
        </header>

        <div class="panel-body space-y-6">
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Task
              </span>
              <select
                v-model="selectedTaskId"
                :disabled="isSessionRunning || isTrackerPaused"
                class="field"
                aria-label="Select a task"
              >
                <option disabled value="">Select a task</option>
                <option
                  v-for="task in taskStore.taskOptions"
                  :key="task.id"
                  :value="task.id"
                >
                  {{ task.title }}
                </option>
              </select>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                {{
                  isSessionRunning || isTrackerPaused
                    ? 'Stop the current session before changing the attached task.'
                    : 'Optional for stopwatch. Required for Pomodoro and saved focus logs.'
                }}
              </p>
            </label>

            <div class="grid gap-2 sm:grid-cols-2">
              <button
                class="button-secondary"
                :class="
                  selectedMode === 'stopwatch'
                    ? '!border-blue-200 !bg-blue-50 !text-blue-700 dark:!border-blue-400/40 dark:!bg-blue-500/10 dark:!text-blue-200'
                    : ''
                "
                @click="selectedMode = 'stopwatch'"
              >
                Stopwatch
              </button>
              <button
                class="button-secondary"
                :class="
                  selectedMode === 'pomodoro'
                    ? '!border-blue-200 !bg-blue-50 !text-blue-700 dark:!border-blue-400/40 dark:!bg-blue-500/10 dark:!text-blue-200'
                    : ''
                "
                @click="selectedMode = 'pomodoro'"
              >
                Pomodoro
              </button>
            </div>
          </div>

          <div class="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-sm uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                  {{ tracker.sessionLabel }}
                </p>
                <h3
                  class="mt-4 font-mono text-5xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-50"
                >
                  {{ timerLabel }}
                </h3>
                <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {{ displayLabel }} · {{ elapsedLabel }}
                </p>
              </div>

              <div
                class="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
              >
                <p class="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  Active Task
                </p>
                <p class="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {{ activeTask ? activeTask.title : 'No task attached' }}
                </p>
              </div>
            </div>

            <div class="mt-6 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                class="h-full rounded-full bg-blue-600 transition-[width] dark:bg-blue-400"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>

            <p class="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              {{ statusMessage }}
            </p>
          </div>

          <div
            v-if="selectedMode === 'pomodoro'"
            class="grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 md:grid-cols-2 xl:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Focus
              </span>
              <input
                v-model.number="pomodoro.focusMinutes"
                class="field"
                min="1"
                type="number"
              />
            </label>
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Short Break
              </span>
              <input
                v-model.number="pomodoro.shortBreakMinutes"
                class="field"
                min="1"
                type="number"
              />
            </label>
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Long Break
              </span>
              <input
                v-model.number="pomodoro.longBreakMinutes"
                class="field"
                min="1"
                type="number"
              />
            </label>
            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400"
              >
                Long Break Every
              </span>
              <input
                v-model.number="pomodoro.sessionsUntilLongBreak"
                class="field"
                min="2"
                type="number"
              />
            </label>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="selectedMode === 'stopwatch'"
              class="button-primary"
              :disabled="!canStartStopwatch && !isStopwatchSessionActive"
              @click="toggleStopwatch"
            >
              {{
                isStopwatchSessionActive ? 'Stop Stopwatch' : 'Start Stopwatch'
              }}
            </button>

            <button
              v-else
              class="button-primary"
              :disabled="!canStartFocus"
              @click="startPomodoroFocus"
            >
              Start Focus
            </button>

            <button
              v-if="selectedMode === 'pomodoro'"
              class="button-secondary"
              :disabled="!canStartBreak"
              @click="startPomodoroBreak"
            >
              Start Break
            </button>

            <button
              v-if="isSessionRunning && !isTrackerPaused"
              class="button-secondary"
              @click="pauseTimer"
            >
              Pause
            </button>

            <button
              v-if="isTrackerPaused"
              class="button-secondary"
              @click="resumeTimer"
            >
              Resume
            </button>

            <button
              v-if="selectedMode !== 'stopwatch'"
              class="button-secondary"
              :disabled="!isSessionRunning && !isTrackerPaused"
              @click="finishActiveSession"
            >
              Stop
            </button>

            <button
              v-if="selectedMode === 'pomodoro'"
              class="button-secondary"
              :disabled="!canResetCycle"
              @click="tracker.resetPomodoroProgress()"
            >
              Reset Cycle
            </button>

            <button
              v-if="!notificationsEnabled"
              class="button-secondary"
              @click="enableNotifications"
            >
              Enable Alerts
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <article class="stat-card">
              <p class="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Cycle
              </p>
              <p class="mt-2 text-sm text-zinc-900 dark:text-zinc-50">
                {{ cycleLabel }}
              </p>
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {{ nextBreakLabel }}
              </p>
            </article>

            <article class="stat-card">
              <p class="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Estimate
              </p>
              <p class="mt-2 text-sm text-zinc-900 dark:text-zinc-50">
                <template v-if="estimateProgress">
                  {{ estimateProgress.completed }} /
                  {{ estimateProgress.estimate }}
                  focus sessions completed
                </template>
                <template v-else>
                  Add a Pomodoro estimate on a task to compare planned vs actual
                  focus.
                </template>
              </p>
              <p
                v-if="estimateProgress"
                class="mt-2 text-sm text-zinc-500 dark:text-zinc-400"
              >
                {{ estimateProgress.remaining }} sessions remaining against
                estimate.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <section class="panel">
          <header class="panel-header">
            <div>
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Daily Summary
              </h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Total focused time logged today per task.
              </p>
            </div>
          </header>

          <div class="panel-body space-y-3">
            <p v-if="!summary.length" class="empty-state">
              No time logged today.
            </p>

            <article
              v-for="item in summary"
              :key="item.taskId"
              class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {{ item.taskTitle }}
                </h3>
                <span class="font-mono text-sm text-blue-600 dark:text-blue-300">
                  {{
                    formatDistanceStrict(0, item.totalSeconds * 1000, {
                      unit: 'second',
                    })
                  }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Session History
              </h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Most recent logged work sessions.
              </p>
            </div>
          </header>

          <div class="panel-body space-y-3">
            <p v-if="!history.length" class="empty-state">
              No tracked sessions yet.
            </p>

            <article
              v-for="item in history.slice(0, 8)"
              :key="item.id"
              class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {{
                    taskStore.tasks.find((task) => task.id === item.taskId)
                      ?.title ?? 'Unknown task'
                  }}
                </h3>
                <span class="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {{ item.trackerMode ?? 'stopwatch' }}
                </span>
              </div>
              <p class="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                {{
                  formatDistanceStrict(0, item.durationSeconds * 1000, {
                    unit: 'second',
                  })
                }}
              </p>
            </article>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>
