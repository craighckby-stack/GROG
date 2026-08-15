/**
 * DIAGNOSTIC UTILITIES CORE
 * Role: Helper utilities for diagnostic execution, telemetry, and metric computation.
 * Integration: Provides foundational logic for system health monitoring and diagnostic reporting.
 * Dependencies: None (Pure utility module)
 */

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
 * Returns ISO 8601 formatted UTC timestamp.
 */
export function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Computes summary metrics for diagnostic check results.
 */
export function computeSummary(checks: Record<string, DiagnosticCheckResult>): DiagnosticSummary {
  const values = Object.values(checks);
  const total = values.length;
  const passed = values.filter((c) => c.passed).length;
  const failed = total - passed;
  
  return {
    total,
    passed,
    failed,
    is_healthy: total > 0 && failed === 0,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0,
  };
}

/**
 * Generates standard telemetry metadata for diagnostic results.
 */
export function generateTelemetryMetadata(): Record<string, any> {
  return {
    timestamp: Date.now(),
    version: "1.0.0-DIAGNOSTIC-AWARE",
    environment: typeof window !== 'undefined' ? 'browser' : 'node',
  };
}

/**
 * Executes a diagnostic check and measures execution duration in milliseconds.
 * Wraps the check in a try-catch block to ensure system stability.
 */
export async function executeCheckWithTelemetry(
  checkFn: () => Promise<boolean> | boolean,
  checkName: string
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const passed = await checkFn();
    const duration = performance.now() - start;
    return {
      passed,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: passed ? `Check '${checkName}' passed` : `Check '${checkName}' failed`,
      metadata: generateTelemetryMetadata(),
    };
  } catch (error: any) {
    const duration = performance.now() - start;
    return {
      passed: false,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: error instanceof Error ? error.message : String(error),
      metadata: { ...generateTelemetryMetadata(), error: true },
    };
  }
}

/**
 * Validates that a check function is callable.
 */
export function validateCheckFunction(func: any): boolean {
  return typeof func === 'function';
}