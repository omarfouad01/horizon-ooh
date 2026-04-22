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
function syncToPublicDist(): import('vite').Plugin {
  return {
    name: 'sync-to-public-dist',
    apply: 'build',
    closeBundle() {
      const projectRoot = path.resolve(__dirname);
      const buildOut    = path.join(projectRoot, 'dist');
      const publicDist  = path.join(projectRoot, '..', 'public', 'dist');
      try {
        // Wipe stale public/dist so removed assets don't linger
        rmSync(publicDist, { recursive: true, force: true });
        syncDir(buildOut, publicDist);
        console.log(`\n✓ Synced dist/ → public/dist/ (Skywork preview updated)`);
      } catch (e) {
        // Non-fatal — local builds outside the Skywork workspace won't have ../public/
        console.warn('sync-to-public-dist: skipped —', (e as Error).message);
      }
    },
  };
}
export default defineConfig(({ mode }) => ({
  root: '.',
  publicDir: 'resources/public-static',
  plugins: [
    tailwindcss(),
    react(),
    syncToPublicDist(),
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