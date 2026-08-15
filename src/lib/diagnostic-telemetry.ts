/**
 * DIAGNOSTIC TELEMETRY CORE
 * Role: Provides standardized telemetry logging and system state reporting.
 */

export interface SystemTelemetry {
  timestamp: string;
  status: 'READY' | 'INITIALIZING' | 'ERROR';
  memory_usage?: number;
}

export const logDiagnostic = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [DIAGNOSTIC] ${message}`;
  if (level === 'error') console.error(formatted);
  else if (level === 'warn') console.warn(formatted);
  else console.info(formatted);
};

export const updateSystemState = (element: HTMLElement, state: string) => {
  element.setAttribute('data-diagnostic-state', state);
  element.setAttribute('data-last-sync', new Date().toISOString());
};