import type { Task, TaskPatchPayload, TaskPayload } from '~/types/focuspocus'

export const useTaskStore = defineStore(
  'tasks',
  () => {
    const tasks = ref<Task[]>([])
    const loaded = ref(false)
    const hiddenCompletedIds = ref<string[]>([])

    const visibleTasks = computed(() =>
      tasks.value.filter((task) => !hiddenCompletedIds.value.includes(task.id)),
    )

    const dailyTasks = computed(() =>
      visibleTasks.value.filter((task) => task.isDaily),
    )
    const vaultTasks = computed(() =>
      visibleTasks.value.filter((task) => !task.isDaily),
    )
    const taskOptions = computed(() =>
      tasks.value.filter((task) => !task.completed),
    )

    function upsertTask(nextTask: Task) {
      const index = tasks.value.findIndex((task) => task.id === nextTask.id)

      if (index >= 0) {
        tasks.value[index] = nextTask
        return
      }

      tasks.value.push(nextTask)
    }

    async function fetchTasks(force = false) {
      if (loaded.value && !force) {
        return
      }

      const response = await $fetch<Task[]>('/api/tasks')
      tasks.value = response
      loaded.value = true
    }

    async function addTask(payload: TaskPayload) {
      const task = await $fetch<Task>('/api/tasks', {
        method: 'POST',
        body: payload,
      })

      upsertTask(task)
      return task
    }

    async function updateTask(taskId: string, payload: TaskPatchPayload) {
      const task = await $fetch<Task>(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: payload,
      })

      upsertTask(task)
      return task
    }

    async function deleteTask(taskId: string) {
      await $fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      tasks.value = tasks.value.filter((task) => task.id !== taskId)
      hiddenCompletedIds.value = hiddenCompletedIds.value.filter(
        (id) => id !== taskId,
      )
    }

    function clearCompleted() {
      hiddenCompletedIds.value = tasks.value
        .filter((task) => task.completed)
        .map((task) => task.id)
    }

    function showClearedCompleted() {
      hiddenCompletedIds.value = []
    }

    return {
      tasks,
      loaded,
      dailyTasks,
      vaultTasks,
      taskOptions,
      hiddenCompletedIds,
      fetchTasks,
      addTask,
      updateTask,
      deleteTask,
      clearCompleted,
      showClearedCompleted,
    }
  },
  {
    persist: {
      pick: ['hiddenCompletedIds'],
    },
  },
)
