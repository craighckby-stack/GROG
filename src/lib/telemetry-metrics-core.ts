/**
 * TELEMETRY METRICS CORE
 * Role: Core logic for diagnostic validation, telemetry generation, and metric aggregation.
 * Integration: Delegated from siphon-diagnostics.ts to maintain modularity.
 */

export interface MetricSummary {
  count: number;
  avg_duration: number;
  failures: number;
  pass_rate: number;
}

export function computeMetricSummary(data: { duration_ms: number; success: boolean }[]): MetricSummary {
  const count = data.length;
  if (count === 0) return { count: 0, avg_duration: 0, failures: 0, pass_rate: 0 };
  
  const totalDuration = data.reduce((s, m) => s + m.duration_ms, 0);
  const failures = data.filter(m => !m.success).length;
  
  return {
    count,
    avg_duration: parseFloat((totalDuration / count).toFixed(3)),
    failures,
    pass_rate: parseFloat(((count - failures) / count * 100).toFixed(2))
  };
}

export function generateTelemetryMetadata() {
  return {
    timestamp: new Date().toISOString(),
    version: "1.0.0-DIAGNOSTIC-AWARE",
    node_env: process.env.NODE_ENV || 'development'
  };
}