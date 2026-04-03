<script setup lang="ts">
import { MonitorCog, MoonStar, SunMedium } from 'lucide-vue-next'
import type { ThemePreference } from '~/types/focuspocus'
import { useProfileStore } from '~/stores/profile'

definePageMeta({
  layout: 'default',
})

const profileStore = useProfileStore()

const themeOptions: Array<{
  value: ThemePreference
  label: string
  copy: string
  icon: typeof SunMedium
}> = [
  {
    value: 'system',
    label: 'System',
    copy: 'Match your device appearance automatically.',
    icon: MonitorCog,
  },
  {
    value: 'light',
    label: 'Light',
    copy: 'Keep the workspace bright and airy.',
    icon: SunMedium,
  },
  {
    value: 'dark',
    label: 'Dark',
    copy: 'Use a lower-glare canvas for evening focus.',
    icon: MoonStar,
  },
]
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <p class="page-kicker">Profile</p>
      <h2 class="page-title">Personal preferences</h2>
      <p class="page-copy">
        Appearance settings are stored locally in your profile so the app opens
        the way you left it.
      </p>
    </section>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section class="panel">
        <header class="panel-header">
          <div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Appearance
            </h3>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Choose how FocusPocus should look for this profile.
            </p>
          </div>
        </header>

        <div class="panel-body grid gap-3">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="flex items-start gap-4 rounded-3xl border p-5 text-left outline-none focus:ring-4 focus:ring-accent/10"
            :class="
              profileStore.themePreference === option.value
                ? 'border-blue-200 bg-blue-50 dark:border-blue-400/40 dark:bg-blue-500/10'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
            "
            @click="profileStore.setThemePreference(option.value)"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <component :is="option.icon" class="h-5 w-5" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {{ option.label }}
                </p>
                <span
                  v-if="profileStore.themePreference === option.value"
                  class="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-blue-400 dark:text-zinc-950"
                >
                  Active
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {{ option.copy }}
              </p>
            </div>
          </button>
        </div>
      </section>

      <aside class="panel">
        <header class="panel-header">
          <div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Current Profile
            </h3>
          </div>
        </header>

        <div class="panel-body space-y-4">
          <div class="stat-card">
            <p class="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Preference
            </p>
            <p class="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {{ profileStore.themePreference }}
            </p>
          </div>

          <div class="stat-card">
            <p class="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Applied Theme
            </p>
            <p class="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {{ profileStore.resolvedTheme }}
            </p>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              System mode follows your device preference in real time.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
