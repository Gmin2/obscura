import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Build web workers as ES modules so top-level await is supported
  worker: {
    format: 'es',
  },
})