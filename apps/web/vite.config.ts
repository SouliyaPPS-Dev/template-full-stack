import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.BASE_URL || "/";

  return {
    base,
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": "/src",
        "@shared": "../../packages/shared",
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "autoUpdate",
        includeAssets: ["icon.svg"],
        manifest: {
          name: "Template - E-commerce Platform",
          short_name: "Template",
          description: "Full-stack e-commerce platform",
          theme_color: "#171717",
          background_color: "#ffffff",
          display: "standalone",
          scope: base,
          start_url: base,
          icons: [
            {
              src: `${base}icon.svg`,
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
  };
});
