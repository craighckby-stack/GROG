/**
 * GENAI DIAGNOSTIC LAYER
 * Role: Validates GenAI environment and provides telemetry primitives.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Dependencies: src/lib/genai-diagnostic-utils.ts
 */

import { performance } from 'perf_hooks';
import { formatTimestamp, summarizeDiagnosticResults, generateTelemetryMetadata } from './genai-diagnostic-utils';

export interface DiagnosticResult {
  passed: boolean;
  message: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
}

export interface GenAIDiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  timestamp: string;
  checks: Record<string, DiagnosticResult>;
  summary: any;
  telemetry: Record<string, any>;
}

/**
 * Validates GenAI environment variables and configuration.
 */
export async function validateGenAIEnv(): Promise<DiagnosticResult> {
  const start = performance.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const passed = !!apiKey;
  const duration = performance.now() - start;

  return {
    passed,
    message: passed ? 'GEMINI_API_KEY verified' : 'GEMINI_API_KEY missing in environment',
    duration_ms: parseFloat(duration.toFixed(3)),
    metadata: { env_var_present: passed }
  };
}

/**
 * Logs structured GenAI telemetry with performance tracking.
 */
export function logGenAITelemetry(operation: string, duration: number, success: boolean) {
  const timestamp = formatTimestamp();
  console.log(`[TELEMETRY][${timestamp}] Op: ${operation} | Duration: ${duration.toFixed(2)}ms | Success: ${success}`);
}

/**
 * Runs the full GenAI diagnostic suite.
 */
export async function runGenAIDiagnostics(): Promise<GenAIDiagnosticReport> {
  const checks: Record<string, DiagnosticResult> = {};
  
  // Perform checks
  checks['env_validation'] = await validateGenAIEnv();
  
  const statusMap = Object.fromEntries(
    Object.entries(checks).map(([k, v]) => [k, v.passed])
  );
  
  const summary = summarizeDiagnosticResults(statusMap);
  
  return {
    status: summary.is_healthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: formatTimestamp(),
    checks,
    summary,
    telemetry: generateTelemetryMetadata()
  };
}