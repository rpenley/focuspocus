import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#050816',
        },
        zinc: {
          850: '#1b1f2a',
        },
        accent: {
          DEFAULT: '#eab308',
          soft: '#fef3c7',
        },
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
