import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from 'node:url';

const APP_URL = process.env.VITE_APP_URL || 'https://andrejanev96.github.io/firearms-timeline-test';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Replace custom placeholder in index.html without relying on Vite's
        // built-in %VITE_*% env replacement to avoid errors when the env var
        // is not defined. You can still override via VITE_APP_URL.
        return html.replace(/__APP_URL__/g, APP_URL);
      },
    },
  ],
  base: "/firearms-timeline-test/",
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },
});
