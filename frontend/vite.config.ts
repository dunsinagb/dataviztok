import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "DataVizTok",
        short_name: "DataVizTok",
        description: "Discover amazing data visualization dashboards",
        icons: [
          {
            src: "/wiki-logo.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
      },
    }),
  ],
  server: {
    proxy: {
      "/api/tableau": {
        target: "https://public.tableau.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tableau/, ""),
      },
      "/api/powerbi": {
        target: "https://community.fabric.microsoft.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/powerbi/, ""),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      },
      "/api/novypro": {
        target: "https://www.novypro.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/novypro/, ""),
      },
    },
  },
});
