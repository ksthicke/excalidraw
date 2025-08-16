import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    // open the browser
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `write-box/[name].js`,
        chunkFileNames: `write-box/[name].js`,
        assetFileNames: `write-box/[name].[ext]`,
      },
    },
  },
  publicDir: "public",
  optimizeDeps: {
    esbuildOptions: {
      // Bumping to 2022 due to "Arbitrary module namespace identifier names" not being
      // supported in Vite's default browser target https://github.com/vitejs/vite/issues/13556
      target: "es2022",
      treeShaking: true,
    },
  },
});
