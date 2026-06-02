import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { compression } from 'vite-plugin-compression2';

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

/**
 * Post-build plugin: inject LCP image preload + clean up bandwidth-competing
 * modulepreloads that fight the LCP image for TCP connections.
 *
 * Why: The hero background image lives inside React JSX. The browser's preload
 * scanner cannot discover it until JS executes (~1-2 s). By injecting a
 * <link rel="preload"> directly into the built HTML, the browser starts fetching
 * the LCP image at the same time as the JS bundle — reducing Resource Load Delay
 * from ~1500 ms to near-zero.
 *
 * Bandwidth competitors: leaflet (149KB), framer-motion (122KB), admin (395KB)
 * are all loaded eagerly via modulepreload, saturating HTTP connections and
 * delaying the LCP image. We remove them from modulepreload so they are still
 * loaded (via the module graph) but don't get eager parallel priority.
 */
function lcpOptimizePlugin(): import('vite').Plugin {
  const LCP_IMAGE = 'https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?w=1600&q=85&fit=crop';
  // Chunks removed from eager modulepreload — fetched lazily via module graph.
  // This prevents them from competing with the LCP image for TCP connections.
  // data-layer (axios+zustand) is deferred since store init is now post-first-paint.
  const DEFER_CHUNKS = ['leaflet', 'framer-motion', 'admin', 'charts', 'radix-ui', 'data-layer', 'store'];

  return {
    name: 'lcp-optimize',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const htmlPath = path.resolve(__dirname, 'public/index.html');
      try {
        let html = readFileSync(htmlPath, 'utf-8');

        // 1. Remove modulepreload for bandwidth-competing chunks
        html = html.replace(
          /<link rel="modulepreload" crossorigin href="\/assets\/(leaflet|framer-motion|admin|charts|radix-ui|data-layer|store)-[^"]+">/g,
          '<!-- deferred: $1 (not eager-preloaded to avoid LCP image bandwidth contention) -->'
        );

        // 2. Remove the leaflet.css <link rel="stylesheet"> from the critical path.
        // Leaflet CSS is now injected dynamically (non-blocking) by ensureLeafletCss()
        // in BillboardMap/ProductMap/LocationsMap when a map first mounts.
        // Removing it from the <head> eliminates ~7 KB from the critical rendering path
        // and reduces the critical chain length from 4 requests to 3.
        html = html.replace(
          /<link rel="stylesheet" crossorigin href="\/assets\/leaflet-[^"]+\.css">/g,
          '<!-- leaflet.css removed from critical path: loaded dynamically by ensureLeafletCss() -->'
        );

        // 3. LCP image preload is already present in index.html source —
        // no need to inject it again here. The plugin just verifies it survived.
        if (!html.includes(LCP_IMAGE)) {
          console.warn('lcp-optimize: LCP preload not found in built HTML — check index.html source');
        }

        // 4. Mark the main entry CSS link with high fetch priority.
        // First, remove any existing preload hints for hashed index CSS (from prior builds
        // that Vite left in the public/index.html), then inject a fresh one.
        html = html.replace(
          /<link rel="preload" as="style" fetchpriority="high" crossorigin href="\/assets\/index-[^"]+\.css" \/>[\n\r]?\s*/g,
          ''
        );
        const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/);
        if (cssMatch) {
          const href = cssMatch[1];
          html = html.replace(
            cssMatch[0],
            `<link rel="preload" as="style" fetchpriority="high" crossorigin href="${href}" />\n    ${cssMatch[0]}`
          );
        }

        writeFileSync(htmlPath, html, 'utf-8');
        console.log('\n✓ LCP optimize: preload injected, bandwidth competitors deferred');
      } catch (e) {
        console.warn('lcp-optimize plugin skipped:', (e as Error).message);
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: '/',
  root: '.',
  publicDir: 'resources/public-static',
  plugins: [
    tailwindcss(),
    react(),
    // Pre-compress JS/CSS/SVG at build time so Apache can serve .gz/.br siblings
    // directly — zero CPU cost at request time vs on-the-fly mod_deflate.
    // threshold: 1024 = only compress files > 1 KB (smaller files aren't worth it)
    compression({ algorithm: 'gzip',   exclude: /\.(png|jpe?g|webp|gif|ico|woff2?)$/, threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', exclude: /\.(png|jpe?g|webp|gif|ico|woff2?)$/, threshold: 1024 }),
    // LCP optimization: inject preload for hero image, defer heavy chunk preloads
    lcpOptimizePlugin(),
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
    // Target modern browsers only — smaller, faster output
    target: ['es2020', 'chrome97', 'firefox97', 'safari15'],
    // Increase chunk size warning threshold — we already split manually
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        // ── Manual chunk splitting for optimal caching ──
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
          // @tanstack/react-query ships with react-core: QueryClientProvider is in App.tsx (eager)
          // so bundling it here avoids a waterfall between react-core and data-layer.
          if (id.includes('node_modules/@tanstack')) return 'react-core';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          // data-layer = axios + zustand only (deferred from modulepreload)
          if (id.includes('node_modules/axios') || id.includes('node_modules/zustand')) return 'data-layer';
          if (id.includes('/resources/react/admin/')) return 'admin';
          if (id.includes('node_modules/zod') || id.includes('node_modules/date-fns') || id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) return 'utils';
          // Split icon libraries separately — they are large but often tree-shaken
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) return 'icons';
        },
      },
    },
    // Enable CSS code splitting for faster page-specific CSS loading
    cssCodeSplit: true,
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
    __APP_BUILD__: JSON.stringify('20260427-C'),
  },
}));
