/**
 * VITE DIAGNOSTIC CORE
 * Role: Provides core validation logic for the build pipeline.
 * Integration: Used by vite.config.ts to ensure environment integrity.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BuildDiagnosticResult {
  passed: boolean;
  message: string;
}

export function validateBuildEnvironment(mode: string): BuildDiagnosticResult[] {
  const results: BuildDiagnosticResult[] = [];

  // Check for .env file presence
  const envPath = path.join(process.cwd(), '.env');
  results.push({
    passed: fs.existsSync(envPath),
    message: fs.existsSync(envPath) ? 'Environment file found' : 'Missing .env file - using defaults'
  });

  // Check for critical source directories
  const srcPath = path.join(process.cwd(), 'src');
  results.push({
    passed: fs.existsSync(srcPath),
    message: fs.existsSync(srcPath) ? 'Source directory verified' : 'CRITICAL: Source directory missing'
  });

  return results;
}

export function logDiagnosticReport(results: BuildDiagnosticResult[]) {
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.warn('[VITE-DIAGNOSTIC] Build environment warnings detected:');
    failed.forEach(f => console.warn(` - ${f.message}`));
  } else {
    console.log('[VITE-DIAGNOSTIC] Build environment healthy.');
  }
}