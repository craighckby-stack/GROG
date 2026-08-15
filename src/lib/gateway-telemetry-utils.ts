/**
 * GATEWAY TELEMETRY CORE UTILITIES
 * Role: Provides standardized metric computation and metadata generation for gateway telemetry.
 * Integration: Delegated from gateway-telemetry.ts to maintain modularity.
 */

export interface TelemetryMetadata {
  timestamp: string;
  version: string;
  node_version: string;
  platform: string;
}

export function generateTelemetryMetadata(): TelemetryMetadata {
  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0-GATEWAY-AWARE',
    node_version: process.version,
    platform: process.platform,
  };
}

export function computeMetricSummary(durations: number[]): Record<string, number> {
  const count = durations.length;
  if (count === 0) return { avg: 0, max: 0, min: 0 };
  
  const sum = durations.reduce((a, b) => a + b, 0);
  return {
    avg: parseFloat((sum / count).toFixed(3)),
    max: Math.max(...durations),
    min: Math.min(...durations),
    count
  };
}