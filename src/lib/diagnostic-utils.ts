/**
 * DIAGNOSTIC UTILITIES
 * Role: Helper utilities for diagnostic execution formatting, status telemetry, and metric computation.
 */

import { performance } from 'perf_hooks';
import * as os from 'os';

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

export function getSystemTelemetry() {
  return {
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime(),
    load_avg: os.loadavg()
  };
}
