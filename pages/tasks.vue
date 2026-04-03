<script setup lang="ts">
import type { Task } from '~/types/focuspocus'

definePageMeta({
  layout: 'default',
})

const taskStore = useTaskStore()
const tracker = useTracker()
const quickAdd = ref('')
const quickDaily = ref(true)
const quickInput = ref<HTMLInputElement | null>(null)
const selectedTask = ref<Task | null>(null)
const taskDetailsOpen = ref(false)

await taskStore.fetchTasks()

function focusQuickAdd() {
  quickInput.value?.focus()
}

async function submitQuickAdd() {
  const title = quickAdd.value.trim()

  if (!title) {
    return
  }

  await taskStore.addTask({
    title,
    isDaily: quickDaily.value,
  })

  quickAdd.value = ''
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
  selectedTask.value = task
  taskDetailsOpen.value = true
}

function closeTaskDetails() {
  taskDetailsOpen.value = false
  selectedTask.value = null
}

async function saveTaskDetails(payload: {
  taskId: string
  updates: import('~/types/focuspocus').TaskPatchPayload
}) {
  await taskStore.updateTask(payload.taskId, payload.updates)
  const freshTask =
    taskStore.tasks.find((task) => task.id === payload.taskId) ?? null
  selectedTask.value = freshTask
  closeTaskDetails()
}

async function startTaskTimer(task: Task) {
  tracker.startStopwatch(task.id)
  await navigateTo('/tracker')
}

function handleSlashFocus(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName)

  if (
    event.key === '/' &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !isTyping
  ) {
    event.preventDefault()
    focusQuickAdd()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleSlashFocus)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleSlashFocus)
})
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <p class="page-kicker">Tasks</p>
      <div
        class="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <h2 class="page-title mt-0">Daily Focus and The Vault</h2>
          <p class="page-copy">
            Capture work fast, split active priorities from backlog, and keep
            the queue readable.
          </p>
        </div>

        <div
          class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] xl:min-w-[38rem]"
        >
          <input
            ref="quickInput"
            v-model="quickAdd"
            data-quick-add
            class="field"
            type="text"
            placeholder="Add a task title"
            aria-label="Quick Add task"
            @keyup.enter="submitQuickAdd"
          />
          <select v-model="quickDaily" class="field" aria-label="Task stream">
            <option :value="true">Daily Focus</option>
            <option :value="false">The Vault</option>
          </select>
          <button class="button-primary" type="button" @click="submitQuickAdd">
            Add Task
          </button>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          class="button-secondary"
          @click="taskStore.showClearedCompleted"
        >
          Show Completed
        </button>
        <button class="button-secondary" @click="taskStore.clearCompleted">
          Clear Completed
        </button>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-2">
      <TaskListSection
        title="Daily Focus"
        :tasks="taskStore.dailyTasks"
        @toggle="toggleTask"
        @delete="deleteTask"
        @move="moveTask"
        @edit="openTaskDetails"
        @start-timer="startTaskTimer"
      />
      <TaskListSection
        title="The Vault"
        :tasks="taskStore.vaultTasks"
        @toggle="toggleTask"
        @delete="deleteTask"
        @move="moveTask"
        @edit="openTaskDetails"
        @start-timer="startTaskTimer"
      />
    </section>
  </div>

  <TaskDetailsDialog
    :open="taskDetailsOpen"
    :task="selectedTask"
    @close="closeTaskDetails"
    @save="saveTaskDetails"
  />
</template>
