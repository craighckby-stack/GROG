/**
 * VITE DIAGNOSTIC UTILITIES
 * Role: Validates environment integrity and build-time configuration for the Vite pipeline.
 * Integration: Called by vite.config.ts to ensure system readiness.
 * Architecture: Employs diagnostic-aware patterns siphoned from AI_Agent_OS.
 */

import { loadEnv } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { executeCheckWithTelemetry, generateTelemetryMetadata } from './src/lib/vite-diagnostic-core';

/**
 * Orchestrates the build diagnostic suite.
 * @param mode The current Vite build mode (e.g., 'development', 'production')
 */
export function runBuildDiagnostics(mode: string) {
  const env = loadEnv(mode, '.', '');
  const results: Record<string, any> = {};

  // 1. API Key Validation
  results['gemini_key'] = executeCheckWithTelemetry(
    () => !!env.GEMINI_API_KEY,
    'GEMINI_API_KEY_CHECK'
  );

  // 2. Environment File Validation
  results['env_file'] = executeCheckWithTelemetry(
    () => fs.existsSync(path.join(process.cwd(), '.env')),
    'ENV_FILE_CHECK'
  );

  // 3. Node Version Validation
  results['node_version'] = executeCheckWithTelemetry(
    () => parseInt(process.version.slice(1).split('.')[0]) >= 16,
    'NODE_VERSION_CHECK'
  );

  // 4. Source Directory Integrity
  results['src_dir'] = executeCheckWithTelemetry(
    () => fs.existsSync(path.join(process.cwd(), 'src')),
    'SRC_DIR_CHECK'
  );

  const report = {
    status: Object.values(results).every((r: any) => r.passed) ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    checks: results,
    telemetry: generateTelemetryMetadata()
  };

  if (report.status === 'DEGRADED') {
    console.warn('[DIAGNOSTIC] Build environment is degraded:', JSON.stringify(report, null, 2));
  } else {
    console.log('[DIAGNOSTIC] Build environment integrity verified.');
  }

  return report;
}