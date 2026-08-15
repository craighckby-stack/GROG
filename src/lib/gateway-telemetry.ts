/**
 * GATEWAY TELEMETRY UTILITIES
 * Role: Handles metric recording, event logging, and performance tracking for the gateway pipeline.
 */

export interface GatewayMetric {
  timestamp: string;
  duration_ms: number;
  operation: string;
}

export function recordGatewayMetric(operation: string, startTime: number): GatewayMetric {
  const duration = performance.now() - startTime;
  return {
    timestamp: new Date().toISOString(),
    duration_ms: parseFloat(duration.toFixed(3)),
    operation
  };
}

export function logGatewayEvent(event: string, metadata: Record<string, any>) {
  console.debug(`[GATEWAY_EVENT][${event}]`, JSON.stringify(metadata));
}
