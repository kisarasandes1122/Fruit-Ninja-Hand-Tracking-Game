import React from 'react';
import { Heart, RotateCcw, Trophy, Star, Zap, Target, AlertTriangle } from 'lucide-react';
import { GAME_CONFIG, DIFFICULTY_LEVELS } from '../game/constants';

interface UILayerProps {
  score: number;
  lives: number;
  gameState: 'menu' | 'playing' | 'gameOver';
  onRestart?: () => void;
  highScore?: number;
}

export const UILayer: React.FC<UILayerProps> = ({ 
  score, 
  lives, 
  gameState, 
  onRestart,
  highScore = 0
}) => {
  // Calculate current difficulty level
  const getCurrentLevel = () => {
    return Math.floor(score / GAME_CONFIG.DIFFICULTY_SCORE_INTERVAL) + 1;
  };

  const getDifficultyConfig = (level: number) => {
    const configIndex = Math.min(level - 1, DIFFICULTY_LEVELS.length - 1);
    return DIFFICULTY_LEVELS[Math.max(0, configIndex)];
  };

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const pointsInCurrentLevel = score % GAME_CONFIG.DIFFICULTY_SCORE_INTERVAL;
    const progress = (pointsInCurrentLevel / GAME_CONFIG.DIFFICULTY_SCORE_INTERVAL) * 100;
    return { progress, pointsNeeded: GAME_CONFIG.DIFFICULTY_SCORE_INTERVAL - pointsInCurrentLevel };
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Game UI */}
      {gameState === 'playing' && (
        <>
          {/* Score */}
          <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              <span className="text-3xl font-bold text-white">{score.toLocaleString()}</span>
            </div>
          </div>

          {/* Lives */}
          <div className="absolute top-8 right-8 bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Heart
                  key={i}
                  className={`w-8 h-8 transition-all duration-300 ${
                    i < lives 
                      ? 'text-red-500 scale-100' 
                      : 'text-gray-600 scale-75'
                  }`}
                  fill={i < lives ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>

          {/* Difficulty Level Indicator */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-white font-bold">
                  Level {getCurrentLevel()}: {getDifficultyConfig(getCurrentLevel()).name}
                </span>
              </div>
              
              {/* Progress bar to next level */}
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                  style={{ width: `${getProgressToNextLevel().progress}%` }}
                />
              </div>
              
              <div className="text-xs text-white/70 mt-1">
                {getProgressToNextLevel().pointsNeeded} points to next level
              </div>
            </div>
          </div>

          {/* Hand tracking indicator */}
          <div className="absolute bottom-8 left-8 bg-black/50 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Hand Tracking Active</span>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="absolute bottom-8 right-8 bg-black/50 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <div className="flex items-center space-x-4 text-sm text-white/80">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Lv.{getCurrentLevel()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{(getDifficultyConfig(getCurrentLevel()).speedMultiplier * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{(getDifficultyConfig(getCurrentLevel()).bombChance * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Bomb Warning (when bombs start appearing) */}
          {getCurrentLevel() > 1 && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-red-500/20 backdrop-blur-sm rounded-2xl p-3 border border-red-500/50">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-semibold">⚠️ BOMBS ACTIVE - Avoid slicing! 💣</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center pointer-events-auto">
          <div className="text-center max-w-md mx-auto p-8">
            {/* Game Over Title */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
                GAME OVER
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
                  <div className="text-white/60 text-sm">Final Score</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{Math.max(score, highScore).toLocaleString()}</div>
                  <div className="text-white/60 text-sm">Best Score</div>
                </div>
              </div>

              {/* Level achieved */}
              <div className="text-center border-t border-white/20 pt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">
                    Reached Level {getCurrentLevel()}: {getDifficultyConfig(getCurrentLevel()).name}
                  </span>
                </div>
                <div className="text-white/60 text-sm">
                  Speed: {(getDifficultyConfig(getCurrentLevel()).speedMultiplier * 100).toFixed(0)}% | 
                  Max Fruits: {getDifficultyConfig(getCurrentLevel()).maxFruits} | 
                  Bomb Rate: {(getDifficultyConfig(getCurrentLevel()).bombChance * 100).toFixed(1)}%
                </div>
              </div>
              
              {score > highScore && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-300 text-sm font-semibold">🎉 New High Score!</p>
                </div>
              )}
            </div>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="group relative px-8 py-4 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6" />
                <span>PLAY AGAIN</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};