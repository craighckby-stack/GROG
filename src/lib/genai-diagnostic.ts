/**
 * GENAI DIAGNOSTIC UTILITIES
 * Role: Validates GenAI environment and provides structured telemetry logging.
 * Integration: Used by test-genai2.js to ensure operational integrity.
 * Evolution: Aligned with AI_Agent_OS diagnostic architecture.
 */

import { performance } from 'perf_hooks';
import { computeMetricSummary, getTimestamp } from './telemetry-metrics-core';

export interface DiagnosticResult {
  passed: boolean;
  duration_ms: number;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Validates that the required environment variables are present.
 */
export function validateGenAIEnv(): DiagnosticResult {
  const start = performance.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const passed = !!apiKey;
  
  return {
    passed,
    duration_ms: performance.now() - start,
    message: passed ? 'Environment validated.' : 'GEMINI_API_KEY is missing.',
    metadata: { env_check: 'GEMINI_API_KEY' }
  };
}

/**
 * Logs telemetry data for GenAI operations with high-precision timing.
 */
export function logGenAITelemetry(operation: string, duration: number, success: boolean) {
  const timestamp = getTimestamp();
  console.log(`[TELEMETRY] ${timestamp} | Op: ${operation} | Duration: ${duration.toFixed(2)}ms | Success: ${success}`);
}

/**
 * Executes a diagnostic check with telemetry wrapping.
 */
export async function executeDiagnosticCheck(
  name: string, 
  checkFn: () => Promise<DiagnosticResult>
): Promise<DiagnosticResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    logGenAITelemetry(name, duration, result.passed);
    return { ...result, duration_ms: duration };
  } catch (error: any) {
    return {
      passed: false,
      duration_ms: performance.now() - start,
      message: `Diagnostic execution failed: ${error.message}`
    };
  }
}

/**
 * Aggregates multiple diagnostic results into a summary.
 */
export function summarizeDiagnostics(results: DiagnosticResult[]) {
  const statuses = results.map(r => r.passed);
  return computeMetricSummary(statuses);
}