import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import removeConsole from "vite-plugin-remove-console";

export default defineConfig(() => ({
  base: '', // relative paths
  server: {
    port: 3000,
  },
  plugins: [react(),removeConsole()],
}));
