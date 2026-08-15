/**
 * BEARER ORCHESTRATOR
 * Role: Handles secure API communication with diagnostic-aware telemetry.
 * Integration: Used by test-bearer.js for robust LLM interaction.
 */

export interface BearerResponse {
  success: boolean;
  data?: any;
  error?: string;
  duration_ms: number;
}

export async function executeSecureRequest(endpoint: string, payload: any): Promise<BearerResponse> {
  const start = performance.now();
  const token = process.env.GEMINI_API_KEY;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const duration = performance.now() - start;

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    return { success: true, data, duration_ms: duration };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      duration_ms: performance.now() - start 
    };
  }
}