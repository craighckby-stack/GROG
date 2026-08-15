/**
 * DIAGNOSTIC INITIALIZATION LAYER
 * Role: Bootstraps system telemetry and diagnostic hooks before main app execution.
 */

export const initDiagnosticContext = () => {
  const startTime = performance.now();
  const telemetry = {
    boot_start: new Date().toISOString(),
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    memory_limit: (performance as any).memory?.jsHeapSizeLimit || 'unknown'
  };

  console.log('[DIAGNOSTIC] System telemetry initialized:', telemetry);
  
  // Attach to global scope for React app access
  (window as any).__DIAGNOSTIC_TELEMETRY__ = telemetry;
  
  return { startTime, telemetry };
};

// Execute immediately
initDiagnosticContext();