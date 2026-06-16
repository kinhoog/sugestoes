import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// `base` é configurável para deploy em GitHub Pages como project site
// (ex.: VITE_BASE=/nome-do-repositorio/). Padrão "/" para domínio próprio/dev.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
