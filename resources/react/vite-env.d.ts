/// <reference types="vite/client" />

// Global constants defined at build time
declare const __ROUTE_MESSAGING_ENABLED__: boolean;

declare module "react-router-dom-original/server.mjs" {
  import type { ReactNode } from "react";
  export function StaticRouter(props: {
    basename?: string;
    children?: ReactNode;
    location: string | Partial<Location>;
  }): JSX.Element;
}
