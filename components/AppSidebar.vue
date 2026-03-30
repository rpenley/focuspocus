<script setup lang="ts">
import {
  CalendarDays,
  CheckSquare2,
  NotebookPen,
  Sparkles,
  TimerReset,
} from 'lucide-vue-next'

const route = useRoute()

const items = [
  { label: 'Today', to: '/today', icon: Sparkles },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare2 },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Tracker', to: '/tracker', icon: TimerReset },
  { label: 'Notes', to: '/notes', icon: NotebookPen },
]

const isActive = (to: string) => route.path === to
</script>

<template>
  <aside class="panel flex h-full flex-col overflow-hidden">
    <div class="border-b border-white/10 px-5 py-6">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
        FocusPocus
      </p>
      <h1 class="mt-3 text-2xl font-semibold text-white">
        Zero-bloat productivity
      </h1>
      <p class="mt-2 text-sm text-slate-400">
        Tasks, dates, time, and notes with local ownership.
      </p>
    </div>

    <nav class="flex-1 p-4" aria-label="Primary navigation">
      <ul class="space-y-2">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/60"
            :class="
              isActive(item.to)
                ? 'bg-accent text-slate-950'
                : 'bg-white/5 text-slate-200'
            "
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
      <p>`/` focuses Quick Add on Tasks.</p>
    </div>
  </aside>
</template>
