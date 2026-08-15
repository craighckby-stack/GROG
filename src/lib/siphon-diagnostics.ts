/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Provides telemetry and health monitoring for the Siphon Engine.
 * Integration: Used by deep_siphon.ts to track performance and errors.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticMetric {
  duration_ms: number;
  success: boolean;
  error?: string;
}

export class SiphonDiagnosticEngine {
  private metrics: Record<string, DiagnosticMetric[]> = {};

  async track<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(label, { duration_ms: duration, success: true });
      return result;
    } catch (err: any) {
      const duration = performance.now() - start;
      this.record(label, { duration_ms: duration, success: false, error: err.message });
      throw err;
    }
  }

  private record(label: string, metric: DiagnosticMetric) {
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push(metric);
  }

  getSummary() {
    return Object.entries(this.metrics).map(([label, data]) => ({
      label,
      count: data.length,
      avg_ms: (data.reduce((acc, m) => acc + m.duration_ms, 0) / data.length).toFixed(2),
      failures: data.filter(m => !m.success).length
    }));
  }
}