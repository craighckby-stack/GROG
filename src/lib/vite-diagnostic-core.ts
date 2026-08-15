/**
 * VITE DIAGNOSTIC CORE UTILITIES
 * Role: Core logic for diagnostic validation, telemetry generation, and execution measurement.
 * Integration: Delegated from vite-diagnostic-utils.ts to maintain modularity.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticResult {
  passed: boolean;
  duration_ms: number;
}

/**
 * Executes a diagnostic check and measures execution duration in milliseconds.
 */
export function executeCheckWithTelemetry(checkFn: () => boolean, _checkType: string): DiagnosticResult {
  const start = performance.now();
  try {
    const passed = checkFn();
    const duration = performance.now() - start;
    return { passed, duration_ms: parseFloat(duration.toFixed(3)) };
  } catch (error) {
    const duration = performance.now() - start;
    return { passed: false, duration_ms: parseFloat(duration.toFixed(3)) };
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
    version: "1.0.0-DIAGNOSTIC-AWARE"
  };
}