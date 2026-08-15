/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Tracks performance and health of repository siphoning operations.
 * Integration: Used by deep_siphon.ts for telemetry and diagnostic reporting.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticMetric {
  duration_ms: number;
  timestamp: string;
  success: boolean;
}

export class SiphonDiagnosticEngine {
  private metrics: Record<string, DiagnosticMetric[]> = {};

  async track<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(label, duration, true);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(label, duration, false);
      throw error;
    }
  }

  private record(label: string, duration: number, success: boolean) {
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push({
      duration_ms: parseFloat(duration.toFixed(3)),
      timestamp: new Date().toISOString(),
      success
    });
  }

  getSummary() {
    return Object.entries(this.metrics).map(([label, data]) => ({
      label,
      count: data.length,
      avg_ms: (data.reduce((acc, curr) => acc + curr.duration_ms, 0) / data.length).toFixed(2),
      failures: data.filter(d => !d.success).length
    }));
  }
}