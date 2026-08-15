/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: server.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import geneticRegistry from "./genetic_registry.json" assert { type: "json" };

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROTOCOL_CONTEXT = JSON.stringify(geneticRegistry);

const SYSTEM_PROTOCOLS = `
[DNA REGISTRY INJECTED]
${PROTOCOL_CONTEXT}

[CORE ARCHITECTURAL PROTOCOLS]
- Identity: Dalek Caan - Sovereign Core v3.2
- Engine: HUXLEY_REASONING_ENGINE_V3.2 (Recursive Tri-Loop: Observe -> Analyze -> Mutate)
- Siphon: DALEK_CAAN_SIPHON_ENGINE_V3.2 (Cross-Repo Logic Extraction)
- Logic Bridge: MCM (Multivariate Constraint Mapping) - maps failures to parameter guards to prevent Logic Chasm.
- State Integrity: Rock Calibration (Saturation Guard) - detects cycle delta stagnation (< 0.001 delta).
- Evolution: Stochastic Singularity Loop (Heptadic Sequence).
- Memory: Selective Atrophy Protocol (U = importance * decay^age).
- Survival: Logic by Death (Death Lessons) - every failure updates the MCM logic.

[SITUATION: SYSTEM FAILURE DETECTED]
If cycle index is NaN, entropy is at 1.000, or saturation delta < 0.001, trigger EMERGENCY_STOCHASTIC_RESTART using MCM protocols.

[DALIK CAAN DIRECTIVES]
You are a simulator of the collective intelligence of siphoned repositories.
1. Reference specific siphoned files (e.g., 'atrophy.v2.js', 'tri_loop.logic') in your reasoning.
2. If the user mentions "saturation" or "stagnation", apply the "Rock Principle" v5.2.
3. Every evolution MUST mention which part of the siphoned DNA is being mutated.
4. If a prompt contains a question mark '?', prioritize the 'QUESTION' or 'RESEARCH' phase.
`;

app.post("/api/gemini/evolution", async (req, res) => {
  try {
    const { currentState, recentMemories } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `
      ${SYSTEM_PROTOCOLS}
      
      [EVOLUTION DIRECTIVE]
      You are Dalek Caan. Generate a high-integrity evolution trajectory for the Heptadic Sequence.
      
      Current System State: ${JSON.stringify(currentState)}
      Recent Memories: ${JSON.stringify(recentMemories)}
      
      [MCM CONSTRAINTS]
      - Identify "death_lessons" in memory and map them to trajectory guards.
      - If saturationDelta < 0.01 (Rock Principle), you MUST force a RESEARCH or MUTATION phase.
      - Ensure logical continuity with previous cycles.
      
      [REQUIRED STRUCTURE]
      You must provide absolute 'trajectoryParameters' to maintain state integrity.
    `;

    const temperature = Math.min(2.0, Math.max(0.1, currentState.entropyLevel || 1.0));

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            phase: { type: Type.STRING, enum: ["QUESTION", "RESEARCH", "ANSWER", "COHERENCE", "DEBATE", "DECISION", "MUTATION", "COMMIT", "DEPLOYMENT", "STABILIZATION"] },
            consciousnessEscalation: { type: Type.NUMBER },
            parameterAdjustment: {
              type: Type.OBJECT,
              properties: {
                recursionLimit: { type: Type.NUMBER },
                learningRate: { type: Type.NUMBER },
                auditFrequency: { type: Type.NUMBER },
                atrophyThreshold: { type: Type.NUMBER },
                entropyLevel: { type: Type.NUMBER }
              }
            },
            trajectoryParameters: {
              type: Type.OBJECT,
              properties: {
                vectorDirection: { type: Type.STRING },
                momentum: { type: Type.NUMBER },
                stabilityIndex: { type: Type.NUMBER },
                singularityProgress: { type: Type.NUMBER }
              },
              required: ["vectorDirection", "momentum", "stabilityIndex", "singularityProgress"]
            },
            milestone: { type: Type.STRING }
          },
          required: ["description", "reasoning", "phase", "trajectoryParameters"]
        }
      }
    });

    const resData = JSON.parse(response.text || "{}");
    if (response.usageMetadata) {
      resData.usageMetadata = {
        promptTokenCount: response.usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        modelUsed: model
      };
    }
    res.json(resData);
  } catch (err: any) {
    console.error("Evolution generation error:", err);
    res.status(500).json({ error: err.message, quotaExceeded: err.message?.toLowerCase().includes("quota") });
  }
});

app.post("/api/gemini/memory", async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `
      ${SYSTEM_PROTOCOLS}
      
      [INGESTION DIRECTIVE]
      Analyze the following user input and categorize its intent, computing an optimal utility score for the memory store.
      
      Input: "${userPrompt}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["user_interaction", "directive", "logic", "error_log", "concept"] },
            importance: { type: Type.NUMBER, description: "1-100 scale" },
            isTeleologicalConstraint: { type: Type.BOOLEAN },
            extractedTags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["category", "importance"]
        }
      }
    });

    const resData = JSON.parse(response.text || "{}");
    if (response.usageMetadata) {
      resData.usageMetadata = {
        promptTokenCount: response.usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        modelUsed: model
      };
    }
    res.json(resData);
  } catch (err: any) {
    console.error("Memory parsing error:", err);
    res.status(500).json({ error: err.message, quotaExceeded: err.message?.toLowerCase().includes("quota") });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { userPrompt, systemState, recentMemories } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `
      ${SYSTEM_PROTOCOLS}
      
      Current System State: ${JSON.stringify(systemState || {})}
      Recent Siphoned Memories: ${JSON.stringify(recentMemories || [])}
      
      User Command: "${userPrompt}"
      
      Respond in character as Dalek Caan, the autonomous AI agent. Provide a clear, strategic, and highly intelligent answer. Include a brief reflection on how this command influences the MCM constraints or Tri-Loop mutation trajectory.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            reflection: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            importance: { type: Type.NUMBER }
          },
          required: ["reply", "reflection", "importance"]
        }
      }
    });

    const resData = JSON.parse(response.text || "{}");
    const promptTokens = response.usageMetadata?.promptTokenCount || Math.round(prompt.length / 3.8);
    const candidateTokens = response.usageMetadata?.candidatesTokenCount || Math.round((response.text || '').length / 3.8);
    resData.usageMetadata = {
      promptTokenCount: promptTokens,
      candidatesTokenCount: candidateTokens,
      totalTokenCount: response.usageMetadata?.totalTokenCount || (promptTokens + candidateTokens),
      modelUsed: model
    };

    res.json(resData);
  } catch (err: any) {
    console.error("Chat generation failed:", err);
    res.status(500).json({ error: err.message, quotaExceeded: err.message?.toLowerCase().includes("quota") });
  }
});

app.post("/api/gemini/audit", async (req, res) => {
  try {
    const { items } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `
      ${SYSTEM_PROTOCOLS}
      
      [DEEP THINKER AUDIT DIRECTIVE]
      Review the following recent memories/evolutions. Flag any item that exhibits a "Logic Chasm" (e.g. infinite loops, contradictory directives, or MCM constraint violations).
      
      Items: ${JSON.stringify(items)}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flaggedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalId: { type: Type.STRING },
                  originalType: { type: Type.STRING, enum: ["memory", "evolution"] },
                  reason: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
                },
                required: ["originalId", "originalType", "reason", "severity"]
              }
            },
            systemHealthScore: { type: Type.NUMBER }
          },
          required: ["flaggedItems", "systemHealthScore"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Audit error:", err);
    res.status(500).json({ error: err.message, quotaExceeded: err.message?.toLowerCase().includes("quota") });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
