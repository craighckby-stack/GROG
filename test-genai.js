/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: test-genai.js
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
run();
