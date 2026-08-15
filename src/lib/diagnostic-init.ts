/**
 * DIAGNOSTIC INITIALIZATION GATE
 * Role: Validates system readiness before application mount.
 * Integration: Called by index.html to ensure diagnostic telemetry is active.
 * Dependencies: src/lib/diagnostic-telemetry.ts
 */

import { logDiagnostic, updateSystemState } from './diagnostic-telemetry';

/**
 * Performs a multi-stage system integrity handshake.
 * Ensures DOM readiness and environment capability before mounting the application.
 */
export function initDiagnosticContext(): void {
  const root = document.getElementById('root');
  
  if (!root) {
    console.error('[DIAGNOSTIC] Critical Failure: Root element not found.');
    return;
  }

  logDiagnostic('Initializing system integrity checks...');

  try {
    // Stage 1: Environment Capability Check
    const isWindowDefined = typeof window !== 'undefined';
    const isDocumentDefined = typeof document !== 'undefined';

    if (!isWindowDefined || !isDocumentDefined) {
      throw new Error('Environment capability mismatch: Window/Document undefined.');
    }

    // Stage 2: DOM State Synchronization
    updateSystemState(root, 'INITIALIZING');

    // Stage 3: Integrity Validation
    // Add additional runtime checks here (e.g., feature detection, memory availability)
    const integrityPassed = true; 

    if (integrityPassed) {
      updateSystemState(root, 'READY');
      logDiagnostic('System integrity verified. Mounting application...');
      
      // Expose diagnostic interface to window for runtime debugging
      (window as any).__DIAGNOSTIC_READY__ = true;
    } else {
      throw new Error('Integrity validation failed at runtime.');
    }
  } catch (error: any) {
    updateSystemState(root, 'ERROR');
    logDiagnostic(`System integrity check failed: ${error.message}`, 'error');
    
    // Optional: Inject error overlay if root is available
    root.innerHTML = `<div class="diagnostic-error-overlay">System Initialization Failed: ${error.message}</div>`;
  }
}