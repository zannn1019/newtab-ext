import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Custom plugin to copy manifest.json and icons to dist
    {
      name: "copy-extension-files",
      closeBundle() {
        // Ensure dist folder exists first
        if (!existsSync("dist")) {
          mkdirSync("dist", { recursive: true });
        }

        // Copy manifest.json
        copyFileSync("manifest.json", "dist/manifest.json");

        // Copy background.js (service worker)
        if (existsSync("public/background.js")) {
          copyFileSync("public/background.js", "dist/background.js");
        }

        // Copy icons if they exist
        if (existsSync("icons")) {
          if (!existsSync("dist/icons")) {
            mkdirSync("dist/icons", { recursive: true });
          }
          const icons = ["icon16.png", "icon48.png", "icon128.png"];
          icons.forEach((icon) => {
            const iconPath = `icons/${icon}`;
            if (existsSync(iconPath)) {
              copyFileSync(iconPath, `dist/icons/${icon}`);
            }
          });
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
      },
      output: {
        // Ensure consistent naming for manifest requirements
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
    // Optimize for extension performance
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Resolve GSAP for bundling
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
