// BUILD_MARKER: 20260427-C - simulator v3 with direct photo upload
const __BUILD_VER__ = '20260427-C-sim-upload';
console.log('[Horizon OOH] Build:', __BUILD_VER__);
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
