import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Horizon OOH — Unified Vite config
 *
 * Source:  resources/react/   (React 18 + TypeScript)
 * Output:  dist/               (served by Skywork preview + Laravel)
 *
 * Dev:  npm run dev      → Vite dev server (hot reload)
 * Prod: npm run build    → builds to dist/ for serving
 */
export default defineConfig(({ mode }) => ({
  root: '.',
  publicDir: 'resources/public-static',
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/react'),
      // Route react-router-dom through our Skywork-messaging proxy
      'react-router-dom': path.resolve(__dirname, './resources/react/lib/react-router-dom-proxy.tsx'),
      'react-router-dom-original': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  server: {
    host: '::',
    port: 8080,
  },
  define: {
    __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
      mode === 'production'
        ? process.env.VITE_ENABLE_ROUTE_MESSAGING === 'true'
        : process.env.VITE_ENABLE_ROUTE_MESSAGING !== 'false'
    ),
  },
}));