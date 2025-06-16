import React, { useState, useCallback, useEffect } from 'react';
import { StartMenu } from './components/StartMenu';
import { GameCanvas } from './components/GameCanvas';
import { UILayer } from './components/UILayer';
import { CameraBackground } from './components/CameraBackground';
import { useHandTracker } from './hooks/useHandTracker';
import { GAME_CONFIG } from './game/constants';

type GameState = 'menu' | 'playing' | 'gameOver';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_CONFIG.MAX_LIVES);
  const [highScore, setHighScore] = useState(0);
  
  const { landmarks, isLoading, error, videoElement } = useHandTracker();

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('fruitNinjaHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score when game ends
  useEffect(() => {
    if (gameState === 'gameOver' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('fruitNinjaHighScore', score.toString());
    }
  }, [gameState, score, highScore]);

  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(GAME_CONFIG.MAX_LIVES);
  }, []);

  const handleFruitSliced = useCallback((points: number) => {
    setScore(prevScore => prevScore + points);
  }, []);

  const handleFruitMissed = useCallback(() => {
    setLives(prevLives => {
      const newLives = prevLives - 1;
      return newLives;
    });
  }, []);

  const handleBombSliced = useCallback(() => {
    setLives(prevLives => {
      const newLives = prevLives - 1;
      console.log(`💥 Bomb sliced! Lives remaining: ${newLives}`);
      return newLives;
    });
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('gameOver');
  }, []);

  // Check for game over when lives reach 0
  useEffect(() => {
    if (gameState === 'playing' && lives <= 0) {
      handleGameOver();
    }
  }, [lives, gameState, handleGameOver]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Camera background - only show during gameplay */}
      {gameState === 'playing' && videoElement && (
        <CameraBackground videoElement={videoElement} opacity={0.25} />
      )}
      
      {gameState === 'menu' && (
        <StartMenu
          onStart={handleStartGame}
          isHandTrackerReady={!isLoading && !error}
          handTrackerError={error}
        />
      )}
      
      {gameState === 'playing' && (
        <>
          <GameCanvas
            landmarks={landmarks}
            onFruitSliced={handleFruitSliced}
            onFruitMissed={handleFruitMissed}
            onBombSliced={handleBombSliced}
            onGameOver={handleGameOver}
            currentLives={lives}
            currentScore={score}
          />
          <UILayer
            score={score}
            lives={lives}
            gameState={gameState}
            highScore={highScore}
          />
        </>
      )}
      
      {gameState === 'gameOver' && (
        <UILayer
          score={score}
          lives={lives}
          gameState={gameState}
          onRestart={handleStartGame}
          highScore={highScore}
        />
      )}
    </div>
  );
}

export default App;