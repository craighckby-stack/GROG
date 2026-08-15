/**
 * TELEMETRY METRICS CORE
 * Role: Core logic for metric aggregation and diagnostic result processing.
 * Integration: Delegated from diagnostic-telemetry.ts to maintain modularity.
 */

export interface DiagnosticSummary {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

export function computeDiagnosticSummary(results: Record<string, boolean>): DiagnosticSummary {
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;
  const pass_rate = total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0;

  return { total, passed, failed, is_healthy, pass_rate };
}

export function generateSystemMetadata() {
  return {
    timestamp: new Date().toISOString(),
    engine_version: '1.0.0-DIAGNOSTIC-AWARE',
    environment: process.env.NODE_ENV || 'development'
  };
}