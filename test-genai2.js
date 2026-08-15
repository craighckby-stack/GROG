import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ bearerToken: process.env.GEMINI_API_KEY });
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
