/**
 * VITE DIAGNOSTIC UTILITIES
 * Role: Validates environment integrity and build-time configuration for the Vite pipeline.
 * Integration: Called by vite.config.ts to ensure system readiness.
 */

import { loadEnv } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

export function runBuildDiagnostics(mode: string) {
  const env = loadEnv(mode, '.', '');
  const diagnostics = {
    hasGeminiKey: !!env.GEMINI_API_KEY,
    hasEnvFile: fs.existsSync(path.join(process.cwd(), '.env')),
    nodeVersion: process.version,
  };

  if (!diagnostics.hasGeminiKey) {
    console.warn('[DIAGNOSTIC] WARNING: GEMINI_API_KEY is missing from environment variables.');
  }

  return diagnostics;
}