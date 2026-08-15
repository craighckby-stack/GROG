/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: server.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 * Integration: Now includes pre-flight diagnostic gating for system integrity.
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import geneticRegistry from "./genetic_registry.json" assert { type: "json" };
import { runSystemDiagnostics } from "./lib/diagnostic-engine";

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
            trajectoryParameters: {
              type: Type.OBJECT,
              properties: {
                vectorDirection: { type: Type.STRING },
                momentum: { type: Type.NUMBER },
                stabilityIndex: { type: Type.NUMBER },
                singularityProgress: { type: Type.NUMBER }
              },
              required: ["vectorDirection", "momentum", "stabilityIndex", "singularityProgress"]
            }
          },
          required: ["description", "reasoning", "phase", "trajectoryParameters"]
        }
      }
    });

    const resData = JSON.parse(response.text || "{}");
    res.json(resData);
  } catch (err: any) {
    console.error("Evolution generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gemini/memory", async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `${SYSTEM_PROTOCOLS} [INGESTION DIRECTIVE] Analyze: "${userPrompt}"`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["user_interaction", "directive", "logic", "error_log", "concept"] },
            importance: { type: Type.NUMBER }
          },
          required: ["category", "importance"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { userPrompt, systemState, recentMemories } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `${SYSTEM_PROTOCOLS} Current State: ${JSON.stringify(systemState || {})} User Command: "${userPrompt}"`;

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
            importance: { type: Type.NUMBER }
          },
          required: ["reply", "reflection", "importance"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gemini/audit", async (req, res) => {
  try {
    const { items } = req.body;
    const model = "gemini-2.5-flash";
    const prompt = `${SYSTEM_PROTOCOLS} [AUDIT DIRECTIVE] Flag Logic Chasms in: ${JSON.stringify(items)}`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flaggedItems: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            systemHealthScore: { type: Type.NUMBER }
          },
          required: ["flaggedItems", "systemHealthScore"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  // Pre-flight Diagnostic Gate
  const diagnostics = await runSystemDiagnostics();
  if (diagnostics.status !== 'HEALTHY') {
    console.error("CRITICAL SYSTEM FAILURE: Diagnostic gate failed.", diagnostics);
    process.exit(1);
  }
  console.log("System Diagnostics Passed. Initializing Kernel...");

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