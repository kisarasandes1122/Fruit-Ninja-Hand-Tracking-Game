import { GAME_CONFIG, FRUIT_TYPES, BOMB_TYPE } from './constants';

export interface FruitType {
  name: string;
  color: string;
  size: number;
  points: number;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'dangerous';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  type: FruitType;
  sliced: boolean;
  particles: Particle[];
  createdAt: number;
  actualSize: number;
  difficultyLevel: number;
  isBomb: boolean;

  constructor(canvasWidth: number, canvasHeight: number, difficultyLevel: number = 1, forceBomb: boolean = false) {
    this.difficultyLevel = difficultyLevel;
    this.isBomb = forceBomb;
    
    // Spawn from bottom with more varied horizontal positions
    this.x = Math.random() * (canvasWidth - 200) + 100;
    this.y = canvasHeight + 50;
    
    // More varied horizontal velocity for interesting trajectories
    this.vx = (Math.random() - 0.5) * (8 + difficultyLevel * 2);
    
    // Different velocity ranges for bombs vs fruits
    if (this.isBomb) {
      const baseVelocity = GAME_CONFIG.BOMB_MIN_VELOCITY + 
                          Math.random() * (GAME_CONFIG.BOMB_MAX_VELOCITY - GAME_CONFIG.BOMB_MIN_VELOCITY);
      const difficultyBonus = difficultyLevel * (GAME_CONFIG.VELOCITY_INCREASE * 0.8); // Bombs slightly slower
      this.vy = -(baseVelocity + difficultyBonus);
    } else {
      const baseVelocity = GAME_CONFIG.BASE_FRUIT_MIN_VELOCITY + 
                          Math.random() * (GAME_CONFIG.BASE_FRUIT_MAX_VELOCITY - GAME_CONFIG.BASE_FRUIT_MIN_VELOCITY);
      const difficultyBonus = difficultyLevel * GAME_CONFIG.VELOCITY_INCREASE;
      this.vy = -(baseVelocity + difficultyBonus);
    }
    
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * (0.4 + difficultyLevel * 0.1);
    
    // Select type based on whether it's a bomb or fruit
    this.type = this.isBomb ? BOMB_TYPE : this.selectFruitType(difficultyLevel);
    this.sliced = false;
    this.particles = [];
    this.createdAt = Date.now();
    
    // Different size multipliers for bombs vs fruits
    const sizeMultiplier = this.isBomb ? GAME_CONFIG.BOMB_SIZE_MULTIPLIER : GAME_CONFIG.FRUIT_SIZE_MULTIPLIER;
    this.actualSize = this.type.size * sizeMultiplier;
  }

  private selectFruitType(difficultyLevel: number): FruitType {
    const availableFruits = FRUIT_TYPES.filter(fruit => {
      switch (fruit.rarity) {
        case 'common':
          return true;
        case 'uncommon':
          return difficultyLevel >= 3;
        case 'rare':
          return difficultyLevel >= 6;
        case 'legendary':
          return difficultyLevel >= 8;
        default:
          return true;
      }
    });

    // Weighted selection based on rarity
    const weights = availableFruits.map(fruit => {
      switch (fruit.rarity) {
        case 'common': return 60;
        case 'uncommon': return 25;
        case 'rare': return 10;
        case 'legendary': return 5;
        default: return 50;
      }
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableFruits.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableFruits[i];
      }
    }

    return availableFruits[0]; // Fallback
  }

  update(): void {
    if (!this.sliced) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GAME_CONFIG.GRAVITY;
      this.rotation += this.rotationSpeed;
      
      // Air resistance (slightly more at higher difficulties for balance)
      const airResistance = 0.999 - (this.difficultyLevel * 0.0001);
      this.vx *= airResistance;
    }

    // Update particles with improved physics
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3;
      particle.vx *= 0.98;
      particle.life--;
      return particle.life > 0;
    });
  }

  slice(): void {
    this.sliced = true;
    
    // Different particle effects for bombs vs fruits
    if (this.isBomb) {
      // Bomb explosion - dark particles with red/orange
      const particleCount = 35;
      const explosionColors = ['#ff4757', '#ff6b35', '#2c2c2c', '#ff9ff3'];
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: this.x + (Math.random() - 0.5) * this.actualSize,
          y: this.y + (Math.random() - 0.5) * this.actualSize,
          vx: (Math.random() - 0.5) * 25, // More explosive
          vy: (Math.random() - 0.5) * 25 - 12,
          life: 50 + Math.random() * 40,
          maxLife: 90,
          color: explosionColors[Math.floor(Math.random() * explosionColors.length)],
          size: 3 + Math.random() * 8
        });
      }
    } else {
      // Regular fruit particles
      const baseParticleCount = 20;
      const rarityMultiplier = this.type.rarity === 'legendary' ? 3 : 
                             this.type.rarity === 'rare' ? 2.5 : 
                             this.type.rarity === 'uncommon' ? 2 : 1;
      
      const particleCount = Math.floor((baseParticleCount + (this.actualSize / 8)) * rarityMultiplier);
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: this.x + (Math.random() - 0.5) * this.actualSize,
          y: this.y + (Math.random() - 0.5) * this.actualSize,
          vx: (Math.random() - 0.5) * (16 + rarityMultiplier * 4),
          vy: (Math.random() - 0.5) * (16 + rarityMultiplier * 4) - 8,
          life: 40 + Math.random() * (30 + rarityMultiplier * 20),
          maxLife: 70 + rarityMultiplier * 30,
          color: this.type.color,
          size: 2 + Math.random() * (5 + rarityMultiplier)
        });
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.sliced) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      if (this.isBomb) {
        // Special bomb rendering with danger effects
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.01) * 10; // Pulsing danger glow
        ctx.globalAlpha = 0.9 + Math.sin(Date.now() * 0.008) * 0.1; // Slight pulsing
        
        // Draw bomb emoji with warning effect
        ctx.font = `${this.actualSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.emoji, 0, 0);
        
        // Add danger indicator ring
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.012) * 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, this.actualSize / 2 + 15, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Regular fruit rendering
        const glowIntensity = this.type.rarity === 'legendary' ? 30 : 
                             this.type.rarity === 'rare' ? 20 : 10;
        
        ctx.shadowColor = this.type.rarity === 'legendary' ? '#f1c40f' : 
                         this.type.rarity === 'rare' ? '#e056fd' : 
                         'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = glowIntensity;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        // Special glow effect for rare fruits
        if (this.type.rarity === 'rare' || this.type.rarity === 'legendary') {
          ctx.shadowColor = this.type.color;
          ctx.shadowBlur = 25;
          ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        }
        
        // Draw fruit emoji
        ctx.font = `${this.actualSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.emoji, 0, 0);
      }
      
      ctx.restore();
    }

    // Draw particles with special effects for bombs
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      // Enhanced particle effects for bombs
      if (this.isBomb) {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 15;
      } else if (this.type.rarity === 'rare' || this.type.rarity === 'legendary') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
      }
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  isOffScreen(canvasWidth: number, canvasHeight: number): boolean {
    return this.y > canvasHeight + 200 || 
           this.x < -200 || 
           this.x > canvasWidth + 200 ||
           Date.now() - this.createdAt > GAME_CONFIG.FRUIT_LIFETIME;
  }

  checkCollision(x: number, y: number): boolean {
    if (this.sliced) return false;
    const distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
    // Reduced collision radius
    const collisionRadius = this.isBomb ? 
      (this.actualSize / 2 + 25) : // Slightly smaller for bombs
      (this.actualSize / 2 + 30);  // Reduced from previous values
    return distance < collisionRadius;
  }
}