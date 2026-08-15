/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Provides standardized telemetry formatting, validation, and metric aggregation for diagnostic probes.
 * Integration: Connects to system diagnostic engines to provide real-time health monitoring.
 * Dependencies: src/lib/telemetry-metrics-core.ts
 */

import { computeDiagnosticSummary, generateSystemMetadata } from './telemetry-metrics-core';

export interface TelemetryData {
  duration_ms: number;
  timestamp: string;
  version: string;
  metadata: Record<string, any>;
}

/**
 * Formats diagnostic execution duration into a standardized telemetry object.
 */
export function formatTelemetry(duration: number): TelemetryData {
  return {
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
    version: '1.0.0-DIAGNOSTIC-AWARE',
    metadata: generateSystemMetadata()
  };
}

/**
 * Validates API key integrity for secure diagnostic reporting.
 */
export function validateApiKey(key: string | undefined): boolean {
  return typeof key === 'string' && key.length > 20;
}

/**
 * Aggregates multiple diagnostic check results into a comprehensive summary.
 */
export function getDiagnosticSummary(results: Record<string, boolean>) {
  return computeDiagnosticSummary(results);
}

/**
 * Standardized error handler for diagnostic probes.
 */
export function handleDiagnosticError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}