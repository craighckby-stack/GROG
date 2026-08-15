/**
 * GEMINI SERVICE
 * Role: Provides high-level interfaces for interacting with the Gemini API backend.
 * Integration: Orchestrates evolution, memory processing, and chat generation via the API Orchestrator.
 * Dependencies: src/services/api-orchestrator.ts
 */

import { executeApiCall } from "./api-orchestrator";

export async function generateEvolution(currentState: any, recentMemories: any[]) {
  const result = await executeApiCall("/api/gemini/evolution", { currentState, recentMemories });
  
  if (result.error) {
    console.error("Evolution generation error:", result.error);
    return {
      description: `[SYSTEM ERROR: ${result.error}]`,
      reasoning: "API validation failed. Mutation aborted.",
      phase: "MUTATION",
      trajectoryParameters: { vectorDirection: "HALT", momentum: 0, stabilityIndex: 0, singularityProgress: 0 },
      usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }
    };
  }
  return result.data;
}

export async function processMemory(userPrompt: string) {
  const result = await executeApiCall("/api/gemini/memory", { userPrompt });
  
  if (result.error) {
    console.error("Memory parsing error:", result.error);
    return {
      category: "error_log",
      importance: 100,
      extractedTags: ["API_ERROR", "SYSTEM_HALT"]
    };
  }
  return result.data;
}

export async function generateChatResponse(userPrompt: string, systemState: any, recentMemories: any[]) {
  const result = await executeApiCall("/api/gemini/chat", { userPrompt, systemState, recentMemories });
  
  if (result.error) {
    console.error("Chat generation error:", result.error);
    return {
      reply: `[SYSTEM ERROR: API Key Validation Failed. ${result.error}]`,
      reflection: "CRITICAL: Sovereign engine halted due to API credential rejection.",
      usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }
    };
  }
  return result.data;
}

export async function auditItems(items: any[]) {
  const result = await executeApiCall("/api/gemini/audit", { items });
  
  if (result.error) {
    console.error("Audit error:", result.error);
    return {
      flaggedItems: [{
        originalId: "system-audit",
        originalType: "memory",
        reason: `API Key Validation Failed. ${result.error}`,
        severity: "CRITICAL"
      }],
      systemHealthScore: 0
    };
  }
  return result.data;
}

export async function suggestRepair(item: any, systemState: any) {
  // Placeholder for future implementation
  return null;
}