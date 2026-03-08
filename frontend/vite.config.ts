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
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifestFilename: "manifest.webmanifest",
      manifest: {
        name: "DataVizTok",
        short_name: "DataVizTok",
        description: "Discover amazing data visualization dashboards",
        icons: [
          {
            src: "/dataviztok-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
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
