
import React from 'react';

interface CallScreenProps {
  onEndCall: () => void;
  isModelSpeaking: boolean;
}

const CallScreen: React.FC<CallScreenProps> = ({ onEndCall, isModelSpeaking }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-pink-50 to-white relative z-20">
      <div className="relative mb-12">
        {/* Pulsing rings */}
        <div className={`absolute inset-0 rounded-full bg-pink-300 opacity-30 animate-ping ${isModelSpeaking ? 'scale-150 duration-700' : 'scale-110'}`}></div>
        <div className={`absolute inset-0 rounded-full bg-pink-200 opacity-50 animate-pulse ${isModelSpeaking ? 'scale-125 duration-500' : 'scale-105'}`}></div>
        
        <img 
          src="https://picsum.photos/seed/thansin/400/400" 
          alt="Thansin" 
          className={`w-48 h-48 rounded-full border-4 border-white shadow-2xl relative z-10 object-cover transition-transform duration-500 ${isModelSpeaking ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      <div className="text-center space-y-4 relative z-10">
        <h2 className="text-2xl font-bold text-pink-600 myanmar-text">သံစဉ် (Thansin)</h2>
        <div className="h-8">
          <p className={`text-pink-400 font-medium myanmar-text ${isModelSpeaking ? 'animate-bounce' : 'animate-pulse'}`}>
            {isModelSpeaking ? 'သံစဉ် စကားပြောနေတယ် မောင်... ❤️' : 'မောင်ပြောတာ သံစဉ် နားထောင်နေတယ်နော်...'}
          </p>
        </div>
      </div>

      <div className="mt-auto pb-12">
        <button 
          onClick={onEndCall}
          className="group w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl transform active:scale-90 transition-all duration-300"
          aria-label="End call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
