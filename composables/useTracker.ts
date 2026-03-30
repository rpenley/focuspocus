import {
  DEFAULT_POMODORO_SETTINGS,
  calculateElapsedSeconds,
  getNextPomodoroBreakPhase,
  shouldCountCompletedFocusSession,
} from '~/utils/tracker'
import type {
  PomodoroSettings,
  TrackerMode,
  TrackerPhase,
  TrackerSessionSnapshot,
} from '~/types/focuspocus'

interface SessionStartOptions {
  taskId: string | null
  mode: TrackerMode
  phase: TrackerPhase
  targetDurationSeconds?: number | null
}

export function useTracker() {
  const activeTaskId = useState<string | null>(
    'tracker-active-task-id',
    () => null,
  )
  const sessionStartedAt = useState<string | null>(
    'tracker-session-started-at',
    () => null,
  )
  const resumedAt = useState<string | null>('tracker-resumed-at', () => null)
  const accumulatedSeconds = useState('tracker-accumulated-seconds', () => 0)
  const elapsedSeconds = useState('tracker-elapsed-seconds', () => 0)
  const mode = useState<TrackerMode>('tracker-mode', () => 'stopwatch')
  const phase = useState<TrackerPhase>('tracker-phase', () => 'focus')
  const targetDurationSeconds = useState<number | null>(
    'tracker-target-duration',
    () => null,
  )
  const completedFocusSessions = useState(
    'tracker-completed-focus-sessions',
    () => 0,
  )

  let interval: ReturnType<typeof setInterval> | null = null

  const isRunning = computed(() => Boolean(resumedAt.value))
  const isPaused = computed(
    () => Boolean(sessionStartedAt.value) && !resumedAt.value,
  )
  const isCountdown = computed(() => targetDurationSeconds.value !== null)
  const remainingSeconds = computed(() => {
    if (targetDurationSeconds.value === null) {
      return null
    }

    return Math.max(targetDurationSeconds.value - elapsedSeconds.value, 0)
  })
  const isComplete = computed(
    () =>
      targetDurationSeconds.value !== null &&
      elapsedSeconds.value >= targetDurationSeconds.value,
  )
  const sessionLabel = computed(() => {
    if (mode.value === 'stopwatch') {
      return isPaused.value ? 'Stopwatch Paused' : 'Stopwatch'
    }

    switch (phase.value) {
      case 'short-break':
        return isPaused.value ? 'Short Break Paused' : 'Short Break'
      case 'long-break':
        return isPaused.value ? 'Long Break Paused' : 'Long Break'
      default:
        return isPaused.value ? 'Focus Session Paused' : 'Focus Session'
    }
  })
  const progress = computed(() => {
    if (
      targetDurationSeconds.value === null ||
      targetDurationSeconds.value <= 0
    ) {
      return 0
    }

    return Math.min(elapsedSeconds.value / targetDurationSeconds.value, 1)
  })

  function stopInterval() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  function syncElapsed() {
    elapsedSeconds.value = calculateElapsedSeconds(
      accumulatedSeconds.value,
      resumedAt.value,
    )

    if (isComplete.value) {
      stopInterval()
    }
  }

  function beginSession(options: SessionStartOptions) {
    activeTaskId.value = options.taskId
    mode.value = options.mode
    phase.value = options.phase
    targetDurationSeconds.value = options.targetDurationSeconds ?? null
    sessionStartedAt.value = new Date().toISOString()
    resumedAt.value = sessionStartedAt.value
    accumulatedSeconds.value = 0
    syncElapsed()
    stopInterval()
    interval = setInterval(syncElapsed, 1000)
  }

  function startStopwatch(taskId: string | null = null) {
    beginSession({
      taskId,
      mode: 'stopwatch',
      phase: 'focus',
    })
  }

  function startPomodoroFocus(
    taskId: string,
    settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
  ) {
    beginSession({
      taskId,
      mode: 'pomodoro',
      phase: 'focus',
      targetDurationSeconds: settings.focusMinutes * 60,
    })
  }

  function startPomodoroBreak(
    settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS,
  ) {
    const nextCompletedCount = Math.max(completedFocusSessions.value, 1)
    const nextPhase = getNextPomodoroBreakPhase(nextCompletedCount, settings)
    const minutes =
      nextPhase === 'long-break'
        ? settings.longBreakMinutes
        : settings.shortBreakMinutes

    beginSession({
      taskId: null,
      mode: 'pomodoro',
      phase: nextPhase,
      targetDurationSeconds: minutes * 60,
    })
  }

  function pause() {
    if (!resumedAt.value) {
      return
    }

    accumulatedSeconds.value = calculateElapsedSeconds(
      accumulatedSeconds.value,
      resumedAt.value,
    )
    resumedAt.value = null
    syncElapsed()
    stopInterval()
  }

  function resume() {
    if (!sessionStartedAt.value || resumedAt.value) {
      return
    }

    resumedAt.value = new Date().toISOString()
    syncElapsed()
    stopInterval()
    interval = setInterval(syncElapsed, 1000)
  }

  function getActiveSession(): TrackerSessionSnapshot | null {
    if (!sessionStartedAt.value) {
      return null
    }

    return {
      taskId: activeTaskId.value,
      mode: mode.value,
      phase: phase.value,
      startTime: sessionStartedAt.value,
      elapsedSeconds: elapsedSeconds.value,
      targetDurationSeconds: targetDurationSeconds.value,
    }
  }

  function finishSession() {
    const session = getActiveSession()

    if (shouldCountCompletedFocusSession(session)) {
      completedFocusSessions.value += 1
    }

    stopInterval()
    activeTaskId.value = null
    sessionStartedAt.value = null
    resumedAt.value = null
    accumulatedSeconds.value = 0
    elapsedSeconds.value = 0
    targetDurationSeconds.value = null
    phase.value = 'focus'

    return session
  }

  function resetPomodoroProgress() {
    completedFocusSessions.value = 0
  }

  onMounted(() => {
    if (sessionStartedAt.value) {
      syncElapsed()

      if (resumedAt.value && !isComplete.value) {
        interval = setInterval(syncElapsed, 1000)
      }
    }
  })

  onBeforeUnmount(() => {
    stopInterval()
  })

  return {
    activeTaskId,
    sessionStartedAt,
    resumedAt,
    elapsedSeconds,
    mode,
    phase,
    targetDurationSeconds,
    completedFocusSessions,
    isRunning,
    isPaused,
    isCountdown,
    remainingSeconds,
    isComplete,
    sessionLabel,
    progress,
    startStopwatch,
    startPomodoroFocus,
    startPomodoroBreak,
    pause,
    resume,
    getActiveSession,
    finishSession,
    resetPomodoroProgress,
  }
}
