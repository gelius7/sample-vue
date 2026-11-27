import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  { files: ['src/**/*.{js,mjs,vue}'], languageOptions: { globals: globals.browser } },
  { files: ['tests/**/*.js'], languageOptions: { globals: globals.node, sourceType: 'commonjs' } },
)
