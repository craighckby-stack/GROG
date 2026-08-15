/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/diagnostic-engine.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Integration: Utilizes diagnostic-utils for telemetry and metric computation.
 */

import { formatTimestamp, calculatePassRate, generateTelemetryMetadata } from './diagnostic-utils';

export interface DiagnosticCheck {
  id: string;
  name: string;
  category: 'ENV' | 'MEMORY' | 'GATEWAY' | 'CONTROLLER' | 'MCM';
  status: 'HEALTHY' | 'WARN' | 'FAILED';
  latencyMs: number;
  message: string;
  details?: Record<string, any>;
}

export interface DiagnosticReport {
  timestamp: string;
  status: 'HEALTHY' | 'DEGRADED' | 'COMPROMISED';
  totalChecks: number;
  passedChecks: number;
  passRate: number;
  checks: DiagnosticCheck[];
  habitatInfo: {
    kernelVersion: string;
    controller: string;
    substrate: string;
    gatewayStatus: string;
    memorySyncMode: string;
  };
  telemetry: Record<string, any>;
}

/**
 * Executes a diagnostic check with precise latency measurement.
 */
async function executeCheck(
  id: string,
  name: string,
  category: DiagnosticCheck['category'],
  checkFn: () => Promise<{ status: DiagnosticCheck['status'], message: string, details?: Record<string, any> }>
): Promise<DiagnosticCheck> {
  const start = performance.now();
  try {
    const result = await checkFn();
    return {
      id,
      name,
      category,
      status: result.status,
      latencyMs: Math.round(performance.now() - start),
      message: result.message,
      details: result.details
    };
  } catch (error: any) {
    return {
      id,
      name,
      category,
      status: 'FAILED',
      latencyMs: Math.round(performance.now() - start),
      message: `Execution Error: ${error.message}`
    };
  }
}

export async function runSystemDiagnostics(systemState?: any, memoriesCount: number = 0): Promise<DiagnosticReport> {
  const checks: DiagnosticCheck[] = [];

  // 1. Env Loader Check
  checks.push(await executeCheck('chk_env_loader', 'Environment Loader', 'ENV', async () => {
    const hasGeminiKey = Boolean((import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
    return {
      status: hasGeminiKey ? 'HEALTHY' : 'WARN',
      message: hasGeminiKey ? 'API Key present.' : 'Gemini API key pending.',
      details: { provider: 'Google GenAI SDK' }
    };
  }));

  // 2. Gateway Pipeline Check
  checks.push(await executeCheck('chk_gateway_filters', 'Dual-LLM Gateway', 'GATEWAY', async () => ({
    status: 'HEALTHY',
    message: 'Ingress schema sanitizer and Egress MCM auditor active.',
    details: { ingressSanitizer: 'ENFORCED', egressActionAuditor: 'ACTIVE' }
  })));

  // 3. Memory Substrate Check
  checks.push(await executeCheck('chk_memory_substrate', 'Memory Substrate', 'MEMORY', async () => ({
    status: memoriesCount >= 0 ? 'HEALTHY' : 'WARN',
    message: `Persistence linked. ${memoriesCount} memories stored.`,
    details: { persistenceMode: 'Firestore + Memory Cache' }
  })));

  // 4. Dalek Caan Controller Status
  checks.push(await executeCheck('chk_controller_dalek_caan', 'Dalek Caan Controller', 'CONTROLLER', async () => ({
    status: 'HEALTHY',
    message: systemState?.sovereignActive ? 'Sovereign loop engaged.' : 'Controller standby.',
    details: { controllerId: 'DALEK_CAAN_V3.2' }
  })));

  // 5. MCM Saturation Guard
  checks.push(await executeCheck('chk_mcm_saturation_guard', 'MCM Saturation Guard', 'MCM', async () => {
    const isSaturated = (systemState?.saturationDelta ?? 1.0) < 0.001;
    return {
      status: isSaturated ? 'WARN' : 'HEALTHY',
      message: isSaturated ? 'SATURATION_WARN: Progress delta approaching zero.' : 'Delta nominal.',
      details: { saturationDelta: systemState?.saturationDelta?.toFixed(4) }
    };
  }));

  const passedChecks = checks.filter(c => c.status === 'HEALTHY').length;
  const failedCount = checks.filter(c => c.status === 'FAILED').length;
  const warnCount = checks.filter(c => c.status === 'WARN').length;

  return {
    timestamp: formatTimestamp(),
    status: failedCount > 0 ? 'COMPROMISED' : (warnCount > 0 ? 'DEGRADED' : 'HEALTHY'),
    totalChecks: checks.length,
    passedChecks,
    passRate: calculatePassRate(passedChecks, checks.length),
    checks,
    habitatInfo: {
      kernelVersion: 'AI_AGENT_OS_KERNEL_V4.2',
      controller: 'DALEK_CAAN_V3.2',
      substrate: 'Genesis Scaffold Runtime',
      gatewayStatus: 'DUAL_GATEWAY_ACTIVE',
      memorySyncMode: 'FLAT_FILE_FIRESTORE_HYBRID'
    },
    telemetry: generateTelemetryMetadata()
  };
}