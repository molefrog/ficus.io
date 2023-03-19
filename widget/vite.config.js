// vite.config.js
import { resolve } from "path";
import cssInjectedByJSPlugin from "vite-plugin-css-injected-by-js";

export default {
  publicDir: false, // no static assets here, just a single js file

  plugins: [cssInjectedByJSPlugin({ styleId: "ficus-io" })],

  css: {
    modules: {
      localsConvention: "dashesOnly", // .my-component => styles.myComponent
    },
  },

  esbuild: {
    jsxFactory: "h", // preact
    jsxFragment: "Fragment",
  },

  build: {
    target: "modules",
    manifest: true,
    sourcemap: true,
    emptyOutDir: true, // clean dist/d dir before build
    outDir: resolve(__dirname, "../dist/d"), // "d" stands for "dist"
    lib: {
      entry: resolve(__dirname, "widget.js"),
      formats: ["es"],
      fileName: "widget-[hash:8]",
    },
  },
};
