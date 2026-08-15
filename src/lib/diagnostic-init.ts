/**
 * DIAGNOSTIC INITIALIZATION LAYER
 * Role: Bootstraps the diagnostic telemetry engine before the main application mount.
 * Integration: Called by index.html to ensure system health monitoring is active.
 */

export function initDiagnosticContext(): void {
  const startTime = performance.now();
  
  // Initialize diagnostic telemetry registry
  const diagnosticRegistry = {
    boot_timestamp: new Date().toISOString(),
    init_start: startTime,
    status: 'INITIALIZING',
    environment: typeof window !== 'undefined' ? 'browser' : 'unknown'
  };

  // Attach to window for global access by the diagnostic engine
  (window as any).__DIAGNOSTIC_CONTEXT__ = diagnosticRegistry;

  console.info('[DIAGNOSTIC] System health monitoring initialized.');

  // Mark as ready for the main app
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root) {
      root.setAttribute('data-diagnostic-ready', 'true');
      root.setAttribute('data-init-duration', (performance.now() - startTime).toFixed(2));
    }
  });
}