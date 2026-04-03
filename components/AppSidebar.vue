<script setup lang="ts">
import {
  CalendarDays,
  CheckSquare2,
  NotebookPen,
  Sparkles,
  TimerReset,
  UserRound,
} from 'lucide-vue-next'

const route = useRoute()

const items = [
  { label: 'Today', to: '/today', icon: Sparkles },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare2 },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Tracker', to: '/tracker', icon: TimerReset },
  { label: 'Notes', to: '/notes', icon: NotebookPen },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

const isActive = (to: string) => route.path === to
</script>

<template>
  <aside
    class="panel flex h-full flex-col overflow-hidden bg-zinc-50/60 dark:bg-zinc-900/70"
  >
    <div class="border-b border-zinc-200 px-6 py-7 dark:border-zinc-800">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-950/20"
      >
        <Sparkles class="h-5 w-5" />
      </div>
      <p
        class="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-300"
      >
        FocusPocus
      </p>
      <h1
        class="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        Calm command center
      </h1>
      <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Tasks, schedule, notes, and focus sessions in one local workspace.
      </p>
    </div>

    <nav class="flex-1 p-4" aria-label="Primary navigation">
      <ul class="space-y-1.5">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-accent/10"
            :class="
              isActive(item.to)
                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700'
                : 'text-zinc-600 hover:bg-white hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            "
          >
            <component
              :is="item.icon"
              class="h-4 w-4"
              :class="
                isActive(item.to)
                  ? 'text-blue-600 dark:text-blue-300'
                  : 'text-zinc-400 dark:text-zinc-500'
              "
            />
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="isActive(item.to)"
              class="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300"
            />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="border-t border-zinc-200 px-5 py-5 dark:border-zinc-800">
      <div class="subtle-card p-4 text-xs text-zinc-500 dark:text-zinc-400">
        <p class="font-medium text-zinc-700 dark:text-zinc-200">
          Quick shortcut
        </p>
        <p class="mt-1 leading-5">
          Press
          <span
            class="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >/</span
          >
          to jump into quick add on the Tasks page.
        </p>
      </div>
    </div>
  </aside>
</template>
