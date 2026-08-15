/**
 * SIPHON DIAGNOSTIC UTILITIES
 * Role: Helper utilities for diagnostic execution formatting, status telemetry, and metric computation.
 * Integration: Imported by siphon-diagnostics.ts to compute diagnostic metrics cleanly.
 */

export interface DiagnosticSummary {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

export function summarizeMetrics(metrics: { success: boolean }[]): DiagnosticSummary {
  const total = metrics.length;
  const passed = metrics.filter((m) => m.success).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;
  const pass_rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0;

  return { total, passed, failed, is_healthy, pass_rate };
}

export function formatTimestamp(): string {
  return new Date().toISOString();
}