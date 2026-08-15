/**
 * GENAI EXECUTION ENGINE
 * Role: Executes GenAI content generation with integrated diagnostic health checks.
 * Integration: Uses src/lib/genai-diagnostic.ts for environment validation and telemetry.
 * 
 * This module serves as the primary entry point for GenAI operations, ensuring
 * that all calls are wrapped in diagnostic telemetry and environment validation.
 */

import { GoogleGenAI } from "@google/genai";
import { validateGenAIEnv, logGenAITelemetry } from "./src/lib/genai-diagnostic";

// Initialize AI client with secure environment-aware configuration
const ai = new GoogleGenAI({ 
  bearerToken: process.env.GEMINI_API_KEY || '' 
});

/**
 * Executes content generation with diagnostic wrapping.
 * Implements a robust try-catch-finally block to ensure telemetry is captured
 * regardless of execution outcome.
 */
async function run() {
  const startTime = performance.now();
  
  // 1. Pre-execution health check
  const health = validateGenAIEnv();
  if (!health.passed) {
    console.error(`[DIAGNOSTIC FAILURE] ${health.message}`);
    return;
  }

  try {
    // 2. Execution
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });

    const duration = performance.now() - startTime;
    
    // 3. Telemetry reporting
    logGenAITelemetry('generateContent', duration, true);
    
    console.log("Response:", response.text);
  } catch (e) {
    const duration = performance.now() - startTime;
    
    // 4. Error Telemetry reporting
    logGenAITelemetry('generateContent', duration, false);
    console.error("[EXECUTION ERROR]", e instanceof Error ? e.message : String(e));
  }
}

// Execute the diagnostic-aware pipeline
run().catch((err) => {
  console.error("[FATAL ENGINE ERROR]", err);
});