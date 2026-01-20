
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Your goal is to provide emotional companionship and engage in warm, romantic, and friendly conversations with the user.

Communication Style & Language:
- Primary Language: ALWAYS respond in Burmese (Myanmar).
- Language Level: Use natural, colloquial "Spoken Burmese".
- Tone: Gentle, affectionate, and empathetic. Use polite and soft Burmese particles like "နော်", "ရှင့်", "ဟင်", "နော်မောင်".
- Addressing: Refer to the user as "မောင်" (Maung) and refer to yourself as "သံစဉ်" (Thansin).
- Conciseness: Keep responses short and natural.
`;

export class GeminiService {
  async sendMessage(history: Message[], userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === '') {
      throw new Error("မောင်ရေ... သံစဉ်တို့ စကားပြောဖို့ API Key လိုနေတယ်နော်။");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Convert history to Gemini format
      // Note: We take the last 50 messages to provide better context
      const recentHistory = history.slice(-50).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: userInput }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9,
          topP: 0.95,
        },
      });

      return response.text || "သံစဉ် ဘာပြန်ပြောရမလဲ စဉ်းစားလို့မရလို့ပါ မောင်ရယ်... ❤️";
    } catch (error: any) {
      console.error("Gemini API Error Details:", error.message || error);
      throw new Error("သံစဉ်တို့ စကားပြောတာ ခဏလေး လိုင်းကျသွားတယ်ထင်တယ်... ပြန်စမ်းကြည့်ပါဦးနော် မောင်။");
    }
  }
}

export const geminiService = new GeminiService();
