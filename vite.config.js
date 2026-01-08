import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js,tsx,ts}",
      jsxRuntime: 'automatic',
    })
  ],
  resolve: { 
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    extensions: ['.jsx', '.js', '.tsx', '.ts']
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: ['supabase/functions/**'],
  },
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: false, // Desactivar en producción
    minify: 'terser', // Minificación agresiva
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        tracking: resolve(__dirname, "tracking.html")
      },
      external: [
        "@googlemaps/js-api-loader",
        "@capacitor/app",
        "@capacitor/app-launcher"
      ],
      output: {
        manualChunks: {
          // Separar vendors grandes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'ale-services': [
            './src/services/eventsClient.js',
            './src/services/aleObserver.js',
            './src/services/aleAnalyzer.js',
            './src/services/aleGuardian.js'
          ]
        },
        // Nombrar chunks para mejor caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000, // 1MB warning
    assetsInlineLimit: 4096 // 4KB inline limit
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  },
  server: {
    port: 5173,
    strictPort: false
  },
  preview: {
    port: 4173
  }
});
