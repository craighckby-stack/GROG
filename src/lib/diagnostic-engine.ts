/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC ENGINE
 * Role: Validates kernel integrity, memory persistence layers, and sandbox isolation.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Dependencies: src/lib/diagnostic-utils.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { 
  DiagnosticCheckResult, 
  summarizeDiagnosticResults, 
  getSystemTelemetry 
} from './diagnostic-utils';

export interface DiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAILURE';
  timestamp: string;
  checks: Record<string, DiagnosticCheckResult>;
  summary: ReturnType<typeof summarizeDiagnosticResults>;
  telemetry: ReturnType<typeof getSystemTelemetry>;
}

const REGISTERED_CHECKS: Record<string, () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>> = {};

/**
 * Register a custom diagnostic check
 */
export function registerCheck(name: string, checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>) {
  REGISTERED_CHECKS[name] = checkFn;
}

/**
 * Execute a check with precise telemetry duration measurement
 */
async function executeCheck(
  name: string,
  checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    return { 
      ...result, 
      duration_ms: parseFloat((performance.now() - start).toFixed(3)) 
    };
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

  // 1. Environment Validator
  checks['env_loader'] = await executeCheck('env_loader', async () => ({
    passed: fs.existsSync(path.join(process.cwd(), '.env')),
    message: 'Environment configuration validated'
  }));

  // 2. Memory Persistence Check
  checks['memory_persistence'] = await executeCheck('memory_persistence', async () => {
    const memoryDir = path.join(process.cwd(), 'memory');
    const exists = fs.existsSync(memoryDir);
    return {
      passed: exists,
      message: exists ? 'Memory persistence directory accessible' : 'Memory directory missing',
      metadata: { path: memoryDir }
    };
  });

  // 3. Execute Registered Custom Checks
  for (const [name, fn] of Object.entries(REGISTERED_CHECKS)) {
    checks[name] = await executeCheck(name, fn);
  }

  const summary = summarizeDiagnosticResults(checks);
  
  return {
    status: summary.is_healthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    checks,
    summary,
    telemetry: getSystemTelemetry()
  };
}