// vite.config.js
import { resolve } from "path";

export default {
  build: {
    target: "modules",
    emptyOutDir: true, // clean dist (must be called before building the widget)
    outDir: resolve(__dirname, "../dist"),
    rollupOptions: {
      external: ["/widget.js"],
    },
  },
};
