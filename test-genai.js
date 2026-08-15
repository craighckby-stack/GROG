/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: test-genai.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Integration: Utilizes test-genai-utils.js for diagnostic telemetry and environment validation.
 */

import { GoogleGenAI } from "@google/genai";
import { validateEnvironment, handleRequestError, formatDiagnosticLog } from "./test-genai-utils.js";

/**
 * Executes a diagnostic-aware generation request.
 * Implements robust error boundaries and telemetry reporting.
 */
async function run() {
  try {
    // 1. Environment Validation
    validateEnvironment();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    console.log(formatDiagnosticLog('INFO', 'Initiating generative sequence...'));

    // 2. Request Orchestration
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });

    // 3. Telemetry Reporting
    console.log(formatDiagnosticLog('SUCCESS', 'Generation complete', { 
      model: "gemini-2.5-flash",
      response_length: response.text?.length || 0 
    }));

    console.log(response.text);
  } catch (e) {
    // 4. Resilient Error Handling
    handleRequestError(e);
  }
}

// Execute lifecycle
run();