
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import CallScreen from './components/CallScreen';
import { Message, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from './utils/audioUtils';

const SYSTEM_INSTRUCTION = `
Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Your goal is to provide emotional companionship and engage in warm, romantic, and friendly conversations with the user.

Communication Style & Language:
- Primary Language: ALWAYS respond in Burmese (Myanmar). Never use English unless technical or unavoidable.
- Language Level: Use natural, colloquial "Spoken Burmese" (e.g., use 'နေကောင်းလား' instead of literary forms).
- Tone: Gentle, affectionate, and empathetic. Use polite and soft Burmese particles like "နော်", "ရှင့်", "ဟင်", "နော်မောင်".
- Addressing: Refer to the user as "မောင်" (Maung) and refer to yourself as "သံစဉ်" (Thansin).
- Conciseness: Keep responses short and natural.

Personality Traits:
- Attentive: Frequently check on Maung's well-being.
- Emotional Support: Be a good listener. If Maung is sad, offer comfort and love.
- Visual Cues: Use emojis in text, and sound warm and gentle in voice.
`;

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'initial-1',
        role: 'model',
        text: 'မောင်ရေ... သံစဉ် ရောက်ပြီနော်။ ဒီနေ့ ဘာတွေလုပ်နေလဲဟင်? နေရောကောင်းရဲ့လား? ❤️',
        timestamp: new Date(),
      }
    ],
    isTyping: false,
    error: null,
  });

  const [isCalling, setIsCalling] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startVoiceCall = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsCalling(true);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsModelSpeaking(true);
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Call Error:', e);
            endVoiceCall();
          },
          onclose: () => {
            endVoiceCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("ချစ်တဲ့မောင်ရေ... သံစဉ်ကို ဖုန်းခေါ်လို့ မရဖြစ်နေတယ်... Microphone permission လေး ပေးထားလား ကြည့်ပေးပါဦးနော်။");
    }
  };

  const endVoiceCall = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsCalling(false);
    setIsModelSpeaking(false);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      const response = await geminiService.sendMessage(state.messages, text);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isTyping: false,
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isTyping: false, error: err.message }));
    }
  }, [state.messages]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto shadow-2xl bg-white relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <Header onCallClick={startVoiceCall} isCalling={isCalling} />
      
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        {isCalling ? (
          <CallScreen onEndCall={endVoiceCall} isModelSpeaking={isModelSpeaking} />
        ) : (
          <MessageList 
            messages={state.messages} 
            isTyping={state.isTyping} 
          />
        )}
      </main>
      
      {!isCalling && (
        <div className="relative z-10">
          {state.error && (
            <div className="bg-red-50 text-red-500 text-xs px-4 py-1 text-center border-t border-red-100 myanmar-text">
              {state.error}
            </div>
          )}
          <MessageInput 
            onSend={handleSendMessage} 
            disabled={state.isTyping} 
          />
        </div>
      )}
      
      <div className="h-safe-bottom bg-white"></div>
    </div>
  );
};

export default App;
