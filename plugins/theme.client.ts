import { useProfileStore } from '~/stores/profile'

export default defineNuxtPlugin(() => {
  const profileStore = useProfileStore()

  profileStore.initTheme()

  watch(
    () => profileStore.themePreference,
    () => {
      profileStore.applyTheme()
    },
    { immediate: true },
  )
})
