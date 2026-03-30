<script setup lang="ts">
import type { Task, TaskPatchPayload } from '~/types/focuspocus'
import { formatUtcDate } from '~/utils/dates'
import { getTaskDueState, getTaskSortValue } from '~/utils/tasks'

definePageMeta({
  layout: 'default',
})

const taskStore = useTaskStore()
const tracker = useTracker()
await taskStore.fetchTasks()

const quickToday = ref('')
const detailsTask = ref<Task | null>(null)
const detailsOpen = ref(false)

const activeTask = computed(
  () =>
    taskStore.tasks.find((task) => task.id === tracker.activeTaskId.value) ??
    null,
)

const incompleteTasks = computed(() =>
  taskStore.tasks.filter((task) => !task.completed),
)

const overdueTasks = computed(() =>
  incompleteTasks.value
    .filter((task) => getTaskDueState(task.dueDate) === 'overdue')
    .sort((left, right) =>
      getTaskSortValue(left).localeCompare(getTaskSortValue(right)),
    ),
)

const dueTodayTasks = computed(() =>
  incompleteTasks.value
    .filter((task) => getTaskDueState(task.dueDate) === 'today')
    .sort((left, right) =>
      getTaskSortValue(left).localeCompare(getTaskSortValue(right)),
    ),
)

const dailyFocusTasks = computed(() =>
  incompleteTasks.value
    .filter((task) => task.isDaily && !task.dueDate)
    .sort((left, right) => left.title.localeCompare(right.title)),
)

async function addTodayTask() {
  const title = quickToday.value.trim()

  if (!title) {
    return
  }

  await taskStore.addTask({
    title,
    isDaily: false,
    dueDate: `${new Date().toISOString().slice(0, 10)}T12:00:00.000Z`,
  })

  quickToday.value = ''
}

async function toggleTask(task: Task) {
  await taskStore.updateTask(task.id, { completed: !task.completed })
}

async function deleteTask(task: Task) {
  await taskStore.deleteTask(task.id)
}

async function moveTask(task: Task) {
  await taskStore.updateTask(task.id, { isDaily: !task.isDaily })
}

function openTaskDetails(task: Task) {
  detailsTask.value = task
  detailsOpen.value = true
}

function closeTaskDetails() {
  detailsOpen.value = false
  detailsTask.value = null
}

async function saveTaskDetails(payload: {
  taskId: string
  updates: TaskPatchPayload
}) {
  await taskStore.updateTask(payload.taskId, payload.updates)
  closeTaskDetails()
}

async function startTaskTimer(task: Task) {
  tracker.startStopwatch(task.id)
  await navigateTo('/tracker')
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
    <section class="panel">
      <header class="panel-header">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-accent"
          >
            Today
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-white">
            Planner for {{ formatUtcDate(new Date().toISOString()) }}
          </h2>
        </div>
      </header>

      <div class="panel-body space-y-6">
        <form
          class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
          @submit.prevent="addTodayTask"
        >
          <input
            v-model="quickToday"
            class="field"
            placeholder="Quick add for today"
            type="text"
          />
          <button class="button-primary" type="submit">Add for Today</button>
        </form>

        <div class="grid gap-4">
          <TaskListSection
            title="Overdue"
            :tasks="overdueTasks"
            @toggle="toggleTask"
            @delete="deleteTask"
            @move="moveTask"
            @edit="openTaskDetails"
            @start-timer="startTaskTimer"
          />
          <TaskListSection
            title="Due Today"
            :tasks="dueTodayTasks"
            @toggle="toggleTask"
            @delete="deleteTask"
            @move="moveTask"
            @edit="openTaskDetails"
            @start-timer="startTaskTimer"
          />
          <TaskListSection
            title="Daily Focus"
            :tasks="dailyFocusTasks"
            @toggle="toggleTask"
            @delete="deleteTask"
            @move="moveTask"
            @edit="openTaskDetails"
            @start-timer="startTaskTimer"
          />
        </div>
      </div>
    </section>

    <aside class="space-y-4">
      <section class="panel">
        <header class="panel-header">
          <div>
            <h2 class="text-lg font-semibold text-white">Active Timer</h2>
            <p class="mt-1 text-sm text-slate-400">
              Continue or inspect your current focus session.
            </p>
          </div>
        </header>
        <div class="panel-body">
          <p class="text-sm text-slate-400">
            {{ activeTask ? activeTask.title : 'No active task running.' }}
          </p>
          <button
            class="button-secondary mt-4 w-full"
            @click="navigateTo('/tracker')"
          >
            Open Tracker
          </button>
        </div>
      </section>
    </aside>
  </div>

  <TaskDetailsDialog
    :open="detailsOpen"
    :task="detailsTask"
    @close="closeTaskDetails"
    @save="saveTaskDetails"
  />
</template>
