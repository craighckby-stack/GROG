/**
 * DIAGNOSTIC UTILITIES CORE
 * Role: Helper utilities for diagnostic execution, telemetry, and metric computation.
 */

export interface DiagnosticCheckResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
  metadata?: Record<string, any>;
}

export function formatTimestamp(): string {
  return new Date().toISOString();
}

export function computeSummary(checks: Record<string, DiagnosticCheckResult>) {
  const values = Object.values(checks);
  const total = values.length;
  const passed = values.filter(c => c.passed).length;
  return {
    total,
    passed,
    failed: total - passed,
    is_healthy: total > 0 && passed === total,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0
  };
}
