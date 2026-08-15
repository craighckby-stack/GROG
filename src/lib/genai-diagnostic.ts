/**
 * GENAI DIAGNOSTIC LAYER
 * Role: Validates GenAI environment and provides telemetry primitives.
 */

export interface DiagnosticResult {
  passed: boolean;
  message: string;
}

export function validateGenAIEnv(): DiagnosticResult {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { passed: false, message: 'GEMINI_API_KEY missing in environment' };
  }
  return { passed: true, message: 'Environment validated' };
}

export function logGenAITelemetry(operation: string, duration: number, success: boolean) {
  console.log(`[TELEMETRY] Op: ${operation} | Duration: ${duration.toFixed(2)}ms | Success: ${success}`);
}