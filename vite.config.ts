/**
 * VITE CONFIGURATION ARCHITECTURE
 * Role: Orchestrates the build pipeline, plugin integration, and environment injection.
 * Integration: Connects to diagnostic utilities to ensure build-time environment health.
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { runBuildDiagnostics } from './vite-diagnostic-utils';

export default defineConfig(({ mode }) => {
  // Execute system health check before configuration resolution
  runBuildDiagnostics(mode);

  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});