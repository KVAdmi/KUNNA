import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    extensions: ['.jsx', '.js', '.tsx', '.ts']
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        tracking: resolve(__dirname, "tracking.html")
      },
      external: [
        "@googlemaps/js-api-loader",
        "@capacitor/app",
        "@capacitor/app-launcher"
      ]
    }
  }
});
