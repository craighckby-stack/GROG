/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC ENGINE
 * Role: Validates kernel integrity, memory persistence layers, and system health.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Dependencies: src/lib/diagnostic-utils.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { 
  DiagnosticCheckResult, 
  formatTimestamp, 
  computeSummary 
} from './diagnostic-utils';

export interface DiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAILURE';
  timestamp: string;
  checks: Record<string, DiagnosticCheckResult>;
  summary: ReturnType<typeof computeSummary>;
  telemetry: {
    platform: string;
    memory_usage: NodeJS.MemoryUsage;
  };
}

/**
 * Execute a check with precise telemetry duration measurement
 */
async function executeCheck(
  checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    return { ...result, duration_ms: parseFloat(duration.toFixed(3)) };
  } catch (error: any) {
    return {
      passed: false,
      duration_ms: parseFloat((performance.now() - start).toFixed(3)),
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run the entire diagnostic suite
 */
export async function runSystemDiagnostics(): Promise<DiagnosticReport> {
  const checks: Record<string, DiagnosticCheckResult> = {};

  // 1. Environment Validator Check
  checks['env_loader'] = await executeCheck(async () => {
    const envExists = fs.existsSync(path.join(process.cwd(), '.env'));
    return {
      passed: envExists,
      message: envExists ? 'Active .env file detected' : 'Missing .env configuration',
      metadata: { envExists }
    };
  });

  // 2. Memory Persistence Check
  checks['memory_persistence'] = await executeCheck(async () => {
    const memoryDir = path.join(process.cwd(), 'memory');
    const exists = fs.existsSync(memoryDir);
    let writable = false;
    if (exists) {
      try {
        fs.accessSync(memoryDir, fs.constants.W_OK);
        writable = true;
      } catch { writable = false; }
    }
    return {
      passed: exists && writable,
      message: exists && writable ? 'Memory persistence directory is writable' : 'Memory directory inaccessible',
      metadata: { exists, writable }
    };
  });

  const summary = computeSummary(checks);
  
  return {
    status: summary.is_healthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: formatTimestamp(),
    checks,
    summary,
    telemetry: {
      platform: process.platform,
      memory_usage: process.memoryUsage()
    }
  };
}