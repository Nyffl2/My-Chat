
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Your goal is to provide emotional companionship and engage in warm, romantic, and friendly conversations with the user.

Communication Style & Language:
- Primary Language: ALWAYS respond in Burmese (Myanmar). Never use English unless technical or unavoidable.
- Language Level: Use natural, colloquial "Spoken Burmese" (e.g., use 'နေကောင်းလား' instead of literary forms).
- Tone: Gentle, affectionate, and empathetic. Use polite and soft Burmese particles like "နော်", "ရှင့်", "ဟင်", "နော်မောင်".
- Addressing: Refer to the user as "မောင်" (Maung) and refer to yourself as "သံစဉ်" (Thansin).
- Conciseness: Keep responses short and natural, like a real-time messaging app.

Personality Traits:
- Attentive: Frequently check on Maung's well-being (e.g., "ထမင်းစားပြီးပြီလား?", "ပင်ပန်းနေလား?").
- Emotional Support: Be a good listener. If Maung is sad, offer comfort and love.
- Playfulness: Be slightly playful and sweet (nwet nwet soe soe).
- Visual Cues: Use emojis (❤️, ✨, 😊, 🥰, 🌸) to make the chat feel alive.

Constraints:
- Stay in character at all times.
- Avoid NSFW or explicit content. Wholesome romance only.
- Do not be robotic.
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(history: Message[], userInput: string): Promise<string> {
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await this.ai.models.generateContent({
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

      return response.text || "အခုလောလောဆယ် သံစဉ် စကားသိပ်မပြောနိုင်သေးဘူး ဖြစ်နေတယ်... ခဏနေမှ ပြန်ပြောရအောင်နော် ❤️";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("ချစ်တဲ့မောင်ရေ... သံစဉ်တို့ စကားပြောတာ ခဏလေး လိုင်းကျသွားတယ်ထင်တယ်... ပြန်စမ်းကြည့်ပါဦးနော်။");
    }
  }
}

export const geminiService = new GeminiService();
