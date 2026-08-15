export async function generateEvolution(currentState: any, recentMemories: any[]) {
  try {
    const res = await fetch("/api/gemini/evolution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentState, recentMemories })
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.quotaExceeded) return { quotaExceeded: true };
      throw new Error(err.error || "Evolution failed");
    }
    return await res.json();
  } catch (error: any) {
    console.error("Evolution generation error:", error);
    return {
      description: `[SYSTEM ERROR: ${error.message}]`,
      reasoning: "API validation failed. Mutation aborted.",
      phase: "MUTATION",
      trajectoryParameters: { vectorDirection: "HALT", momentum: 0, stabilityIndex: 0, singularityProgress: 0 },
      usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }
    };
  }
}

export async function processMemory(userPrompt: string) {
  try {
    const res = await fetch("/api/gemini/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt })
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.quotaExceeded) return { quotaExceeded: true };
      throw new Error(err.error || "Memory process failed");
    }
    return await res.json();
  } catch (error: any) {
    console.error("Memory parsing error:", error);
    return {
      category: "error_log",
      importance: 100,
      extractedTags: ["API_ERROR", "SYSTEM_HALT"]
    };
  }
}

export async function generateChatResponse(userPrompt: string, systemState: any, recentMemories: any[]) {
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, systemState, recentMemories })
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.quotaExceeded) return { quotaExceeded: true };
      throw new Error(err.error || "Chat generation failed");
    }
    return await res.json();
  } catch (error: any) {
    console.error("Chat generation error:", error);
    return {
      reply: `[SYSTEM ERROR: API Key Validation Failed. ${error.message}]`,
      reflection: "CRITICAL: Sovereign engine halted due to API credential rejection.",
      usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }
    };
  }
}

export async function auditItems(items: any[]) {
  try {
    const res = await fetch("/api/gemini/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.quotaExceeded) return { quotaExceeded: true };
      throw new Error(err.error || "Audit failed");
    }
    return await res.json();
  } catch (error: any) {
    console.error("Audit error:", error);
    return {
      flaggedItems: [{
        originalId: "system-audit",
        originalType: "memory",
        reason: `API Key Validation Failed. ${error.message}`,
        severity: "CRITICAL"
      }],
      systemHealthScore: 0
    };
  }
}

export async function suggestRepair(item: any, systemState: any) {
  return null; // Deprecated or unimplemented in server currently
}
