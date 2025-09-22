# Rat Race - Phaser 3 HTML5 Game

## Current Game State
A fully functional Excitebike-style racing game with advanced collision mechanics, 6-lane system, and comprehensive visual effects.

## Key Features Implemented

### Core Racing Mechanics
- **6-Lane System**: 4 road lanes (0-3) + 2 offroad lanes (-1 high, 4 low)
- **Extended Lane Mapping**: Uses `extendedLane` property (-1 to 4) for full lane management
- **Lane Change Animations**: Smooth transitions between lanes with progress tracking
- **Speed Management**: Base speed increased by 30% for faster gameplay

### Collision System
- **Vehicle-to-Vehicle Collisions**: 
  - Rear-end collisions boost front vehicle (40% speed for 1.5 seconds)
  - Side collisions push vehicles into adjacent lanes or offroad
  - Collision cooldowns prevent spam collisions
- **Obstacle Interactions**: Vehicles stop completely when hitting obstacles
- **Vehicle Blocking**: Vehicles cannot pass through each other

### Offroad Mechanics
- **Offroad Areas**: Upper (-1) and lower (4) offroad lanes with brown terrain
- **Speed Penalty**: 25% slowdown when offroad (`GameConfig.OFFROAD_SLOWDOWN`)
- **Visual Effects**:
  - Rumble animation (6px amplitude for player, 4px for AI, doubled when offroad)
  - Dust particles behind vehicle (darker brown, world-space coordinates)
  - Reduced vehicle opacity (0.8 alpha)
- **Dark Brown Spots**: Animated terrain details moving at lane divider speed

### Visual Effects & UI
- **Car Color Selection**: 8 color options after character selection
- **Boost Effects**: Particle systems and visual feedback
- **Collision Feedback**: Exclamation marks and particle effects when pushed/boosted
- **Airborne System**: Shadow effects and physics for ramp jumps
- **Scrolling Elements**: All visual elements (dividers, obstacles, finish line) sync with player speed

### AI Behavior
- **Smart Decision Making**: Lane changes to avoid obstacles
- **Offroad Compliance**: AI vehicles properly slow down when offroad
- **Collision Responses**: AI receives boosts and gets pushed like player
- **Extended Lane Usage**: AI uses full 6-lane system including offroad

## Technical Architecture

### Key Files and Their Roles

#### Core Game Objects
- `src/objects/PlayerVehicle.js`: Player vehicle with full collision, offroad, and boost mechanics
- `src/objects/AIVehicle.js`: AI opponents with matching player mechanics
- `src/objects/Obstacle.js`: Static obstacles that stop vehicles
- `src/objects/Ramp.js`: Jump ramps with airborne physics

#### Scene Management
- `src/scenes/GameScene.js`: Main racing scene with collision detection and vehicle management
- `src/scenes/CarColorSelectionScene.js`: Car color picker (8 options)
- `src/scenes/CharacterSelectionScene.js`: Character selection
- `src/scenes/UIScene.js`: HUD with boost meter and race progress

#### Systems
- `src/systems/LevelManager.js`: Road rendering, lane dividers, offroad areas, finish line
- `src/systems/ObstacleSpawner.js`: Obstacle and ramp generation
- `src/systems/InputManager.js`: Keyboard/touch input handling
- `src/systems/AudioManager.js`: Sound effects (placeholder)

#### Configuration
- `src/config/config.js`: All game constants and settings
- `src/config/Characters.js`: Available rat characters
- `src/config/LevelThemes.js`: Visual themes for different tracks

### Important Game Constants
```javascript
EXTENDED_LANE_POSITIONS: [184, 264, 344, 424, 504, 584] // Y positions for all 6 lanes
OFFROAD_SLOWDOWN: 0.75 // 25% speed reduction
BASE_FORWARD_SPEED: 312 // Increased by 30% from original
BOOST_SPEED_MULTIPLIER: 1.8 // Boost multiplier
```

## Recent Major Fixes
1. **AI Offroad Slowdown**: AI vehicles now properly slow down when offroad
2. **Collision Boost System**: Enhanced with visual feedback and proper speed management
3. **Lane Pushing**: Bidirectional pushing system works for all lane types
4. **Visual Synchronization**: All moving elements sync with player speed
5. **Extended Lane System**: Unified 6-lane system for both player and AI

## Known Working Features
- ✅ 6-lane racing with voluntary offroad movement
- ✅ Vehicle-to-vehicle collisions with boost effects
- ✅ Lane pushing mechanics (including offroad pushing)
- ✅ Offroad visual effects (dust, rumble, terrain spots)
- ✅ Obstacle blocking (vehicles stop completely)
- ✅ Ramp jumping with airborne physics
- ✅ Car color selection screen
- ✅ AI opponents with human-like behavior
- ✅ Synchronized visual elements
- ✅ Proper speed management for all scenarios

## Game Flow
1. **Character Selection**: Choose from 8 rat characters
2. **Car Color Selection**: Pick from 8 car color combinations
3. **Racing**: 6-lane racing with strategic offroad usage
4. **Collision Mechanics**: Bump and boost other racers
5. **Obstacles**: Navigate around stopping obstacles
6. **Finish**: Cross finish line to complete race

## Controls
- **Arrow Keys**: Lane changes (up/down)
- **Spacebar**: Boost
- **Touch/Swipe**: Mobile controls for lane changes

## Version Management
**IMPORTANT**: Always increment the version number when making changes:
1. Edit `src/config/config.js`
2. Update `GameConfig.VERSION` (e.g., from '1.0.1' to '1.0.2')
3. This displays in the bottom-right corner of the title screen
4. Helps verify GitHub Pages has updated with latest changes

Version format: `MAJOR.MINOR.PATCH`
- Patch: Bug fixes (1.0.1 → 1.0.2)
- Minor: New features (1.0.2 → 1.1.0)
- Major: Breaking changes (1.1.0 → 2.0.0)

## Testing Commands
```bash
# Start development server (local only)
npm start

# Start development server accessible on local network (for iPad/mobile testing)
python3 -m http.server 8082 --bind 0.0.0.0

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Network Access
To access the game from iPad/mobile devices on your local WiFi network:

1. **Start network server**: `python3 -m http.server 8082 --bind 0.0.0.0`
2. **Find your laptop's IP**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. **Access from mobile**: Open `http://[YOUR_IP]:8082` in mobile browser
   - Example: `http://192.168.1.232:8082`
4. **Touch controls**: Game supports mobile touch input for lane changes and boost

## Development Notes
- Game uses Phaser 3 framework
- All coordinates are in pixels
- Extended lane system maps -1→0, 0→1, 1→2, 2→3, 3→4, 4→5 for array indexing
- Collision detection uses distance calculations with vehicle-specific ranges
- Speed management considers offroad status, boost state, and collision effects
- Visual effects use world coordinates for proper movement synchronization

## File Structure
```
RatRace/
├── index.html
├── main.py (server)
├── src/
│   ├── config/
│   │   ├── config.js
│   │   ├── Characters.js
│   │   └── LevelThemes.js
│   ├── scenes/
│   │   ├── GameScene.js
│   │   ├── CarColorSelectionScene.js
│   │   ├── CharacterSelectionScene.js
│   │   └── UIScene.js
│   ├── objects/
│   │   ├── PlayerVehicle.js
│   │   ├── AIVehicle.js
│   │   ├── Obstacle.js
│   │   └── Ramp.js
│   ├── systems/
│   │   ├── InputManager.js
│   │   ├── AudioManager.js
│   │   ├── ObstacleSpawner.js
│   │   ├── LevelManager.js
│   │   ├── PaletteSwap.js
│   │   └── PatchesManager.js
│   └── main.js
```

---
*Last Updated: 2025-09-21*
*Current State: Fully Functional Racing Game with Advanced Collision Mechanics*