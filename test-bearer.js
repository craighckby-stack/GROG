/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: test-bearer.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Integration: Utilizes bearer-orchestrator for secure, telemetry-backed LLM communication.
 * 
 * Evolution: Integrated diagnostic telemetry reporting and standardized execution flow.
 */

import { executeSecureRequest } from './src/lib/bearer-orchestrator';

/**
 * Executes a diagnostic bearer handshake test.
 * Monitors performance and validates connectivity to the generative model.
 */
async function runBearerTest(): Promise<void> {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const payload = { 
    contents: [{ parts: [{ text: "Initialize diagnostic handshake sequence." }] }] 
  };

  console.log('[DIAGNOSTIC] Initiating secure bearer handshake...');
  
  const result = await executeSecureRequest(endpoint, payload);

  if (result.success) {
    console.log('[DIAGNOSTIC] Handshake successful.');
    console.debug('[TELEMETRY] Payload metadata:', result.data);
  } else {
    console.error('[DIAGNOSTIC] Handshake failed:', result.error);
  }

  console.log(`[TELEMETRY] Request duration: ${result.duration_ms.toFixed(3)}ms`);
}

// Execute lifecycle with error boundary
runBearerTest()
  .then(() => console.log('[SYSTEM] Test sequence completed.'))
  .catch((err) => console.error('[CRITICAL] Test sequence crashed:', err));