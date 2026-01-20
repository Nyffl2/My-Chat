
import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence for typical chat flow
      recognition.interimResults = false;
      recognition.lang = 'my-MM'; // Set to Burmese

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          // Append to existing text with a space if needed
          setText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("ဒီ Browser မှာ အသံနဲ့ စာရိုက်လို့ မရဘူး မောင်... Chrome သုံးကြည့်နော် ❤️");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t border-pink-100 flex items-end gap-2"
    >
      <div className={`flex-1 bg-gray-50 rounded-2xl p-2 border transition-all flex items-end ${isListening ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-50 focus-within:border-pink-300'}`}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? "ပြောပါ မောင်... သံစဉ် နားထောင်နေတယ်" : "သံစဉ်ကို ဘာပြောချင်လဲဟင်..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 myanmar-text p-2 resize-none max-h-32 text-[15px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
        />
        
        <div className="flex items-center gap-1">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`p-2 rounded-full transition-all ${
              isListening 
                ? 'text-red-500 bg-red-50 animate-pulse' 
                : 'text-pink-400 hover:text-pink-600 hover:bg-pink-50'
            }`}
            title={isListening ? "Stop Listening" : "Voice Input"}
          >
            {isListening ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Emoji Button (Placeholder) */}
          <button 
            type="button" 
            className="p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors hidden sm:block"
            onClick={() => alert("Emoji keyboard coming soon! ❤️")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={`p-3 rounded-full shadow-lg transition-all transform active:scale-95 ${
          !text.trim() || disabled 
            ? 'bg-pink-200 cursor-not-allowed' 
            : 'bg-pink-500 hover:bg-pink-600'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;
