
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProductRecommendations(query: string, products: Product[]) {
  const model = 'gemini-3-flash-preview';
  
  const productContext = products.map(p => `- ${p.name}: ${p.description} ($${p.price})`).join('\n');
  
  const prompt = `
    You are a professional Digital Business Consultant for "Digital Service Store".
    The user is looking for digital services to grow their business.
    A user asks: "${query}"
    
    Here is our service menu:
    ${productContext}
    
    Based on the user's business needs, suggest 2-3 digital services. Explain how these specific services will help their business scale and succeed. 
    Keep your response professional, helpful, and in a tone that builds trust. Respond in English.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, the AI recommendation system is currently unavailable. Please browse our services manually.";
  }
}
