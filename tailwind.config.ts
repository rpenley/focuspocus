import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
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
        accent: {
          DEFAULT: '#2563eb',
          soft: '#dbeafe',
        },
      },
      boxShadow: {
        panel:
          '0 1px 2px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.08)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
    },
  },
}
