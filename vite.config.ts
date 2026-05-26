import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        // Exclude server-side runtime files so Vite never reloads the page
        // when database_store.json is written after a chat response.
        ignored: [
          '**/database_store.json',
          '**/server.ts',
          '**/dist/**',
          '**/node_modules/**',
        ],
      },
    },
  };
});
