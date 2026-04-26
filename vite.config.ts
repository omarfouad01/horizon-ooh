import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';

/**
 * Horizon OOH — Unified Vite config
 *
 * Source:  resources/react/   (React 18 + TypeScript)
 * Output:  dist/               (primary build output)
 *          ../public/dist/     (Skywork preview CDN web-root — kept in sync automatically)
 *
 * Dev:  npm run dev      → Vite dev server (hot reload)
 * Prod: npm run build    → builds to dist/ AND syncs to ../public/dist/
 */

/** Recursively copy src → dest, overwriting existing files */
function syncDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath  = path.join(src,  entry);
    const destPath = path.join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      syncDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/** Vite plugin: after every production build, mirror dist/ → ../public/dist/ */
// function syncToPublicDist(): import('vite').Plugin {
//   return {
//     name: 'sync-to-public-dist',
//     apply: 'build',
//     closeBundle() {
//       const projectRoot = path.resolve(__dirname);
//       const buildOut    = path.join(projectRoot, 'dist');
//       const publicDist  = path.join(projectRoot, '..', 'public', 'dist');
//       try {
//         // Wipe stale public/dist so removed assets don't linger
//         rmSync(publicDist, { recursive: true, force: true });
//         syncDir(buildOut, publicDist);
//         console.log(`\n✓ Synced dist/ → public/dist/ (Skywork preview updated)`);
//       } catch (e) {
//         // Non-fatal — local builds outside the Skywork workspace won't have ../public/
//         console.warn('sync-to-public-dist: skipped —', (e as Error).message);
//       }
//     },
//   };
// }
export default defineConfig(({ mode }) => ({
  base: '/',
  root: '.',
  publicDir: 'resources/public-static',
  plugins: [
    tailwindcss(),
    react(),
    // syncToPublicDist(),
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
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        // ── Manual chunk splitting for optimal caching ──
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack') || id.includes('node_modules/axios')) return 'data-layer';
          if (id.includes('/resources/react/admin/')) return 'admin';
          if (id.includes('node_modules/zod') || id.includes('node_modules/date-fns') || id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) return 'utils';
        },
      },
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
