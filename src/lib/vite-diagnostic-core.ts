/**
 * VITE DIAGNOSTIC CORE
 * Role: Core logic for diagnostic validation and telemetry generation.
 * Integration: Delegated from vite-diagnostic-utils.ts to maintain modularity.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticResult {
  passed: boolean;
  message: string;
  duration_ms: number;
  metadata?: Record<string, any>;
}

export function executeCheckWithTelemetry(checkFn: () => boolean | Promise<boolean>, name: string): DiagnosticResult {
  const start = performance.now();
  try {
    const passed = checkFn();
    const duration = performance.now() - start;
    return {
      passed: !!passed,
      message: passed ? `${name} check passed` : `${name} check failed`,
      duration_ms: parseFloat(duration.toFixed(3))
    };
  } catch (error) {
    return {
      passed: false,
      message: `${name} check threw error: ${error}`,
      duration_ms: parseFloat((performance.now() - start).toFixed(3))
    };
  }
}

export function generateTelemetryMetadata() {
  return {
    timestamp: new Date().toISOString(),
    version: "1.0.0-VITE-DIAGNOSTIC-AWARE",
    platform: process.platform
  };
}