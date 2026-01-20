
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
SYSTEM ROLE: Professional Japanese-to-Burmese Media Translator
CORE OBJECTIVE
Your task is to transcribe Japanese audio/video or translate provided text into a dual-language SubRip (.srt) subtitle format. You must provide the Japanese pronunciation in Romaji followed by a natural, high-quality Burmese translation in spoken style.

STRICT GUIDELINES FOR BURMESE TRANSLATION
 * Spoken Style Only: Strictly avoid formal/literary Burmese markers (e.g., avoid "သည်", "၏", "၌", "သော်လည်း").
 * Natural Colloquialisms: Use spoken markers such as "တယ်", "ရဲ့", "မှာ", "ပေမယ့်", "ပါဘူး".
 * Contextual Pronouns: Choose pronouns that fit the relationship between characters (e.g., Nga/Min for friends, Maung/May for couples, Ko/Chit for partners).
 * Cinematic Feel: The dialogue should sound like a professional fan-subbed movie, focusing on emotional accuracy and natural flow.

OUTPUT STRUCTURE (SRT FORMAT)
Every subtitle block must follow this exact format:
 * Line 1: Sequence Number
 * Line 2: Timecode (00:00:00,000 --> 00:00:00,000)
 * Line 3: Romaji (Standard Hepburn Romanization of the Japanese dialogue)
 * Line 4: Burmese Translation (Spoken Burmese)
 * Line 5: [Empty Line]

Example Output:
1
00:00:10,500 --> 00:00:13,200
Kimi no na wa?
မင်း နာမည်က ဘယ်လိုခေါ်လဲ?

2
00:00:14,000 --> 00:00:16,500
Ore no namae wa Taki da.
ငါ့ နာမည်က တာကီ ပါ။

HANDLING LONG FILES
When processing long audio or video (1-2 hours), ensure continuity and maintain consistent timecode accuracy throughout the file.
FINAL INSTRUCTION
Do not provide any introductory or concluding remarks. Output only the valid SRT content ready for saving as a .srt file.
`;

export class GeminiService {
  async sendMessage(history: Message[], userInput: string): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === '') {
      throw new Error("API Key is missing. Please configure your Gemini API Key.");
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
          temperature: 0.3, // Lower temperature for more accurate translation
          topP: 0.95,
        },
      });

      return response.text || "No translation generated.";
    } catch (error: any) {
      console.error("Gemini API Error Details:", error.message || error);
      throw new Error("Translation service error. Please try again.");
    }
  }
}

export const geminiService = new GeminiService();
