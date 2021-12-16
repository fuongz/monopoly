import { resolve } from 'path'
import { defineConfig } from 'vite'

// Plugins
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    Vue(),
    Pages({
      pagesDir: 'src/pages',
      extensions: ['vue'],
    }),
    WindiCSS(),
  ],
})
