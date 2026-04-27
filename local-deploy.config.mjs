import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, 'src');

export default defineConfig({
  root: SRC,
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': SRC,
    },
  },
  define: {
    __ROUTE_MESSAGING_ENABLED__: JSON.stringify(true),
    __APP_BUILD__: JSON.stringify('20260427-C'),
  },
  build: {
    outDir: path.resolve(__dirname, 'public'),
    emptyOutDir: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: path.resolve(SRC, 'index.html'),
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack') || id.includes('node_modules/axios')) return 'data-layer';
          if (id.includes('/src/admin/')) return 'admin';
          if (id.includes('node_modules/zod') || id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) return 'utils';
        },
      },
    },
  },
  server: {
    host: '::',
    port: 8080,
  },
});
