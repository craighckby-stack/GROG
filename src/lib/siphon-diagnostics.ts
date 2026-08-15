/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Tracks performance and health of repository siphoning operations.
 * Integration: Used by deep_siphon.ts for telemetry and diagnostic reporting.
 * Upgraded with AI_Agent_OS architectural patterns for robust health monitoring.
 */

import { performance } from 'perf_hooks';
import { summarizeMetrics, formatTimestamp } from './siphon-diagnostic-utils';

export interface DiagnosticMetric {
  duration_ms: number;
  timestamp: string;
  success: boolean;
}

export interface SiphonReport {
  label: string;
  count: number;
  avg_ms: string;
  failures: number;
  is_healthy: boolean;
}

export class SiphonDiagnosticEngine {
  private metrics: Record<string, DiagnosticMetric[]> = {};

  /**
   * Tracks the execution of a diagnostic operation with precise telemetry.
   */
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

  /**
   * Internal record-keeping for diagnostic metrics.
   */
  private record(label: string, duration: number, success: boolean): void {
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push({
      duration_ms: parseFloat(duration.toFixed(3)),
      timestamp: formatTimestamp(),
      success
    });
  }

  /**
   * Generates a comprehensive health summary of all tracked operations.
   */
  getSummary(): SiphonReport[] {
    return Object.entries(this.metrics).map(([label, data]) => {
      const summary = summarizeMetrics(data);
      return {
        label,
        count: summary.total,
        avg_ms: (data.reduce((acc, curr) => acc + curr.duration_ms, 0) / data.length).toFixed(2),
        failures: summary.failed,
        is_healthy: summary.is_healthy
      };
    });
  }

  /**
   * Clears all recorded metrics to reset diagnostic state.
   */
  reset(): void {
    this.metrics = {};
  }
}

// Export a singleton instance for global diagnostic tracking
export const siphonDiagnostics = new SiphonDiagnosticEngine();