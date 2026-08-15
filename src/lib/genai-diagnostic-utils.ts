/**
 * GENAI DIAGNOSTIC UTILITIES
 * Role: Helper utilities for diagnostic execution formatting, status telemetry, and metric computation.
 */

export interface DiagnosticSummary {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

export function formatTimestamp(): string {
  return new Date().toISOString();
}

export function summarizeDiagnosticResults(checks: Record<string, boolean>): DiagnosticSummary {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;

  return {
    total,
    passed,
    failed,
    is_healthy,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0.0
  };
}

export function generateTelemetryMetadata(): Record<string, any> {
  return {
    timestamp: Date.now(),
    version: "1.0.0-GENAI-DIAGNOSTIC-AWARE",
    platform: typeof process !== 'undefined' ? process.platform : 'unknown'
  };
}