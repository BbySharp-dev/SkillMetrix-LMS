import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  build: {
    // React + ReactDOM is ~850KB, this is expected. Disable warning.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('@radix-ui')) return 'vendor-ui';
          }
        },
      },
    },
  },
})
