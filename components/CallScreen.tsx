
import React from 'react';

interface CallScreenProps {
  onEndCall: () => void;
  isModelSpeaking: boolean;
}

const CallScreen: React.FC<CallScreenProps> = ({ onEndCall, isModelSpeaking }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white relative z-20">
      <div className="relative mb-12">
        {/* Pulsing rings - Blue/Indigo for professional feel */}
        <div className={`absolute inset-0 rounded-full bg-indigo-300 opacity-30 animate-ping ${isModelSpeaking ? 'scale-150 duration-700' : 'scale-110'}`}></div>
        <div className={`absolute inset-0 rounded-full bg-indigo-200 opacity-50 animate-pulse ${isModelSpeaking ? 'scale-125 duration-500' : 'scale-105'}`}></div>
        
        <img 
          src="https://picsum.photos/seed/translator/400/400" 
          alt="Translator" 
          className={`w-48 h-48 rounded-full border-4 border-white shadow-2xl relative z-10 object-cover transition-transform duration-500 ${isModelSpeaking ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      <div className="text-center space-y-4 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800">JP-MM Translation Agent</h2>
        <div className="h-8">
          <p className={`text-indigo-500 font-medium ${isModelSpeaking ? 'animate-bounce' : 'animate-pulse'}`}>
            {isModelSpeaking ? 'Translating...' : 'Listening...'}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
