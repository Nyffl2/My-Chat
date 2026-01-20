
import React from 'react';

interface HeaderProps {
  onCallClick: () => void;
  isCalling: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCallClick, isCalling }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src="https://picsum.photos/seed/thansin/150/150" 
            alt="Thansin Avatar" 
            className="w-12 h-12 rounded-full border-2 border-pink-300 object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h1 className="text-pink-600 font-bold text-lg leading-tight myanmar-text">သံစဉ် (Thansin)</h1>
          <p className="text-pink-400 text-xs flex items-center gap-1 myanmar-text">
            <span className="animate-pulse">●</span> {isCalling ? 'မောင်နဲ့ ဖုန်းပြောနေတယ် ❤️' : 'မောင့်အတွက် ရှိနေတယ်နော် ❤️'}
          </p>
        </div>
      </div>
      {!isCalling && (
        <div className="flex gap-3 text-pink-400">
          <button 
            onClick={onCallClick}
            className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500"
            title="Call Thansin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-pink-50 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
