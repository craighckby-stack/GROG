/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: test-bearer.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Integration: Utilizes bearer-orchestrator for secure, telemetry-backed LLM communication.
 */

import { executeSecureRequest } from './src/lib/bearer-orchestrator';

async function runBearerTest() {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const payload = { contents: [{ parts: [{ text: "hello" }] }] };

  console.log('[DIAGNOSTIC] Initiating secure bearer handshake...');
  
  const result = await executeSecureRequest(endpoint, payload);

  if (result.success) {
    console.log('[DIAGNOSTIC] Handshake successful:', result.data);
  } else {
    console.error('[DIAGNOSTIC] Handshake failed:', result.error);
  }

  console.log(`[TELEMETRY] Request duration: ${result.duration_ms.toFixed(3)}ms`);
}

// Execute lifecycle
runBearerTest().catch(console.error);