/**
 * DIAGNOSTIC INITIALIZATION LAYER
 * Role: Bootstraps the diagnostic telemetry engine before the main application mount.
 * Integration: Called by index.html to ensure system health monitoring is active.
 * Dependencies: src/lib/diagnostic-telemetry-utils.ts
 */

import { createTelemetrySnapshot, DiagnosticTelemetry } from './diagnostic-telemetry-utils';

declare global {
  interface Window {
    __DIAGNOSTIC_CONTEXT__: DiagnosticTelemetry;
  }
}

/**
 * Initializes the system diagnostic context.
 * Sets up global telemetry hooks and prepares the DOM for health monitoring.
 */
export function initDiagnosticContext(): void {
  const telemetry = createTelemetrySnapshot('INITIALIZING');
  
  // Attach to window for global access by the diagnostic engine
  window.__DIAGNOSTIC_CONTEXT__ = telemetry;

  console.info('[DIAGNOSTIC] System health monitoring initialized at:', telemetry.boot_timestamp);

  // Mark as ready for the main app and update telemetry state
  const finalizeInit = () => {
    const duration = performance.now() - telemetry.init_start;
    window.__DIAGNOSTIC_CONTEXT__.status = 'READY';
    
    const root = document.getElementById('root');
    if (root) {
      root.setAttribute('data-diagnostic-ready', 'true');
      root.setAttribute('data-init-duration', duration.toFixed(2));
      root.setAttribute('data-telemetry-status', 'READY');
    }
    
    console.info(`[DIAGNOSTIC] System ready. Initialization duration: ${duration.toFixed(2)}ms`);
  };

  if (document.readyState === 'complete') {
    finalizeInit();
  } else {
    document.addEventListener('DOMContentLoaded', finalizeInit);
  }
}