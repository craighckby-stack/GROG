/**
 * VITE CONFIGURATION ARCHITECTURE
 * Role: Orchestrates the build pipeline, plugin integration, and environment injection.
 * Integration: Connects to diagnostic utilities to ensure build-time environment health.
 * 
 * This file serves as the primary entry point for the Vite build system. It is 
 * diagnostic-aware, meaning it triggers a validation suite before the configuration 
 * is finalized, ensuring that all required environment variables and system 
 * dependencies are present and healthy.
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { validateBuildEnvironment, logDiagnosticReport } from './src/lib/vite-diagnostic-core';

export default defineConfig(({ mode }) => {
  /**
   * PRE-FLIGHT DIAGNOSTICS
   * Executes a suite of checks to validate the build environment.
   * If critical failures are detected, the build process will be alerted
   * to prevent deployment of a corrupted or misconfigured agent kernel.
   */
  const diagnostics = validateBuildEnvironment(mode);
  logDiagnosticReport(diagnostics);

  // Load environment variables based on current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    define: {
      // Explicitly inject critical environment variables into the client bundle
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        // Standardized path resolution for clean imports across the repository
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is managed via environment variables to support stable editing
      // in environments where file-watching might cause race conditions.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        usePolling: process.env.USE_POLLING === 'true',
      }
    },
    build: {
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Optimize bundle size by splitting vendor dependencies
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      // Ensure build artifacts are clean and consistent
      emptyOutDir: true,
      reportCompressedSize: true,
    },
  };
});