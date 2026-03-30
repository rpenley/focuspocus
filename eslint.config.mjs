import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'

const nuxtGlobals = {
  $fetch: 'readonly',
  computed: 'readonly',
  defineNuxtConfig: 'readonly',
  defineNuxtPlugin: 'readonly',
  definePageMeta: 'readonly',
  getQuery: 'readonly',
  getRouterParam: 'readonly',
  navigateTo: 'readonly',
  onBeforeMount: 'readonly',
  onBeforeRouteLeave: 'readonly',
  onBeforeUnmount: 'readonly',
  onMounted: 'readonly',
  readBody: 'readonly',
  reactive: 'readonly',
  ref: 'readonly',
  useDb: 'readonly',
  useRoute: 'readonly',
  useRuntimeConfig: 'readonly',
  useState: 'readonly',
  useTaskStore: 'readonly',
  useTracker: 'readonly',
  watch: 'readonly',
}

export default tseslint.config(
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        window: 'readonly',
        document: 'readonly',
        ...nuxtGlobals,
      },
    },
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        ...nuxtGlobals,
      },
    },
  },
  {
    rules: {
      'no-undef': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
)
