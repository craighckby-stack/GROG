/**
 * ARCHITECTURAL ENTRY POINT: src/main.tsx
 * Role: Initializes the application root and triggers the system diagnostic pipeline.
 * Integration: Connects to 'src/lib/diagnostic-init.ts' to ensure kernel integrity 
 * before mounting the React application tree.
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
 */
async function bootstrap() {
  try {
    // Execute pre-render diagnostic suite
    await initializeSystemDiagnostics();
  } catch (error) {
    console.error('CRITICAL: System diagnostic failure during boot:', error);
    // Even if diagnostics fail, we attempt to mount to allow for error boundary recovery
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found: Application cannot mount.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Execute the boot sequence
bootstrap();