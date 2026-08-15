/**
 * GATEWAY TELEMETRY UTILITIES
 * Role: Provides standardized performance tracking, event logging, and telemetry metadata for the gateway pipeline.
 * Integration: Used by gateway-pipeline.ts to record metrics and audit events.
 * Dependencies: src/lib/gateway-telemetry-utils.ts
 */

import { performance } from 'perf_hooks';
import { generateTelemetryMetadata, TelemetryMetadata } from './gateway-telemetry-utils';

export interface GatewayMetric {
  duration_ms: number;
  timestamp: string;
  metadata: TelemetryMetadata;
}

/**
 * Records a performance metric for a specific gateway operation.
 */
export function recordGatewayMetric(label: string, startTime: number): GatewayMetric {
  const duration = performance.now() - startTime;
  return {
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
    metadata: generateTelemetryMetadata(),
  };
}

/**
 * Logs a structured gateway event for auditing and diagnostic purposes.
 */
export function logGatewayEvent(event: string, data: Record<string, any>): void {
  const payload = {
    event,
    ...data,
    telemetry: generateTelemetryMetadata(),
  };
  
  // In a production environment, this would interface with a centralized logging service
  // or a persistent diagnostic stream.
  console.log(`[GATEWAY_EVENT][${payload.telemetry.timestamp}] ${event}:`, JSON.stringify(payload));
}

/**
 * Wraps an asynchronous operation with performance telemetry.
 */
export async function trackAsyncOperation<T>(label: string, operation: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const metric = recordGatewayMetric(label, start);
    logGatewayEvent(`${label}_SUCCESS`, { duration: metric.duration_ms });
    return result;
  } catch (error: any) {
    const metric = recordGatewayMetric(label, start);
    logGatewayEvent(`${label}_FAILURE`, { 
      duration: metric.duration_ms, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}