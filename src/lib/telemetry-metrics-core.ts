/**
 * TELEMETRY METRICS CORE
 * Role: Centralized aggregation and computation for diagnostic telemetry.
 */

export interface MetricSummary {
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
}

export function computeMetricSummary(results: boolean[]): MetricSummary {
  const total = results.length;
  const passed = results.filter(Boolean).length;
  const failed = total - passed;
  return {
    total,
    passed,
    failed,
    pass_rate: total > 0 ? (passed / total) * 100 : 0
  };
}

export function getTimestamp(): string {
  return new Date().toISOString();
}