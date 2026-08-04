import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Enable source maps for production debugging
    sourcemap: false,

    // Warn when chunk > 500kB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Split vendor libraries into a separate cached chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core — always cached together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Utility/icon libraries
            if (id.includes('lucide') || id.includes('axios')) {
              return 'vendor-utils';
            }
            // Chart/visualization (if any)
            if (id.includes('recharts') || id.includes('chart')) {
              return 'vendor-charts';
            }
            // Everything else goes to vendor-misc
            return 'vendor-misc';
          }
        },
      },
    },
  },
})
