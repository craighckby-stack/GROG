/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Standardized metric formatting and performance tracking.
 */

export const formatTelemetry = (durationMs: number) => ({
  duration_ms: parseFloat(durationMs.toFixed(3)),
  timestamp: new Date().toISOString(),
  version: '1.0.0-DIAGNOSTIC-AWARE'
});

export const validateApiKey = (key?: string): boolean => !!key && key.length > 20;