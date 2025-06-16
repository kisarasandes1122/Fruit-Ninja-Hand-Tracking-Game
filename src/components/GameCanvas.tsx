import React, { useRef, useEffect, useCallback } from 'react';
import { Fruit } from '../game/fruit';
import { GAME_CONFIG, DIFFICULTY_LEVELS } from '../game/constants';
import { ProcessedLandmarks } from '../hooks/useHandTracker';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  strength: number;
  velocity: number;
}

interface SliceZone {
  x: number;
  y: number;
  radius: number;
  strength: number;
  timestamp: number;
}

interface GameCanvasProps {
  landmarks: ProcessedLandmarks;
  onFruitSliced: (points: number) => void;
  onFruitMissed: () => void;
  onGameOver: () => void;
  onBombSliced: () => void; // New callback for bomb slicing
  currentLives: number;
  currentScore: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  landmarks,
  onFruitSliced,
  onFruitMissed,
  onGameOver,
  onBombSliced,
  currentLives,
  currentScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const sliceZonesRef = useRef<SliceZone[]>([]);
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef<{
    fruit: number;
    bomb: number;
  }>({ fruit: 0, bomb: 0 });
  const comboRef = useRef<{
    count: number;
    lastSliceTime: number;
    multiplier: number;
  }>({
    count: 0,
    lastSliceTime: 0,
    multiplier: 1
  });

  // Calculate current difficulty level based on score
  const getCurrentDifficulty = useCallback(() => {
    const level = Math.floor(currentScore / GAME_CONFIG.DIFFICULTY_SCORE_INTERVAL) + 1;
    return Math.min(level, GAME_CONFIG.MAX_DIFFICULTY_LEVEL);
  }, [currentScore]);

  // Get difficulty configuration
  const getDifficultyConfig = useCallback((level: number) => {
    const configIndex = Math.min(level - 1, DIFFICULTY_LEVELS.length - 1);
    return DIFFICULTY_LEVELS[Math.max(0, configIndex)];
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const createSliceZone = useCallback((x: number, y: number, strength: number, velocity: number) => {
    const now = performance.now();
    const baseRadius = 20; // Reduced from 30
    const velocityBonus = Math.min(velocity / 15, 30); // Reduced
    const strengthBonus = strength * 25; // Reduced
    
    sliceZonesRef.current.push({
      x,
      y,
      radius: baseRadius + velocityBonus + strengthBonus,
      strength,
      timestamp: now
    });
    
    sliceZonesRef.current = sliceZonesRef.current.filter(
      zone => now - zone.timestamp < GAME_CONFIG.SLICE_ZONE_DURATION
    );
  }, []);

  const updateCombo = useCallback((points: number) => {
    const now = performance.now();
    const timeSinceLastSlice = now - comboRef.current.lastSliceTime;
    
    if (timeSinceLastSlice < GAME_CONFIG.COMBO_TIME_WINDOW) {
      comboRef.current.count++;
      comboRef.current.multiplier = Math.min(
        Math.floor(comboRef.current.count / 3) + 1,
        GAME_CONFIG.COMBO_MULTIPLIER_MAX
      );
    } else {
      comboRef.current.count = 1;
      comboRef.current.multiplier = 1;
    }
    
    comboRef.current.lastSliceTime = now;
    
    // Apply combo multiplier to points
    const finalPoints = points * comboRef.current.multiplier;
    
    if (comboRef.current.multiplier > 1) {
      console.log(`🔥 COMBO x${comboRef.current.multiplier}! ${points} → ${finalPoints} points`);
    }
    
    return finalPoints;
  }, []);

  const checkUltimateCollision = useCallback((fruit: Fruit): boolean => {
    const now = performance.now();
    
    // Method 1: Direct finger collision with REDUCED radius
    if (landmarks.indexFinger) {
      const distance = Math.sqrt(
        (fruit.x - landmarks.indexFinger.x) ** 2 + 
        (fruit.y - landmarks.indexFinger.y) ** 2
      );
      
      let collisionRadius = fruit.actualSize / 2 + GAME_CONFIG.COLLISION_BASE_RADIUS;
      
      if (landmarks.isSlicing) {
        collisionRadius += GAME_CONFIG.COLLISION_SLICE_BONUS;
        collisionRadius += landmarks.sliceStrength * 20; // Reduced
        collisionRadius += Math.min(landmarks.rawVelocity / 15, 25); // Reduced
      }
      
      if (distance < collisionRadius) {
        console.log(`🎯 DIRECT HIT! Distance: ${distance.toFixed(0)}, Radius: ${collisionRadius.toFixed(0)}`);
        return true;
      }
    }
    
    // Method 2: Trail-based collision with REDUCED radius
    const recentTrail = trailPointsRef.current.filter(
      point => now - point.timestamp < GAME_CONFIG.TRAIL_COLLISION_DURATION
    );
    
    for (const point of recentTrail) {
      const distance = Math.sqrt(
        (fruit.x - point.x) ** 2 + 
        (fruit.y - point.y) ** 2
      );
      
      const trailRadius = fruit.actualSize / 2 + 35 + (point.velocity / 20); // Reduced
      if (distance < trailRadius) {
        console.log(`🌟 TRAIL HIT! Distance: ${distance.toFixed(0)}`);
        return true;
      }
    }
    
    // Method 3: Slice zone collision with REDUCED radius
    for (const zone of sliceZonesRef.current) {
      const distance = Math.sqrt(
        (fruit.x - zone.x) ** 2 + 
        (fruit.y - zone.y) ** 2
      );
      
      if (distance < zone.radius + fruit.actualSize / 2) {
        console.log(`💥 ZONE HIT! Distance: ${distance.toFixed(0)}`);
        return true;
      }
    }
    
    // Method 4: Predictive collision with REDUCED radius
    if (landmarks.indexFinger && landmarks.rawVelocity > 100) {
      const prediction = {
        x: landmarks.indexFinger.x + landmarks.movementDirection.x * GAME_CONFIG.PREDICTIVE_COLLISION_DISTANCE,
        y: landmarks.indexFinger.y + landmarks.movementDirection.y * GAME_CONFIG.PREDICTIVE_COLLISION_DISTANCE
      };
      
      const predictiveDistance = Math.sqrt(
        (fruit.x - prediction.x) ** 2 + 
        (fruit.y - prediction.y) ** 2
      );
      
      if (predictiveDistance < fruit.actualSize / 2 + 30) { // Reduced
        console.log(`🔮 PREDICTIVE HIT!`);
        return true;
      }
    }
    
    return false;
  }, [landmarks]);

  const drawEnhancedTrail = useCallback((ctx: CanvasRenderingContext2D) => {
    if (trailPointsRef.current.length < 2) return;

    const now = performance.now();
    const validPoints = trailPointsRef.current.filter(point => now - point.timestamp < 800);
    trailPointsRef.current = validPoints;

    if (validPoints.length < 2) return;

    ctx.save();
    
    // Draw multiple trail layers
    for (let layer = 0; layer < 3; layer++) {
      const layerAlpha = 0.8 - (layer * 0.2);
      const layerWidth = (3 - layer) * 2;
      
      for (let i = 1; i < validPoints.length; i++) {
        const current = validPoints[i];
        const previous = validPoints[i - 1];
        
        const age = (now - current.timestamp) / 800;
        const alpha = Math.max(0, (1 - age) * layerAlpha);
        const progress = i / validPoints.length;
        
        const baseWidth = landmarks.isSlicing ? 12 : 6;
        const velocityMultiplier = 1 + Math.min(current.velocity / 500, 2);
        const width = (baseWidth + layerWidth) * velocityMultiplier * alpha * progress;
        
        const color = landmarks.isSlicing ? 
          `rgba(255, 71, 87, ${alpha})` : 
          `rgba(0, 210, 211, ${alpha})`;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, width);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.shadowColor = landmarks.isSlicing ? '#ff4757' : '#00d2d3';
        ctx.shadowBlur = 25 + (current.velocity / 20);

        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [landmarks.isSlicing]);

  const drawDifficultyIndicator = useCallback((ctx: CanvasRenderingContext2D) => {
    const currentLevel = getCurrentDifficulty();
    const difficultyConfig = getDifficultyConfig(currentLevel);
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 140, 300, 100);
    
    // Difficulty info
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Level ${currentLevel}: ${difficultyConfig.name}`, 20, 165);
    
    ctx.font = '12px Arial';
    const fruitCount = fruitsRef.current.filter(f => !f.isBomb).length;
    const bombCount = fruitsRef.current.filter(f => f.isBomb).length;
    ctx.fillText(`Fruits: ${fruitCount}/${difficultyConfig.maxFruits} | Bombs: ${bombCount}`, 20, 185);
    ctx.fillText(`Speed: ${(difficultyConfig.speedMultiplier * 100).toFixed(0)}%`, 20, 200);
    ctx.fillText(`Bomb Chance: ${(difficultyConfig.bombChance * 100).toFixed(1)}%`, 20, 215);
    
    // Combo indicator
    if (comboRef.current.multiplier > 1) {
      ctx.fillStyle = '#ff4757';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`COMBO x${comboRef.current.multiplier}`, 180, 185);
    }
    
    ctx.restore();
  }, [getCurrentDifficulty, getDifficultyConfig]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const currentLevel = getCurrentDifficulty();
    const difficultyConfig = getDifficultyConfig(currentLevel);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update trail points
    if (landmarks.indexFinger) {
      trailPointsRef.current.push({
        x: landmarks.indexFinger.x,
        y: landmarks.indexFinger.y,
        timestamp: now,
        strength: landmarks.sliceStrength,
        velocity: landmarks.rawVelocity
      });

      if (trailPointsRef.current.length > GAME_CONFIG.TRAIL_LENGTH) {
        trailPointsRef.current = trailPointsRef.current.slice(-GAME_CONFIG.TRAIL_LENGTH);
      }
      
      if (landmarks.isSlicing || landmarks.rawVelocity > 150) {
        createSliceZone(
          landmarks.indexFinger.x, 
          landmarks.indexFinger.y, 
          landmarks.sliceStrength,
          landmarks.rawVelocity
        );
      }
    }

    // SEPARATE SPAWNING LOGIC FOR FRUITS AND BOMBS
    const currentFruitCount = fruitsRef.current.filter(f => !f.isBomb).length;
    const currentBombCount = fruitsRef.current.filter(f => f.isBomb).length;
    const maxFruits = difficultyConfig.maxFruits;
    
    // Fruit spawning
    const timeSinceLastFruit = now - lastSpawnTimeRef.current.fruit;
    const fruitSpawnRate = GAME_CONFIG.BASE_FRUIT_SPAWN_RATE * difficultyConfig.spawnMultiplier;
    const fruitSpawnCooldown = Math.max(300, 1000 - (currentLevel * 50));
    
    const shouldSpawnFruit = timeSinceLastFruit > fruitSpawnCooldown && 
                            currentFruitCount < maxFruits && 
                            Math.random() < fruitSpawnRate &&
                            (now - lastSpawnTimeRef.current.bomb) > GAME_CONFIG.BOMB_FRUIT_GAP; // Gap check
    
    if (shouldSpawnFruit) {
      fruitsRef.current.push(new Fruit(canvas.width, canvas.height, currentLevel, false));
      lastSpawnTimeRef.current.fruit = now;
      console.log(`🍎 Spawned fruit! Level ${currentLevel}, Count: ${currentFruitCount + 1}/${maxFruits}`);
    }
    
    // Bomb spawning (only after level 1 and with proper gap)
    const timeSinceLastBomb = now - lastSpawnTimeRef.current.bomb;
    const bombSpawnRate = GAME_CONFIG.BOMB_SPAWN_RATE + (currentLevel * GAME_CONFIG.BOMB_SPAWN_INCREASE);
    const bombSpawnCooldown = Math.max(2000, 4000 - (currentLevel * 200)); // Longer cooldown for bombs
    
    const shouldSpawnBomb = currentLevel > 1 && // No bombs on level 1
                           timeSinceLastBomb > bombSpawnCooldown && 
                           currentBombCount < 2 && // Max 2 bombs at once
                           Math.random() < (bombSpawnRate * difficultyConfig.bombChance) &&
                           (now - lastSpawnTimeRef.current.fruit) > GAME_CONFIG.BOMB_FRUIT_GAP; // Gap check
    
    if (shouldSpawnBomb) {
      fruitsRef.current.push(new Fruit(canvas.width, canvas.height, currentLevel, true));
      lastSpawnTimeRef.current.bomb = now;
      console.log(`💣 Spawned bomb! Level ${currentLevel}, Count: ${currentBombCount + 1}`);
    }

    // Update and draw fruits/bombs
    fruitsRef.current = fruitsRef.current.filter(fruit => {
      fruit.update();

      // Check collision
      if (!fruit.sliced && checkUltimateCollision(fruit)) {
        fruit.slice();
        
        if (fruit.isBomb) {
          // Bomb was sliced - lose a life!
          onBombSliced();
          console.log(`💥 BOMB SLICED! Lost a life!`);
          
          // Reset combo on bomb slice
          comboRef.current.count = 0;
          comboRef.current.multiplier = 1;
        } else {
          // Regular fruit sliced
          const finalPoints = updateCombo(fruit.type.points);
          onFruitSliced(finalPoints);
          
          console.log(`🍎 ${fruit.type.name.toUpperCase()} SLICED! ${fruit.type.points} base points → ${finalPoints} final points`);
        }
        
        // Create explosion effect
        if (landmarks.indexFinger) {
          createSliceZone(
            landmarks.indexFinger.x,
            landmarks.indexFinger.y,
            1.0,
            landmarks.rawVelocity
          );
        }
      }

      // Check if fruit/bomb missed (only fruits count as missed)
      if (!fruit.sliced && fruit.isOffScreen(canvas.width, canvas.height)) {
        if (fruit.vy > 0 && !fruit.isBomb) { // Only fruits cause life loss when missed
          onFruitMissed();
          console.log(`💔 FRUIT MISSED! ${fruit.type.name}`);
          
          // Reset combo on miss
          comboRef.current.count = 0;
          comboRef.current.multiplier = 1;
        }
        return false;
      }

      // Remove completed sliced fruits/bombs
      if (fruit.sliced && fruit.particles.length === 0) {
        return false;
      }

      fruit.draw(ctx);
      return true;
    });

    // Draw visual elements
    drawEnhancedTrail(ctx);
    
    // Draw slice zones with REDUCED size
    const currentTime = performance.now();
    sliceZonesRef.current.forEach(zone => {
      const age = currentTime - zone.timestamp;
      const alpha = Math.max(0, 1 - (age / GAME_CONFIG.SLICE_ZONE_DURATION));
      
      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.3; // Reduced opacity
        ctx.strokeStyle = '#ff4757';
        ctx.fillStyle = 'rgba(255, 71, 87, 0.08)'; // Reduced fill opacity
        ctx.lineWidth = 3; // Reduced line width
        ctx.setLineDash([6, 6]); // Smaller dashes
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw difficulty indicator
    drawDifficultyIndicator(ctx);

    // Draw hand indicator
    if (landmarks.indexFinger) {
      ctx.save();
      
      const confidenceAlpha = Math.max(0.5, landmarks.handConfidence);
      const pulseScale = 1 + Math.sin(now * 0.01) * 0.2;
      
      let indicatorColor = '#00d2d3';
      let indicatorSize = 15;
      
      if (landmarks.gestureType === 'pointing') {
        indicatorColor = '#ffa502';
        indicatorSize = 12;
      } else if (landmarks.gestureType === 'slicing') {
        indicatorColor = '#ff4757';
        indicatorSize = 20;
      }
      
      if (landmarks.isSlicing) {
        indicatorColor = '#ff1744';
        indicatorSize = 25 + (landmarks.sliceStrength * 15);
      }
      
      const finalSize = indicatorSize * pulseScale;
      
      // Multi-layer indicator
      for (let layer = 0; layer < 3; layer++) {
        const layerSize = finalSize + (layer * 8);
        const layerAlpha = (confidenceAlpha * 0.8) / (layer + 1);
        
        ctx.fillStyle = indicatorColor;
        ctx.shadowColor = indicatorColor;
        ctx.shadowBlur = 30 + (landmarks.rawVelocity / 20);
        ctx.globalAlpha = layerAlpha;
        ctx.beginPath();
        ctx.arc(landmarks.indexFinger.x, landmarks.indexFinger.y, layerSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Velocity indicator
      if (landmarks.rawVelocity > 200) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(landmarks.indexFinger.x, landmarks.indexFinger.y, finalSize + 20, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    }

    // Check game over
    if (currentLives <= 0) {
      onGameOver();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [landmarks, onFruitSliced, onFruitMissed, onBombSliced, onGameOver, currentLives, currentScore, getCurrentDifficulty, getDifficultyConfig, drawEnhancedTrail, drawDifficultyIndicator, checkUltimateCollision, createSliceZone, updateCombo]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-none"
      style={{ touchAction: 'none', zIndex: 2 }}
    />
  );
};