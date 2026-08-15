/**
 * GATEWAY TELEMETRY CORE
 * Role: Centralized metric collection and event logging for the gateway pipeline.
 * Integration: Used by gateway-pipeline.ts to track ingress/egress performance.
 */

import { performance } from 'perf_hooks';

export interface GatewayMetrics {
  duration_ms: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE';
}

/**
 * Records execution duration for gateway operations
 */
export function recordGatewayMetric(operation: string, startTime: number): GatewayMetrics {
  const duration = performance.now() - startTime;
  return {
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
    status: 'SUCCESS'
  };
}

/**
 * Logs gateway events for diagnostic auditing
 */
export function logGatewayEvent(event: string, data: Record<string, any>) {
  // In a production environment, this would interface with a centralized logging service
  // or the diagnostic-engine.ts telemetry buffer.
  console.debug(`[GATEWAY_EVENT][${event}]`, JSON.stringify(data));
}