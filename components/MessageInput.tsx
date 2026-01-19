
import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

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
      <div className="flex-1 bg-gray-50 rounded-2xl p-2 border border-pink-50 focus-within:border-pink-300 transition-all flex items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="သံစဉ်ကို ဘာပြောချင်လဲဟင်..."
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
        <button 
          type="button" 
          className="p-2 text-pink-400 hover:text-pink-600 transition-colors"
          onClick={() => alert("Emoji keyboard coming soon! ❤️")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
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
