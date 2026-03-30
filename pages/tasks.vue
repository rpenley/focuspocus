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
  <section class="panel">
    <header class="panel-header">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.25em] text-accent"
        >
          Tasks
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-white">
          Daily Focus and The Vault
        </h2>
      </div>

      <div class="flex flex-wrap gap-2">
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
    </header>

    <div class="panel-body space-y-6">
      <form
        class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
        @submit.prevent="submitQuickAdd"
      >
        <input
          ref="quickInput"
          v-model="quickAdd"
          data-quick-add
          class="field"
          type="text"
          placeholder="Quick Add"
          aria-label="Quick Add task"
        />
        <select
          v-model="quickDaily"
          class="field md:max-w-[12rem]"
          aria-label="Task stream"
        >
          <option :value="true">Daily Focus</option>
          <option :value="false">The Vault</option>
        </select>
        <button class="button-primary" type="submit">Add Task</button>
      </form>

      <div class="grid gap-4 xl:grid-cols-2">
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
      </div>
    </div>
  </section>

  <TaskDetailsDialog
    :open="taskDetailsOpen"
    :task="selectedTask"
    @close="closeTaskDetails"
    @save="saveTaskDetails"
  />
</template>
