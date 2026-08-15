/**
 * GENAI EXECUTION ENGINE
 * Role: Executes GenAI content generation with integrated diagnostic health checks.
 * Integration: Uses src/lib/genai-diagnostic.ts for environment validation and telemetry.
 */

import { GoogleGenAI } from "@google/genai";
import { validateGenAIEnv, logGenAITelemetry } from "./src/lib/genai-diagnostic";

// Initialize AI client with secure environment-aware configuration
const ai = new GoogleGenAI({ 
  bearerToken: process.env.GEMINI_API_KEY || '' 
});

/**
 * Executes content generation with diagnostic wrapping
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
    logGenAITelemetry('generateContent', duration, false);
    console.error("[EXECUTION ERROR]", e);
  }
}

// Execute the diagnostic-aware pipeline
run();