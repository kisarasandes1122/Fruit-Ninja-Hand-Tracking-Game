# 🍎 Fruit Ninja - Hand Tracking Game 

A modern web-based Fruit Ninja game that uses hand tracking technology to slice fruits with natural hand gestures. Built with React, TypeScript, and MediaPipe for an immersive gaming experience.

![Fruit Ninja Demo](https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🎮 Core Gameplay
- **Hand Gesture Control**: Slice fruits using natural hand movements
- **Progressive Difficulty**: 10 difficulty levels with increasing speed and complexity
- **Combo System**: Chain slices for multiplier bonuses (up to 5x)
- **Multiple Fruit Types**: 8 different fruits with varying point values
- **Bomb Avoidance**: Dangerous bombs that cost lives when sliced
- **Lives System**: 3 lives with visual heart indicators

### 🤖 Advanced Hand Tracking
- **Real-time Detection**: 60fps hand landmark detection using MediaPipe
- **Multiple Detection Methods**: Velocity, acceleration, and gesture-based slicing
- **Gesture Recognition**: Pointing, slicing, and idle gesture detection
- **Predictive Collision**: Advanced collision detection with multiple fallback methods
- **Visual Feedback**: Dynamic trail effects and slice zones

### 🎨 Visual Effects
- **Particle Systems**: Explosive fruit slicing effects
- **Dynamic Trails**: Velocity-based hand movement trails
- **Glow Effects**: Special effects for rare fruits and bombs
- **Responsive Design**: Optimized for all screen sizes
- **Camera Background**: Optional semi-transparent camera feed

### 📊 Game Progression
- **Difficulty Scaling**: Automatic difficulty adjustment based on score
- **High Score Tracking**: Persistent local storage of best scores
- **Performance Stats**: Real-time game statistics display
- **Level Indicators**: Visual progress tracking to next difficulty level

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with camera access
- Well-lit environment for optimal hand tracking

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kisarasandes1122/Fruit-Ninja-Hand-Tracking-Game.git
   cd fruit-ninja-hand-tracking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Grant camera permissions when prompted
   - Wait for hand tracking initialization

### Building for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Setup
1. **Camera Position**: Ensure your camera has a clear view of your upper body
2. **Lighting**: Use good lighting for optimal hand detection
3. **Hand Position**: Keep your hand visible in the camera frame

### Controls
- **Raise Hand**: Position your hand in front of the camera
- **Point**: Extend your index finger for precise targeting
- **Slice**: Make quick, deliberate movements to slice fruits
- **Avoid Bombs**: Don't slice the black bombs (💣) - they cost lives!

### Scoring
- **Regular Fruits**: 10-25 points based on type
- **Rare Fruits**: 50-100 points for special fruits
- **Combo Multiplier**: Chain slices for bonus points
- **Lives**: You have 3 lives - don't let fruits fall or slice bombs!

## 🏗️ Technical Architecture

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **MediaPipe**: Google's ML framework for hand tracking

### Key Components

#### `useHandTracker` Hook
- Real-time hand landmark detection
- Gesture recognition and classification
- Velocity and acceleration calculations
- Multi-method slice detection

#### `GameCanvas` Component
- 60fps game loop with requestAnimationFrame
- Collision detection system
- Particle effects and visual feedback
- Difficulty scaling and fruit spawning

#### `Fruit` Class
- Physics simulation with gravity
- Particle explosion effects
- Rarity-based scoring system
- Bomb vs fruit differentiation

### Performance Optimizations
- **GPU Acceleration**: MediaPipe GPU delegate for hand tracking
- **Efficient Rendering**: Canvas-based rendering with optimized draw calls
- **Memory Management**: Automatic cleanup of particles and expired objects
- **Frame Rate Control**: Adaptive frame rate based on device capabilities

## 🎮 Game Configuration

### Difficulty Levels
The game features 10 progressive difficulty levels:

| Level | Name | Speed | Max Fruits | Bomb Rate |
|-------|------|-------|------------|-----------|
| 1 | Beginner | 100% | 3 | 2% |
| 2 | Easy | 110% | 4 | 3% |
| 3 | Normal | 120% | 5 | 4% |
| ... | ... | ... | ... | ... |
| 10 | LEGENDARY | 200% | 12 | 12% |

### Fruit Types
- **Common**: Apple (🍎), Banana (🍌), Orange (🍊), Strawberry (🍓)
- **Uncommon**: Watermelon (🍉), Pineapple (🍍)
- **Rare**: Dragon Fruit (🐉) - 50 points
- **Legendary**: Golden Apple (🏆) - 100 points

## 🔧 Configuration

### Game Settings (`src/game/constants.ts`)
```typescript
export const GAME_CONFIG = {
  SLICE_VELOCITY_THRESHOLD: 150,
  COLLISION_BASE_RADIUS: 35,
  COMBO_TIME_WINDOW: 2000,
  MAX_LIVES: 3,
  // ... more settings
};
```

### Hand Tracking Settings
```typescript
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

## 🐛 Troubleshooting

### Common Issues

**Hand tracking not working:**
- Ensure camera permissions are granted
- Check lighting conditions
- Try refreshing the page
- Verify browser compatibility

**Poor detection accuracy:**
- Improve lighting in your environment
- Keep hand clearly visible in frame
- Avoid busy backgrounds
- Ensure stable camera position

**Performance issues:**
- Close other browser tabs
- Check system resources
- Try reducing browser zoom level
- Ensure hardware acceleration is enabled

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🚀 Deployment

### Netlify (Recommended)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your web server
```

### Environment Considerations
- Ensure HTTPS for camera access in production
- Configure proper CORS headers if needed
- Optimize assets for faster loading

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Ensure responsive design

### Testing
- Test on multiple devices and browsers
- Verify hand tracking accuracy
- Check performance on lower-end devices
- Validate accessibility features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe**: Google's machine learning framework
- **React Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast build tool and development experience

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review browser compatibility requirements

---

**Enjoy slicing fruits with your hands! 🍎✋**