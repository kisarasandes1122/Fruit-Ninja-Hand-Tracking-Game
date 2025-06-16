export const GAME_CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  GRAVITY: 0.4,
  
  // Base spawn settings
  BASE_FRUIT_SPAWN_RATE: 0.015, // Starting spawn rate
  BASE_FRUIT_MIN_VELOCITY: 20,
  BASE_FRUIT_MAX_VELOCITY: 28,
  
  // Difficulty progression
  DIFFICULTY_SCORE_INTERVAL: 100, // Every 100 points, difficulty increases
  MAX_DIFFICULTY_LEVEL: 20, // Cap at level 20 for sanity
  SPAWN_RATE_INCREASE: 0.008, // How much spawn rate increases per level
  VELOCITY_INCREASE: 2, // How much velocity increases per level
  MAX_SIMULTANEOUS_FRUITS: 12, // Maximum fruits on screen at once
  
  // Slice detection - REDUCED
  SLICE_THRESHOLD: 30,
  TRAIL_LENGTH: 50,
  MAX_LIVES: 3,
  FRUIT_LIFETIME: 15000,
  FRUIT_SIZE_MULTIPLIER: 1.75,
  
  // Hand tracking constants
  HAND_SMOOTHING_FACTOR: 0.3,
  SLICE_VELOCITY_THRESHOLD: 150,
  SLICE_COOLDOWN: 50,
  
  // Collision detection - REDUCED RADIUS
  COLLISION_BASE_RADIUS: 35, // Reduced from 60
  COLLISION_SLICE_BONUS: 25, // Reduced from 40
  TRAIL_COLLISION_DURATION: 300,
  SLICE_ZONE_DURATION: 300, // Reduced from 500
  VELOCITY_HISTORY_LENGTH: 15,
  ACCELERATION_THRESHOLD: 100,
  
  // Debug and performance
  DEBUG_MODE: true,
  MAX_SLICE_ZONES: 10,
  PREDICTIVE_COLLISION_DISTANCE: 50,
  
  // Special fruit chances (increases with difficulty)
  SPECIAL_FRUIT_BASE_CHANCE: 0.05, // 5% base chance
  SPECIAL_FRUIT_CHANCE_INCREASE: 0.01, // +1% per difficulty level
  
  // Combo system
  COMBO_TIME_WINDOW: 2000, // 2 seconds to maintain combo
  COMBO_MULTIPLIER_MAX: 5, // Maximum combo multiplier
  
  // BOMB SYSTEM
  BOMB_SPAWN_RATE: 0.008, // Base bomb spawn rate
  BOMB_SPAWN_INCREASE: 0.002, // Increase per difficulty level
  BOMB_FRUIT_GAP: 2000, // 2 second gap between bomb and fruit spawns
  BOMB_SIZE_MULTIPLIER: 1.5, // Bombs are slightly smaller than fruits
  BOMB_MIN_VELOCITY: 18,
  BOMB_MAX_VELOCITY: 25,
};

export const FRUIT_TYPES = [
  { 
    name: 'apple', 
    color: '#ff4757', 
    size: 40,
    points: 10,
    emoji: '🍎',
    rarity: 'common'
  },
  { 
    name: 'banana', 
    color: '#ffa502', 
    size: 45,
    points: 15,
    emoji: '🍌',
    rarity: 'common'
  },
  { 
    name: 'orange', 
    color: '#ff6348', 
    size: 38,
    points: 12,
    emoji: '🍊',
    rarity: 'common'
  },
  { 
    name: 'watermelon', 
    color: '#2ed573', 
    size: 55,
    points: 20,
    emoji: '🍉',
    rarity: 'uncommon'
  },
  { 
    name: 'pineapple', 
    color: '#ffc048', 
    size: 50,
    points: 25,
    emoji: '🍍',
    rarity: 'uncommon'
  },
  { 
    name: 'strawberry', 
    color: '#ff3838', 
    size: 35,
    points: 18,
    emoji: '🍓',
    rarity: 'common'
  },
  // Special high-value fruits (appear at higher difficulties)
  { 
    name: 'dragon_fruit', 
    color: '#e056fd', 
    size: 48,
    points: 50,
    emoji: '🐉',
    rarity: 'rare'
  },
  { 
    name: 'golden_apple', 
    color: '#f1c40f', 
    size: 42,
    points: 100,
    emoji: '🏆',
    rarity: 'legendary'
  }
];

// BOMB TYPE
export const BOMB_TYPE = {
  name: 'bomb',
  color: '#2c2c2c',
  size: 45,
  points: -1, // Negative to indicate life loss
  emoji: '💣',
  rarity: 'dangerous'
};

// Difficulty level configurations
export const DIFFICULTY_LEVELS = [
  { level: 1, name: 'Beginner', spawnMultiplier: 1.0, speedMultiplier: 1.0, maxFruits: 3, bombChance: 0.02 },
  { level: 2, name: 'Easy', spawnMultiplier: 1.2, speedMultiplier: 1.1, maxFruits: 4, bombChance: 0.03 },
  { level: 3, name: 'Normal', spawnMultiplier: 1.4, speedMultiplier: 1.2, maxFruits: 5, bombChance: 0.04 },
  { level: 4, name: 'Challenging', spawnMultiplier: 1.6, speedMultiplier: 1.3, maxFruits: 6, bombChance: 0.05 },
  { level: 5, name: 'Hard', spawnMultiplier: 1.8, speedMultiplier: 1.4, maxFruits: 7, bombChance: 0.06 },
  { level: 6, name: 'Expert', spawnMultiplier: 2.0, speedMultiplier: 1.5, maxFruits: 8, bombChance: 0.07 },
  { level: 7, name: 'Master', spawnMultiplier: 2.2, speedMultiplier: 1.6, maxFruits: 9, bombChance: 0.08 },
  { level: 8, name: 'Insane', spawnMultiplier: 2.4, speedMultiplier: 1.7, maxFruits: 10, bombChance: 0.09 },
  { level: 9, name: 'Nightmare', spawnMultiplier: 2.6, speedMultiplier: 1.8, maxFruits: 11, bombChance: 0.10 },
  { level: 10, name: 'LEGENDARY', spawnMultiplier: 3.0, speedMultiplier: 2.0, maxFruits: 12, bombChance: 0.12 }
];