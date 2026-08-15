/**
 * DIAGNOSTIC UTILITIES CORE
 * Role: Helper utilities for diagnostic execution, telemetry, and metric computation.
 */

export const formatTimestamp = (): string => new Date().toISOString();

export const calculatePassRate = (passed: number, total: number): number => 
  total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0;

export const generateTelemetryMetadata = () => ({
  timestamp: Date.now(),
  engineVersion: '1.0.0-DIAGNOSTIC-AWARE',
  platform: typeof window !== 'undefined' ? 'browser' : 'node'
});