<script setup lang="ts">
import {
  CalendarDays,
  CheckSquare2,
  NotebookPen,
  Sparkles,
  TimerReset,
  UserRound,
} from 'lucide-vue-next'
import { useProfileStore } from '~/stores/profile'

const route = useRoute()
const profileStore = useProfileStore()

const pageMeta = {
  '/today': { label: 'Today', icon: Sparkles },
  '/tasks': { label: 'Tasks', icon: CheckSquare2 },
  '/calendar': { label: 'Calendar', icon: CalendarDays },
  '/tracker': { label: 'Tracker', icon: TimerReset },
  '/notes': { label: 'Notes', icon: NotebookPen },
  '/profile': { label: 'Profile', icon: UserRound },
} as const

const currentPage = computed(
  () => pageMeta[route.path as keyof typeof pageMeta] ?? pageMeta['/tasks'],
)
</script>

<template>
  <div class="min-h-screen p-4 md:p-6">
    <div
      class="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[296px_minmax(0,1fr)]"
    >
      <AppSidebar class="min-h-[18rem]" />

      <main class="grid min-h-full auto-rows-min gap-6">
        <NuxtRouteAnnouncer />
        <header class="glass-header flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
            >
              <component :is="currentPage.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p
                class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500"
              >
                FocusPocus
              </p>
              <h1
                class="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                {{ currentPage.label }}
              </h1>
            </div>
          </div>

          <div
            class="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 md:flex"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            {{ profileStore.resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode' }}
          </div>
        </header>

        <slot />
      </main>
    </div>
  </div>
</template>
