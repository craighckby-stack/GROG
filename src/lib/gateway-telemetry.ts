/**
 * GATEWAY TELEMETRY UTILITIES
 * Role: Provides standardized performance tracking and event logging for the gateway pipeline.
 * Integration: Used by gateway-pipeline.ts to record metrics and audit events.
 */

import { performance } from 'perf_hooks';

export interface GatewayMetric {
  duration_ms: number;
  timestamp: string;
}

export function recordGatewayMetric(label: string, startTime: number): GatewayMetric {
  const duration = performance.now() - startTime;
  return {
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
  };
}

export function logGatewayEvent(event: string, data: Record<string, any>): void {
  // In a production environment, this would interface with a centralized logging service
  console.log(`[GATEWAY_EVENT][${new Date().toISOString()}] ${event}:`, JSON.stringify(data));
}