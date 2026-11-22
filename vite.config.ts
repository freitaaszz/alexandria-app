import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, type ProxyOptions } from 'vite'

/**
 * Proxy das capas da Google: "/capas/books/content?..." -> books.google.com.
 * Assim a capa vem do mesmo endereço do site e podemos ler as cores dela.
 * Ver src/features/book/coverPixels.ts.
 */
const proxy: Record<string, ProxyOptions> = {
  '/capas': {
    target: 'https://books.google.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/capas/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { proxy },
  preview: { proxy },
})
