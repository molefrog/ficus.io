// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

import cssInjectedByJSPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig(({ mode }) => ({
  publicDir: false, // no static assets

  plugins: [cssInjectedByJSPlugin({ styleId: "ficus-io" })],

  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },

  css: {
    modules: {
      localsConvention: "dashesOnly",
    },
  },

  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },

  build: {
    target: "modules",
    manifest: true,
    sourcemap: true,
    outDir: resolve(__dirname, "public/d"), // "d" stands for "dist"
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "widget/widget.js"),
      formats: ["es"],
      // the proper extensions will be added
      fileName: "widget-[hash:8]",
    },
  },
}));
