/**
 * DIAGNOSTIC UTILITIES CORE
 * Role: Helper utilities for diagnostic execution, telemetry formatting, and metric computation.
 * Integration: Provides core logic for the diagnostic engine to process system health checks,
 * performance metrics, and environment-aware telemetry.
 * 
 * Siphoned Patterns: AI_Agent_OS Diagnostic Engine Architecture
 */

import { performance } from 'perf_hooks';

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
 * Generates standard system telemetry metadata for diagnostic reports.
 */
export function getSystemTelemetry() {
  return {
    node_version: typeof process !== 'undefined' ? process.version : 'unknown',
    platform: typeof process !== 'undefined' ? process.platform : 'unknown',
    arch: typeof process !== 'undefined' ? process.arch : 'unknown',
    memory_usage: typeof process !== 'undefined' ? process.memoryUsage() : {},
    uptime: typeof process !== 'undefined' ? process.uptime() : 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Executes a diagnostic check and measures execution duration in milliseconds.
 * Wraps the check in a try-catch block to ensure system stability during diagnostics.
 */
export async function executeCheckWithTelemetry(
  checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    return {
      ...result,
      duration_ms: parseFloat(duration.toFixed(3))
    };
  } catch (error: any) {
    const duration = performance.now() - start;
    return {
      passed: false,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: error instanceof Error ? error.message : String(error),
      metadata: { error: true }
    };
  }
}

/**
 * Validates that a check function is properly structured.
 */
export function validateCheckFunction(func: any): boolean {
  return typeof func === 'function';
}