import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  // GitHub Pages: die App liegt unter https://knalleraffe.github.io/sonnenschein/
  base: process.env.GITHUB_PAGES === 'true' ? '/sonnenschein/' : '/',
})
