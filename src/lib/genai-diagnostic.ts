/**
 * GENAI DIAGNOSTIC UTILITIES
 * Role: Validates GenAI environment and provides structured telemetry logging.
 * Integration: Used by test-genai2.js to ensure operational integrity.
 */

export interface DiagnosticResult {
  passed: boolean;
  message: string;
}

/**
 * Validates that the required environment variables are present.
 */
export function validateGenAIEnv(): DiagnosticResult {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      passed: false,
      message: 'GEMINI_API_KEY is missing from environment variables.'
    };
  }
  return { passed: true, message: 'Environment validated.' };
}

/**
 * Logs telemetry data for GenAI operations.
 */
export function logGenAITelemetry(operation: string, duration: number, success: boolean) {
  const timestamp = new Date().toISOString();
  console.log(`[TELEMETRY] ${timestamp} | Op: ${operation} | Duration: ${duration.toFixed(2)}ms | Success: ${success}`);
}
