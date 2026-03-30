export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  imports: {
    dirs: ['types'],
  },
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === 'production',
  },
  runtimeConfig: {
    databasePath:
      process.env.NUXT_DATABASE_PATH || 'server/database/focuspocus.sqlite',
  },
  app: {
    head: {
      title: 'FocusPocus',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Local-first productivity toolbox.' },
      ],
    },
  },
  tailwindcss: {
    viewer: false,
  },
})
