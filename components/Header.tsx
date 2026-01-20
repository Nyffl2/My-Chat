
import React from 'react';

interface HeaderProps {
  onCallClick: () => void;
  isCalling: boolean;
  isTyping?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCallClick, isCalling, isTyping }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src="https://picsum.photos/seed/translator/150/150" 
            alt="Translator Agent" 
            className="w-12 h-12 rounded-full border-2 border-indigo-200 object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h1 className="text-gray-800 font-bold text-lg leading-tight">JP-MM Subtitler</h1>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <span className="animate-pulse">●</span> 
            {isCalling 
              ? 'Live Audio Translation' 
              : isTyping 
                ? <span className="animate-pulse">Generating SRT... ✍️</span>
                : 'Ready to translate'}
          </p>
        </div>
      </div>
      {!isCalling && (
        <div className="flex gap-3 text-gray-500">
          <button 
            onClick={onCallClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-indigo-500"
            title="Live Audio Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
