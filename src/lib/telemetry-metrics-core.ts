/**
 * TELEMETRY METRICS CORE
 * Role: Aggregates and processes telemetry data for the gateway system.
 * Integration: Used by gateway-telemetry.ts to maintain non-blocking metric buffers.
 */

export interface MetricSnapshot {
  operation: string;
  duration_ms: number;
  timestamp: number;
  metadata: Record<string, any>;
}

export class TelemetryBuffer {
  private buffer: MetricSnapshot[] = [];
  private readonly MAX_SIZE = 1000;

  public push(snapshot: MetricSnapshot): void {
    if (this.buffer.length >= this.MAX_SIZE) {
      this.buffer.shift();
    }
    this.buffer.push(snapshot);
  }

  public getSnapshot(): MetricSnapshot[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer = [];
  }
}

export const globalTelemetryBuffer = new TelemetryBuffer();
