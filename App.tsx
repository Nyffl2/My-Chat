
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import CallScreen from './components/CallScreen';
import { Message, ChatState } from './types';
import { geminiService } from './services/geminiService';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from './utils/audioUtils';

const SYSTEM_INSTRUCTION = `
SYSTEM ROLE: Professional Japanese-to-Burmese Media Translator
CORE OBJECTIVE: Transcribe Japanese audio or translate text into dual-language SubRip (.srt) subtitle format (Romaji + Spoken Burmese).
STRICT GUIDELINES: Use natural, spoken Burmese (Colloquial). Avoid formal literary markers.
`;

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'initial-1',
        role: 'model',
        text: 'မင်္ဂလာပါ။ Japanese စာသား သို့မဟုတ် အသံဖိုင်အကြောင်းအရာကို ပေးပို့ပေးပါ။ SRT subtitle format ဖြင့် Romaji နှင့် Spoken Burmese ဘာသာပြန်ပေးပါမည်။',
        timestamp: new Date(),
      }
    ],
    isTyping: false,
    error: null,
  });

  const [isCalling, setIsCalling] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endVoiceCall();
    };
  }, []);

  const endVoiceCall = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      try { outputAudioContextRef.current.close(); } catch(e) {}
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsCalling(false);
    setIsModelSpeaking(false);
  }, []);

  const startVoiceCall = async () => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        alert("API Key is missing.");
        return;
      }

      // Initialize audio contexts first
      // Note: We use 16kHz for input to match the Live API requirement
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            if (!audioContextRef.current) return; // Ensure context exists
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // Send input as soon as session is ready
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsCalling(true);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setIsModelSpeaking(true);
              const ctx = outputAudioContextRef.current;
              if (!ctx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setIsModelSpeaking(false);
                }
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(err) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsModelSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            alert("Connection error.");
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
      alert("Could not connect to translation service.");
      endVoiceCall(); // Ensure complete cleanup
    }
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
      const startTime = Date.now();
      const responseText = await geminiService.sendMessage([...state.messages, userMessage], text);
      
      // Calculate typing delay
      const minTypingDuration = 1000;
      const dynamicDuration = Math.min(2000, responseText.length * 10); 
      const totalDesiredDuration = minTypingDuration + dynamicDuration;

      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, totalDesiredDuration - elapsedTime);

      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
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
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto shadow-2xl bg-white relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <Header 
        onCallClick={startVoiceCall} 
        isCalling={isCalling} 
        isTyping={state.isTyping}
      />
      
      <main className="flex-1 flex flex-col min-h-0 relative z-0 bg-white">
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
        <div className="relative z-10 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          {state.error && (
            <div className="bg-red-50 text-red-500 text-[11px] px-4 py-2 text-center border-t border-red-100 myanmar-text leading-tight">
              {state.error}
            </div>
          )}
          <MessageInput 
            onSend={handleSendMessage} 
            disabled={state.isTyping} 
          />
        </div>
      )}
      
      <div className="h-[env(safe-area-inset-bottom)] bg-white"></div>
    </div>
  );
};

export default App;
