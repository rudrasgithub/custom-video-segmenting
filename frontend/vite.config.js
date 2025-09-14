import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Ensure this matches the directory Vercel expects
  },
  define: {
    // Ensure environment variables are available at build time
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  // Make sure .env files are loaded correctly
  envDir: '.',
  envPrefix: 'VITE_'
})
