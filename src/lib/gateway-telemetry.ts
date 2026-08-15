/**
 * GATEWAY TELEMETRY CORE
 * Role: Centralized metric collection and event logging for the gateway pipeline.
 * Integration: Used by gateway-pipeline.ts to track ingress/egress performance.
 * Evolution: Now utilizes TelemetryBuffer for non-blocking diagnostic ingestion.
 */

import { performance } from 'perf_hooks';
import { globalTelemetryBuffer } from './telemetry-metrics-core';

export interface GatewayMetrics {
  duration_ms: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE';
}

/**
 * Records execution duration for gateway operations and pushes to the global buffer.
 */
export function recordGatewayMetric(operation: string, startTime: number, metadata: Record<string, any> = {}): GatewayMetrics {
  const duration = performance.now() - startTime;
  const duration_ms = parseFloat(duration.toFixed(3));
  const timestamp = new Date().toISOString();
  
  const metric: GatewayMetrics = {
    duration_ms,
    timestamp,
    status: 'SUCCESS'
  };

  // Push to the centralized diagnostic buffer for system-wide observability
  globalTelemetryBuffer.push({
    operation,
    duration_ms,
    timestamp: Date.now(),
    metadata
  });

  return metric;
}

/**
 * Logs gateway events for diagnostic auditing with structured metadata.
 */
export function logGatewayEvent(event: string, data: Record<string, any>) {
  const logEntry = {
    event,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  // Interface with system diagnostic stream
  console.debug(`[GATEWAY_EVENT][${event}]`, JSON.stringify(logEntry));
}

/**
 * Retrieves current telemetry state for diagnostic reporting.
 */
export function getTelemetrySnapshot() {
  return globalTelemetryBuffer.getSnapshot();
}