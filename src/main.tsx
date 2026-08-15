/**
 * ARCHITECTURAL ENTRY POINT: src/main.tsx
 * Role: Initializes the application root and triggers the system diagnostic pipeline.
 * Integration: Connects to 'src/lib/diagnostic-init.ts' to ensure kernel integrity 
 * before mounting the React application tree.
 * 
 * Mutation: Implemented asynchronous bootstrap sequence with diagnostic-aware 
 * lifecycle management to ensure system health prior to DOM injection.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSystemDiagnostics } from './lib/diagnostic-init';

/**
 * Bootstraps the application after verifying system health.
 * The diagnostic initialization ensures that all required memory layers 
 * and sandbox environments are ready for the React lifecycle.
 * 
 * @throws {Error} If the root element is missing from the DOM.
 */
async function bootstrap(): Promise<void> {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('CRITICAL: Root element not found: Application cannot mount.');
  }

  try {
    // Execute pre-render diagnostic suite to validate environment integrity
    // This aligns with the AI_Agent_OS kernel-first boot pattern
    const diagnosticReport = await initializeSystemDiagnostics();
    
    if (diagnosticReport && !diagnosticReport.summary.is_healthy) {
      console.warn('SYSTEM DIAGNOSTICS: Environment is degraded. Proceeding with caution.', diagnosticReport);
    } else {
      console.info('SYSTEM DIAGNOSTICS: Kernel integrity verified.');
    }
  } catch (error) {
    // Log failure but allow mounting to permit UI-based error recovery
    console.error('CRITICAL: System diagnostic failure during boot sequence:', error);
  }

  // Mount the React application tree
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Execute the boot sequence with error handling for the global scope
bootstrap().catch((err) => {
  console.error('FATAL: Application failed to bootstrap:', err);
});