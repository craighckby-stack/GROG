/**
 * SIPHON DIAGNOSTIC ENGINE
 * Role: Provides real-time health monitoring, performance telemetry, and diagnostic reporting for the Siphon Engine.
 * Integration: Used by deep_siphon.ts and other core modules to track execution metrics and system health.
 * Dependencies: src/lib/telemetry-metrics-core.ts
 */

import { performance } from 'perf_hooks';
import { computeMetricSummary, generateTelemetryMetadata } from './telemetry-metrics-core';

export interface DiagnosticMetric {
  duration_ms: number;
  success: boolean;
  timestamp: string;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAILURE';
  metadata: Record<string, any>;
  summary: Record<string, any>;
}

export class SiphonDiagnosticEngine {
  private metrics: Record<string, DiagnosticMetric[]> = {};

  /**
   * Tracks the execution of an asynchronous operation with high-precision telemetry.
   */
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

  /**
   * Records a single telemetry data point.
   */
  private record(label: string, duration: number, success: boolean) {
    if (!this.metrics[label]) this.metrics[label] = [];
    this.metrics[label].push({
      duration_ms: parseFloat(duration.toFixed(3)),
      success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generates a comprehensive health report based on accumulated metrics.
   */
  public getReport(): DiagnosticReport {
    const summary = this.getSummary();
    const isHealthy = Object.values(summary).every((m: any) => m.failures === 0);
    
    return {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      metadata: generateTelemetryMetadata(),
      summary
    };
  }

  /**
   * Computes summary statistics for all tracked labels.
   */
  private getSummary() {
    return Object.entries(this.metrics).reduce((acc, [label, data]) => {
      acc[label] = computeMetricSummary(data);
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Clears all accumulated telemetry data.
   */
  public reset() {
    this.metrics = {};
  }
}