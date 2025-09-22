# 🐀 Rat Race

An Excitebike-style racing game built with Phaser 3 featuring advanced collision mechanics, 6-lane racing system, and strategic offroad gameplay. Race as one of 8 unique rat characters with customizable car colors!

## 🎮 Play Now

### Local Development
```bash
# Start development server
python3 main.py

# Then open http://localhost:8000
```

## 🎯 Game Features

### Core Racing Mechanics
- **6-Lane System**: 4 road lanes + 2 offroad lanes for strategic gameplay
- **Vehicle Collisions**: Bump other racers from behind to boost them forward
- **Lane Pushing**: Side-impact other vehicles to push them into different lanes
- **Offroad Racing**: Voluntary offroad movement with 25% speed penalty
- **Obstacle Navigation**: Vehicles stop completely when hitting obstacles

### Visual & Audio
- **8 Unique Rat Characters**: Each with distinct colors and personalities
- **Car Color Customization**: 8 color combinations to choose from
- **Advanced Visual Effects**: Dust particles, rumble animations, collision feedback
- **Synchronized Movement**: All visual elements move at proper relative speeds
- **Ramp Physics**: Airborne system with shadow effects

### AI & Gameplay
- **Smart AI Opponents**: Lane changes, obstacle avoidance, collision responses
- **Boost System**: Strategic speed bursts with regeneration meter
- **Collision Feedback**: Exclamation marks and particle effects
- **Dynamic Terrain**: Animated offroad spots and lane dividers

## 🐭 Character Roster

1. **Butter** - Creamy yellow speedster
2. **Duke** - Grey and white champion  
3. **Daisy** - Purple racing princess
4. **Pip** - Black with white patches
5. **Biscuit** - Brown with white patches
6. **Slurp** - Light brown racer
7. **Dippy** - Medium brown speedster
8. **Marshmallow** - Pure white racer

## 🎮 Controls

### Keyboard
- **↑/↓ Arrow Keys** - Change lanes (including offroad)
- **Spacebar** - Activate boost

### Touch (Planned)
- **Swipe Up/Down** - Lane changes
- **Boost Button** - On-screen boost control

## 🏁 Game Flow

1. **Character Selection** - Choose your rat racer
2. **Car Color Selection** - Pick from 8 color combinations
3. **Racing** - 6-lane strategic racing with collision mechanics
4. **Collision System** - Bump and boost mechanics with visual feedback
5. **Finish Line** - Cross the finish line to win

## 🎯 Strategic Gameplay

### Lane System
- **Road Lanes (0-3)**: Normal speed racing lanes
- **Offroad Lanes (-1, 4)**: 25% speed penalty but strategic positioning
- **Lane Pushing**: Push opponents offroad to slow them down
- **Voluntary Offroad**: Choose to go offroad to avoid traffic

### Collision Mechanics
- **Rear-End Collisions**: Boost the vehicle in front (40% speed for 1.5 seconds)
- **Side Collisions**: Push vehicles into adjacent lanes or offroad
- **Obstacle Collisions**: Complete stops requiring lane changes to continue
- **Vehicle Blocking**: Cannot pass through other vehicles

## 🏗️ Technical Architecture

### Core Systems
- **Extended Lane System**: Unified 6-lane management (-1 to 4)
- **Collision Detection**: Distance-based with cooldown systems
- **Speed Management**: Considers offroad status, boost state, collisions
- **Visual Synchronization**: All elements move relative to player speed

### Key Files
```
src/
├── objects/
│   ├── PlayerVehicle.js    # Player vehicle with full mechanics
│   ├── AIVehicle.js        # AI opponents with matching mechanics
│   ├── Obstacle.js         # Static obstacles
│   └── Ramp.js            # Jump ramps with physics
├── scenes/
│   ├── GameScene.js        # Main racing scene
│   ├── CarColorSelectionScene.js  # Car customization
│   └── CharacterSelectionScene.js # Character picker
├── systems/
│   ├── LevelManager.js     # Road rendering and visual elements
│   ├── ObstacleSpawner.js  # Obstacle generation
│   └── InputManager.js     # Control handling
└── config/
    ├── config.js           # Game constants
    ├── Characters.js       # Character definitions
    └── LevelThemes.js      # Visual themes
```

## 🚀 Development

### Requirements
- Python 3 (for local server)
- Modern web browser
- No build tools required

### Testing Commands
```bash
# Start server
python3 main.py

# Access at http://localhost:8000
```

### Key Configuration
```javascript
// Game Constants (src/config/config.js)
EXTENDED_LANE_POSITIONS: [184, 264, 344, 424, 504, 584] // 6 lanes
OFFROAD_SLOWDOWN: 0.75          // 25% speed reduction offroad
BASE_FORWARD_SPEED: 312         // Base racing speed
BOOST_SPEED_MULTIPLIER: 1.8     // Boost multiplier
```

## ✅ Implemented Features

- ✅ 6-lane racing system with offroad lanes
- ✅ Vehicle-to-vehicle collision system
- ✅ Lane pushing mechanics (all directions)
- ✅ Offroad visual effects (dust, rumble, terrain)
- ✅ Obstacle collision system (complete stops)
- ✅ Ramp physics with airborne mechanics
- ✅ Car color customization screen
- ✅ AI opponents with human-like behavior
- ✅ Visual element synchronization
- ✅ Comprehensive speed management
- ✅ Collision feedback systems

## 🎨 Visual Effects

### Offroad Effects
- **Rumble Animation**: Vehicles bounce when offroad (6px player, 4px AI)
- **Dust Particles**: Dark brown particles trail behind offroad vehicles
- **Terrain Details**: Animated brown spots moving with lane dividers
- **Visual Feedback**: Reduced opacity (0.8) when offroad

### Collision Effects
- **Boost Particles**: Blue particles when receiving collision boost
- **Exclamation Marks**: Yellow "!" above pushed vehicles
- **Speed Lines**: Visual feedback for boost effects
- **Flash Effects**: Bright effects on collision impacts

## 📱 Performance

- **Target**: 60 FPS on modern browsers
- **Optimized**: Object pooling and efficient rendering
- **Scalable**: Vector graphics for all screen sizes
- **Lightweight**: Minimal asset footprint

## 🐛 Current Status

The game is fully functional with all major mechanics implemented:
- Advanced collision system working correctly
- AI vehicles properly respond to offroad slowdown
- Visual effects synchronized with gameplay
- 6-lane system supports strategic gameplay
- Car customization fully integrated

## 📄 License

MIT License - Feel free to use this code for your own projects!

## 🤝 Contributing

Contributions welcome! The game architecture is modular and well-documented.

---

**Built with Phaser 3 | Current Version: Fully Functional Racing Game**

*Last Updated: 2025-09-21*