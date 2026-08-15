/**
 * DIAGNOSTIC UTILITIES CORE
 * Role: Helper utilities for diagnostic execution, telemetry formatting, and metric computation.
 */

export interface DiagnosticCheckResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
  metadata?: Record<string, any>;
}

export function summarizeDiagnosticResults(checks: Record<string, DiagnosticCheckResult>) {
  const entries = Object.values(checks);
  const total = entries.length;
  const passed = entries.filter(c => c.passed).length;
  const failed = total - passed;
  return {
    total,
    passed,
    failed,
    is_healthy: total > 0 && failed === 0,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0
  };
}

export function getSystemTelemetry() {
  return {
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime()
  };
}