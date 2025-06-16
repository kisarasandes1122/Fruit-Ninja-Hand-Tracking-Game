import React from 'react';
import { Play, Camera, Zap } from 'lucide-react';

interface StartMenuProps {
  onStart: () => void;
  isHandTrackerReady: boolean;
  handTrackerError: string | null;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, isHandTrackerReady, handTrackerError }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-red-400 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-green-400 rounded-full opacity-20 blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-400 rounded-full opacity-20 blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4 animate-pulse">
            FRUIT NINJA
          </h1>
          <p className="text-2xl text-white/80 font-light">
            Slice fruits with your hand gestures
          </p>
        </div>

        {/* Status indicators */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Camera className={`w-6 h-6 ${isHandTrackerReady ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className="text-white/90">
              {isHandTrackerReady ? 'Camera Ready' : 'Initializing Camera...'}
            </span>
          </div>
          
          {handTrackerError && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-300 text-sm">{handTrackerError}</p>
            </div>
          )}
        </div>

        {/* Game instructions */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">✋</div>
            <h3 className="text-xl font-semibold text-white mb-2">Raise Your Hand</h3>
            <p className="text-white/70 text-sm">Position your hand in front of the camera</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🍎</div>
            <h3 className="text-xl font-semibold text-white mb-2">Slice Fruits</h3>
            <p className="text-white/70 text-sm">Move your finger quickly to slice through fruits</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Score Points</h3>
            <p className="text-white/70 text-sm">Don't let fruits fall! You have 3 lives</p>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!isHandTrackerReady}
          className={`
            group relative px-12 py-4 text-2xl font-bold rounded-2xl transition-all duration-300 transform
            ${isHandTrackerReady 
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 hover:scale-105 text-white shadow-2xl' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            {isHandTrackerReady ? <Play className="w-8 h-8" fill="currentColor" /> : <Zap className="w-8 h-8 animate-spin" />}
            <span>{isHandTrackerReady ? 'START GAME' : 'LOADING...'}</span>
          </div>
          
          {isHandTrackerReady && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          )}
        </button>
        
        {isHandTrackerReady && (
          <p className="text-white/60 text-sm mt-4">
            Make sure you're in a well-lit area for best tracking performance
          </p>
        )}
      </div>
    </div>
  );
};