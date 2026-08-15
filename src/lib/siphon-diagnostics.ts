/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Provides real-time health monitoring and performance telemetry for the Siphon Engine.
 * Integration: Used by deep_siphon.ts to track execution metrics and system health.
 */

import { performance } from 'perf_hooks';

export interface DiagnosticMetric {
  duration_ms: number;
  success: boolean;
  timestamp: string;
}

export class SiphonDiagnosticEngine {
  private metrics: Record<string, DiagnosticMetric[]> = {};

  async track<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.record(label, performance.now() - start, true);
      return result;
    } catch (error) {
      this.record(label, performance.now() - start, false);
      throw error;
    }
  }

  private record(label: string, duration: number, success: boolean) {
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push({
      duration_ms: parseFloat(duration.toFixed(3)),
      success,
      timestamp: new Date().toISOString()
    });
  }

  getSummary() {
    return Object.entries(this.metrics).reduce((acc, [label, data]) => {
      acc[label] = {
        count: data.length,
        avg_duration: data.reduce((s, m) => s + m.duration_ms, 0) / data.length,
        failures: data.filter(m => !m.success).length
      };
      return acc;
    }, {} as Record<string, any>);
  }
}