/**
 * VITE DIAGNOSTIC CORE
 * Role: Core logic for diagnostic validation, telemetry generation, and metric computation.
 * Integration: Delegated from vite-diagnostic-utils.ts to maintain modularity.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
}

/**
 * Executes a diagnostic check and measures execution duration in milliseconds.
 */
export function executeCheckWithTelemetry(
  checkFn: () => boolean,
  checkType: string
): DiagnosticResult {
  const start = performance.now();
  try {
    const passed = checkFn();
    const duration = performance.now() - start;
    return {
      passed,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: passed ? `Check ${checkType} passed` : `Check ${checkType} failed`
    };
  } catch (error) {
    return {
      passed: false,
      duration_ms: parseFloat((performance.now() - start).toFixed(3)),
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generates standard telemetry metadata for diagnostic results.
 */
export function generateTelemetryMetadata() {
  return {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    version: "1.0.0-VITE-DIAGNOSTIC-AWARE"
  };
}