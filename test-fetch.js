/**
 * ARCHITECTURAL DIAGNOSTIC FETCH UTILITY
 * Role: Validates Gemini API connectivity and model responsiveness.
 * Integration: Uses diagnostic-telemetry for performance tracking and environment validation.
 * Dependencies: src/lib/diagnostic-telemetry.ts
 */

import { formatTelemetry, validateApiKey } from './src/lib/diagnostic-telemetry';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Executes a diagnostic probe against the Gemini API.
 * Implements structured error handling and telemetry reporting.
 */
async function runDiagnosticFetch() {
  const startTime = performance.now();
  
  if (!validateApiKey(GEMINI_API_KEY)) {
    console.error('[DIAGNOSTIC] Critical Failure: Invalid or missing GEMINI_API_KEY');
    return;
  }

  try {
    console.log('[DIAGNOSTIC] Initiating probe...');
    
    const response = await fetch(`${MODEL_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: "Perform system diagnostic: confirm connectivity." }] }] 
      })
    });

    const duration = performance.now() - startTime;
    const telemetry = formatTelemetry(duration);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DIAGNOSTIC] Probe Failed:', { status: response.status, error: errorData, ...telemetry });
      return;
    }

    const data = await response.json();
    console.log('[DIAGNOSTIC] Probe Successful:', { 
      status: 'HEALTHY', 
      response: data.candidates?.[0]?.content?.parts?.[0]?.text,
      ...telemetry 
    });

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('[DIAGNOSTIC] Critical Network Failure:', { 
      error: error instanceof Error ? error.message : String(error),
      ...formatTelemetry(duration)
    });
  }
}

// Execute diagnostic sequence
runDiagnosticFetch();