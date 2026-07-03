import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/**
 * Vite stays intentionally thin: Phaser owns the runtime, while Vite handles
 * fast TypeScript compilation, static assets, and production bundling.
 */
export default defineConfig({
  publicDir: "client/public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./client/src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./client/src/assets", import.meta.url)),
      "@core": fileURLToPath(new URL("./client/src/core", import.meta.url)),
      "@entities": fileURLToPath(new URL("./client/src/entities", import.meta.url)),
      "@game": fileURLToPath(new URL("./client/src/game", import.meta.url)),
      "@scenes": fileURLToPath(new URL("./client/src/game/scenes", import.meta.url)),
      "@services": fileURLToPath(new URL("./client/src/services", import.meta.url)),
      "@shared": fileURLToPath(new URL("./client/src/shared", import.meta.url)),
      "@styles": fileURLToPath(new URL("./client/src/styles", import.meta.url)),
      "@world": fileURLToPath(new URL("./client/src/world", import.meta.url))
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          "phaser-vendor": ["phaser"]
        }
      }
    }
  }
});
