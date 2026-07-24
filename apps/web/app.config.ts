import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  },
});
