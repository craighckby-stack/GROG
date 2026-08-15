/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Provides standardized telemetry formatting and validation for diagnostic probes.
 */

export interface TelemetryData {
  duration_ms: number;
  timestamp: string;
  version: string;
}

export function formatTelemetry(duration: number): TelemetryData {
  return {
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
    version: '1.0.0-DIAGNOSTIC-AWARE'
  };
}

export function validateApiKey(key: string | undefined): boolean {
  return typeof key === 'string' && key.length > 20;
}
