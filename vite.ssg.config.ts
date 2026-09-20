import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const isRouteBundle = mode === "ssg-routes";
  const input = isRouteBundle
    ? path.resolve(__dirname, "resources/react/ssg-routes.ts")
    : path.resolve(__dirname, "resources/react/entry-server.tsx");

  return {
    plugins: [react()],
    publicDir: false,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./resources/react"),
        "react-router-dom": path.resolve(__dirname, "./resources/react/lib/react-router-dom-proxy.tsx"),
        "react-router-dom-original": path.resolve(__dirname, "./node_modules/react-router-dom"),
      },
    },
    define: {
      __ROUTE_MESSAGING_ENABLED__: "false",
      __APP_BUILD__: JSON.stringify("20260427-C"),
    },
    build: {
      ssr: input,
      outDir: ".skywork/runtime/ssg",
      emptyOutDir: !isRouteBundle,
      target: "node18",
      rollupOptions: {
        output: {
          entryFileNames: isRouteBundle ? "ssg-routes.mjs" : "entry-server.mjs",
        },
      },
    },
  };
});
