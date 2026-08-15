/**
 * GENAI DIAGNOSTIC UTILITIES
 * Role: Validates GenAI environment and provides telemetry-wrapped execution.
 */

export interface GenAIDiagnosticResult {
  passed: boolean;
  message: string;
  timestamp: string;
}

export function validateGenAIEnv(): GenAIDiagnosticResult {
  const hasKey = !!process.env.GEMINI_API_KEY;
  return {
    passed: hasKey,
    message: hasKey ? 'GEMINI_API_KEY detected' : 'GEMINI_API_KEY missing from environment',
    timestamp: new Date().toISOString()
  };
}

export function logGenAITelemetry(operation: string, duration: number, success: boolean) {
  console.log(`[TELEMETRY] Op: ${operation} | Duration: ${duration.toFixed(2)}ms | Success: ${success}`);
}