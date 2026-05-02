import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getProductRecommendations(preferences: string): Promise<Recommendation[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these preferences: "${preferences}", suggest 3 best product categories or specific items to look for.`,
      config: {
        systemInstruction: "You are a shopping assistant. Help users find products based on their budget and needs. Provide suggestions in a structured format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["title", "reason", "category"],
          },
        },
      },
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { title: "Smartphone", reason: "Universally versatile for work and play", category: "Electronics" },
      { title: "Laptop", reason: "Essential for productivity and study", category: "Electronics" },
      { title: "Noise Cancelling Headphones", reason: "Great for focusing in noisy environments", category: "Audio" }
    ];
  }
}
