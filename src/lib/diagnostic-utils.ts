/**
 * DIAGNOSTIC UTILITIES
 * Role: Helper utilities for diagnostic execution formatting, status telemetry, and metric computation.
 * Integration: Provides core diagnostic primitives and telemetry aggregation for the system engine.
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import { generateTelemetryMetadata } from './telemetry-metrics-core';

export interface DiagnosticCheckResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface DiagnosticSummary {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

/**
 * Computes summary metrics for diagnostic check results.
 */
export function summarizeDiagnosticResults(checks: Record<string, DiagnosticCheckResult>): DiagnosticSummary {
  const entries = Object.values(checks);
  const total = entries.length;
  const passed = entries.filter(c => c.passed).length;
  const failed = total - passed;
  
  return {
    total,
    passed,
    failed,
    is_healthy: total > 0 && failed === 0,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0
  };
}

/**
 * Generates comprehensive system telemetry including hardware and process state.
 */
export function getSystemTelemetry() {
  return {
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime(),
    load_avg: os.loadavg(),
    metadata: generateTelemetryMetadata()
  };
}

/**
 * Executes a diagnostic check and measures execution duration in milliseconds.
 */
export async function executeCheckWithTelemetry(
  checkFn: () => Promise<boolean> | boolean,
  checkType: string
): Promise<{ passed: boolean; duration_ms: number }> {
  const startTime = performance.now();
  try {
    const passed = await Promise.resolve(checkFn());
    const durationMs = performance.now() - startTime;
    return { passed, duration_ms: parseFloat(durationMs.toFixed(3)) };
  } catch (error) {
    const durationMs = performance.now() - startTime;
    return { passed: false, duration_ms: parseFloat(durationMs.toFixed(3)) };
  }
}