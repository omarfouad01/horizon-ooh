import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import { useApiStore } from '@/store/apiStore'
import './index.css'
// BUILD: 20260427-FINAL
const root = document.getElementById("root")!;
const snapshot = document.getElementById("horizon-ssg-state");

if (snapshot?.textContent) {
  try {
    // Hydration's server snapshot comes from Zustand's initial-state
    // reference, so populate it before hydrateRoot compares the trees.
    const initialState = useApiStore.getInitialState();
    Object.assign(initialState, JSON.parse(snapshot.textContent), { readyPath: window.location.pathname });
    (useApiStore.setState as any)(initialState, true);
  } catch (error) {
    console.warn("[SSG] Unable to restore the build-time public data snapshot.", error);
  }
}

if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
