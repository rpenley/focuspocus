import type { ThemePreference } from '~/types/focuspocus'

export const useProfileStore = defineStore(
  'profile',
  () => {
    const themePreference = ref<ThemePreference>('system')
    const systemPrefersDark = ref(false)
    let mediaQuery: MediaQueryList | null = null
    let removeListener: (() => void) | null = null

    const resolvedTheme = computed<'light' | 'dark'>(() => {
      if (themePreference.value === 'system') {
        return systemPrefersDark.value ? 'dark' : 'light'
      }

      return themePreference.value
    })

    function applyTheme(preference = themePreference.value) {
      if (!import.meta.client) {
        return
      }

      const nextTheme =
        preference === 'system'
          ? systemPrefersDark.value
            ? 'dark'
            : 'light'
          : preference

      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.style.colorScheme = nextTheme
    }

    function setThemePreference(preference: ThemePreference) {
      themePreference.value = preference
      applyTheme(preference)
    }

    function initTheme() {
      if (!import.meta.client) {
        return
      }

      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches

      removeListener?.()
      const handleChange = (event: MediaQueryListEvent) => {
        systemPrefersDark.value = event.matches

        if (themePreference.value === 'system') {
          applyTheme('system')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      removeListener = () =>
        mediaQuery?.removeEventListener('change', handleChange)

      applyTheme()
    }

    return {
      themePreference,
      resolvedTheme,
      setThemePreference,
      initTheme,
      applyTheme,
    }
  },
  {
    persist: {
      pick: ['themePreference'],
    },
  },
)
