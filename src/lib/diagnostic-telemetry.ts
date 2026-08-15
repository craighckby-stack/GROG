/**
 * DIAGNOSTIC TELEMETRY CORE
 * Role: Provides standardized telemetry logging, system state reporting, and performance diagnostics.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Dependencies: ./telemetry-metrics-core.ts
 */

import { generateTelemetryMetadata, summarizeDiagnosticResults } from './telemetry-metrics-core';

export interface SystemTelemetry {
  timestamp: string;
  status: 'READY' | 'INITIALIZING' | 'ERROR';
  memory_usage?: number;
  metrics?: Record<string, any>;
}

/**
 * Logs diagnostic events with structured metadata and severity levels.
 */
export const logDiagnostic = (
  message: string, 
  level: 'info' | 'warn' | 'error' = 'info', 
  metadata?: Record<string, any>
) => {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...generateTelemetryMetadata(),
    ...metadata
  };
  
  if (level === 'error') console.error(`[${timestamp}] [DIAGNOSTIC]`, payload);
  else if (level === 'warn') console.warn(`[${timestamp}] [DIAGNOSTIC]`, payload);
  else console.info(`[${timestamp}] [DIAGNOSTIC]`, payload);
};

/**
 * Updates the DOM-based diagnostic state for UI synchronization.
 */
export const updateSystemState = (element: HTMLElement, state: 'READY' | 'INITIALIZING' | 'ERROR') => {
  element.setAttribute('data-diagnostic-state', state);
  element.setAttribute('data-last-sync', new Date().toISOString());
  logDiagnostic(`System state transitioned to ${state}`);
};

/**
 * Executes a diagnostic check with performance tracking.
 */
export const executeDiagnosticCheck = async (
  name: string, 
  checkFn: () => Promise<boolean> | boolean
): Promise<{ passed: boolean; duration: number }> => {
  const start = performance.now();
  try {
    const passed = await checkFn();
    const duration = parseFloat((performance.now() - start).toFixed(3));
    logDiagnostic(`Check '${name}' completed`, 'info', { passed, duration });
    return { passed, duration };
  } catch (error) {
    const duration = parseFloat((performance.now() - start).toFixed(3));
    logDiagnostic(`Check '${name}' failed`, 'error', { error, duration });
    return { passed: false, duration };
  }
};

/**
 * Aggregates results from multiple diagnostic checks.
 */
export const reportSystemHealth = (results: Record<string, boolean>) => {
  const summary = summarizeDiagnosticResults(results);
  logDiagnostic('System health report generated', summary.is_healthy ? 'info' : 'warn', summary);
  return summary;
};