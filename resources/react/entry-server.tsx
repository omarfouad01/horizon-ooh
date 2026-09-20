import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom-original/server.mjs";
import { AppContent, AppProviders } from "./App";
import { useApiStore } from "@/store/apiStore";

const pristineInitialState = { ...useApiStore.getInitialState() };

export function render(url: string, snapshot?: Record<string, unknown> | null): string {
  if (snapshot) {
    // Zustand's SSR hook reads getInitialState(), so update that reference for
    // the current route. Always restore the pristine state first because the
    // generator renders thousands of routes in one Node process.
    const initialState = useApiStore.getInitialState();
    Object.assign(initialState, pristineInitialState, snapshot);
    (useApiStore.setState as any)(initialState, true);
  }

  return renderToString(
    <AppProviders>
      <StaticRouter location={url}>
        <AppContent />
      </StaticRouter>
    </AppProviders>,
  );
}
