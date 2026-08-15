/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Provides core telemetry formatting and state management for the diagnostic engine.
 * Integration: Used by diagnostic-init.ts to track system health metrics.
 */

export interface DiagnosticTelemetry {
  boot_timestamp: string;
  init_start: number;
  status: 'INITIALIZING' | 'READY' | 'DEGRADED';
  environment: 'browser' | 'node' | 'unknown';
  metadata: Record<string, any>;
}

export const getEnvironment = (): 'browser' | 'node' => {
  return typeof window !== 'undefined' ? 'browser' : 'node';
};

export const createTelemetrySnapshot = (status: DiagnosticTelemetry['status']): DiagnosticTelemetry => ({
  boot_timestamp: new Date().toISOString(),
  init_start: performance.now(),
  status,
  environment: getEnvironment(),
  metadata: {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown'
  }
});