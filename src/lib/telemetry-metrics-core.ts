/**
 * TELEMETRY METRICS CORE
 * Role: Core logic for computing diagnostic health metrics and formatting telemetry data.
 * Integration: Delegated from diagnostic-telemetry-utils.ts to maintain modularity.
 */

export interface MetricSummary {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

/**
 * Computes summary metrics for diagnostic check results.
 */
export const computeMetricSummary = (checks: Record<string, boolean>): MetricSummary => {
  const entries = Object.values(checks);
  const total = entries.length;
  const passed = entries.filter(Boolean).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;

  return {
    total,
    passed,
    failed,
    is_healthy,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0
  };
};

/**
 * Generates standard telemetry metadata for diagnostic snapshots.
 */
export const generateTelemetryMetadata = (): Record<string, any> => ({
  timestamp: Date.now(),
  engine_version: '1.0.0-DIAGNOSTIC-AWARE',
  platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
});