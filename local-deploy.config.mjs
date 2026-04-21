import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve('/data/workspace/b5b70129-cf93-4bca-94b7-a4e8c92b1d4f/horizon_ooh/src'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('/data/workspace/b5b70129-cf93-4bca-94b7-a4e8c92b1d4f/horizon_ooh/src'),
    },
  },
  build: {
    outDir: '/data/workspace/b5b70129-cf93-4bca-94b7-a4e8c92b1d4f/horizon_ooh/dist-test',
    emptyOutDir: true,
  },
});
