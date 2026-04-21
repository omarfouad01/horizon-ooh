import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Unified Vite config for the Horizon OOH full-stack project.
 *
 * - React source lives in resources/react/
 * - Built assets go to public/app/  (so Laravel's public/index.php is untouched)
 * - index.html is at the project root and references /app/ assets at runtime
 *
 * Server deployment (Apache/Nginx):
 *   Document root  → public/          (serves Laravel's index.php for /api/*)
 *   SPA catch-all  → public/app/spa.html  (served by Laravel web route for all other URLs)
 */
export default defineConfig(({ mode }) => ({
  root: '.',                 // index.html is at project root
  // Use 'resources/public-static' as publicDir (static files copied as-is).
  // Keeps it separate from Laravel's public/ to avoid Vite conflicts.
  publicDir: 'resources/public-static',
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/react'),
      // Proxy react-router-dom to our wrapper
      'react-router-dom': path.resolve(__dirname, './resources/react/lib/react-router-dom-proxy.tsx'),
      // Original react-router-dom under a different name
      'react-router-dom-original': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
  },
  build: {
    outDir: 'public/app',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  define: {
    __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
      mode === 'production'
        ? process.env.VITE_ENABLE_ROUTE_MESSAGING === 'true'
        : process.env.VITE_ENABLE_ROUTE_MESSAGING !== 'false'
    ),
  },
}));
