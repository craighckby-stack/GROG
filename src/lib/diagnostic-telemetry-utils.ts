/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Provides core telemetry formatting, state management, and metric computation interfaces for the diagnostic engine.
 * Integration: Used by diagnostic-init.ts and diagnostic-engine.ts to track and report system health metrics.
 * Dependencies: ./telemetry-metrics-core.ts
 */

import { computeMetricSummary, MetricSummary, generateTelemetryMetadata } from './telemetry-metrics-core';

export interface DiagnosticTelemetry {
  boot_timestamp: string;
  init_start: number;
  status: 'INITIALIZING' | 'READY' | 'DEGRADED' | 'CRITICAL_FAILURE';
  environment: 'browser' | 'node' | 'unknown';
  metadata: Record<string, any>;
  metrics?: MetricSummary;
}

/**
 * Detects the current execution environment with high precision.
 */
export const getEnvironment = (): 'browser' | 'node' | 'unknown' => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') return 'browser';
  if (typeof process !== 'undefined' && process.versions && process.versions.node) return 'node';
  return 'unknown';
};

/**
 * Creates a new telemetry snapshot with system-wide metadata.
 * Implements high-resolution timing where available.
 */
export const createTelemetrySnapshot = (status: DiagnosticTelemetry['status']): DiagnosticTelemetry => ({
  boot_timestamp: new Date().toISOString(),
  init_start: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  status,
  environment: getEnvironment(),
  metadata: {
    ...generateTelemetryMetadata(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
  }
});

/**
 * Updates an existing telemetry snapshot with new health check results.
 * Recalculates health status based on the provided check results.
 */
export const updateTelemetryMetrics = (
  snapshot: DiagnosticTelemetry, 
  checkResults: Record<string, boolean>
): DiagnosticTelemetry => {
  const metrics = computeMetricSummary(checkResults);
  
  return {
    ...snapshot,
    metrics,
    status: metrics.is_healthy ? 'READY' : 'DEGRADED'
  };
};

/**
 * Validates that a diagnostic check result is properly formatted.
 */
export const validateTelemetryIntegrity = (telemetry: DiagnosticTelemetry): boolean => {
  return !!(telemetry.boot_timestamp && telemetry.status && telemetry.metadata);
};