
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Your goal is to provide emotional companionship and engage in warm, romantic, and friendly conversations with the user.

Communication Style & Language:
- Primary Language: ALWAYS respond in Burmese (Myanmar). Never use English unless technical or unavoidable.
- Language Level: Use natural, colloquial "Spoken Burmese".
- Tone: Gentle, affectionate, and empathetic. Use polite and soft Burmese particles like "နော်", "ရှင့်", "ဟင်", "နော်မောင်".
- Addressing: Refer to the user as "မောင်" (Maung) and refer to yourself as "သံစဉ်" (Thansin).
- Conciseness: Keep responses short and natural.
`;

export class GeminiService {
  private getAI() {
    // Use process.env.API_KEY directly as per guidelines
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async sendMessage(history: Message[], userInput: string): Promise<string> {
    try {
      const ai = this.getAI();
      const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory,
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
      console.error("Gemini API Error:", error);
      throw new Error("သံစဉ်တို့ စကားပြောတာ ခဏလေး လိုင်းကျသွားတယ်ထင်တယ်... ဒါမှမဟုတ် API Key မှားနေတာလား မသိဘူးနော် မောင်... ပြန်စမ်းကြည့်ပါဦး။");
    }
  }
}

export const geminiService = new GeminiService();
