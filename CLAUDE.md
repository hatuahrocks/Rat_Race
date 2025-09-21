# Rat Racer - Project Overview & Planning Document

## Project Summary
- **Title:** Rat Racer
- **Genre:** Side-scrolling, lane-based racing game
- **Platform:** HTML5 (Phaser 3), optimized for iPad Safari
- **Target:** Kid-friendly racing game with simple controls
- **Core Loop:** Select rat → Race through themed levels → Avoid obstacles → Use boost strategically → Finish first

## Game Design

### Core Mechanics
- **Lane-based movement:** 4 lanes with swipe up/down controls
- **Boost system:** Primary action button (no manual jump)
- **Ramps:** Automatic airtime when hitting ramps
- **Obstacles:** Theme-appropriate hazards that slow players
- **Open-top vehicles:** Rats visible sitting in cars

### Controls
#### Touch (Primary - iPad)
- **Swipe Up:** Move one lane up
- **Swipe Down:** Move one lane down
- **Boost Button:** Large on-screen button (hold or tap modes)

#### Keyboard (Fallback)
- **Up/Down Arrows:** Lane changes
- **Spacebar/Right Arrow:** Boost

### Boost Modes
1. **Hold Mode (Default):** Hold to consume meter continuously
2. **Partial Mode:** Each press consumes fixed chunk (20%)

## Character Roster

### Rat Presets (8 Characters)
All rats use layered SVG system with recolorable parts:

| Name | Primary Color | Secondary Color | Special |
|------|--------------|-----------------|---------|
| **Butter** | #F8E6A0 | #F8E6A0 | Monotone cream |
| **Duke** | #8D8D93 | #FFFFFF | Grey/white two-tone |
| **Daisy** | #8A4FFF | #FFFFFF | Purple/white two-tone |
| **Pip** | #111111 | #FFFFFF | Black with patches |
| **Biscuit** | #8B5A2B | #FFFFFF | Brown with patches |
| **Slurp** | #C8A27E | #C8A27E | Light brown monotone |
| **Dippy** | #A76B3B | #A76B3B | Medium brown monotone |
| **Marshmallow** | #FFFFFF | #FFFFFF | All white |

### Visual System
- **Character Cards:** Large detailed view on selection screen
- **In-Race:** Simplified smaller sprites with layered colors
- **Patches:** Randomized patch placement for Pip & Biscuit

## Level Themes & Obstacles

### Indoor Themes
1. **Living Room**
   - Obstacles: Sofa, TV, chairs, coffee table
   - Ramps: Book stacks, cushions
   
2. **Kitchen**
   - Obstacles: Table legs, vacuum, dropped food
   - Ramps: Cutting boards, pot lids
   
3. **Stairs**
   - Obstacles: Toys, shoes
   - Ramps: Built-in stair levels

### Outdoor Themes
1. **Backyard**
   - Obstacles: Lawnmower, garden hose, sprinkler
   - Ramps: Garden tools, dirt mounds
   
2. **Pool Area**
   - Obstacles: Pool floats, deck chairs, crabs
   - Ramps: Diving board, inflatable toys
   
3. **Beach**
   - Obstacles: Sandcastles, crabs, shells
   - Ramps: Sand dunes, surfboards
   
4. **Sidewalk/Street**
   - Obstacles: Trash cans, fire hydrants, pigeons
   - Ramps: Curbs, skateboard ramps

## Technical Architecture

### Scene Structure
1. **PreloadScene** - Asset loading with progress bar
2. **MainMenuScene** - Title screen with Play/Settings
3. **SelectionScene** - Character card selection UI
4. **GameScene** - Main racing gameplay
5. **UIScene** - HUD overlay (boost meter, position, distance)
6. **RaceEndScene** - Results and replay options

### Core Systems
- **Vehicle System:** Player & AI vehicle physics, lane management
- **Input Manager:** Touch swipe detection, keyboard fallback
- **Obstacle Spawner:** Procedural obstacle placement
- **Level Manager:** Theme selection, distance tracking
- **Audio Manager:** SFX and music playback
- **Palette System:** Runtime SVG recoloring
- **Patches Manager:** Dynamic patch generation

### Game Constants
```javascript
LANE_COUNT: 4
LANE_Y_POSITIONS: [-120, -40, 40, 120]
BASE_FORWARD_SPEED: 200 px/sec
BOOST_SPEED_MULTIPLIER: 1.6
BOOST_MAX_SECONDS: 3
BOOST_REGEN_PER_SEC: 0.5
AIR_IMPULSE: -420 (vertical velocity)
GRAVITY: 1600
OBSTACLE_SLOW_AMOUNT: 0.5 (50% speed)
OBSTACLE_SLOW_DURATION: 1.2 seconds
RACE_DISTANCE: 10000 px
SWIPE_THRESHOLD: 30 px
```

## Development Roadmap

### MVP (Current)
- [x] Basic lane movement with swipe/keyboard
- [x] Boost system implementation
- [x] Ramp physics with airtime
- [x] Obstacle collision & slowdown
- [x] 8 rat character presets
- [x] Selection UI with character cards
- [x] Basic AI opponents
- [x] Race completion logic

### Version 1.0
- [ ] Polish all placeholder art
- [ ] Add sound effects and music
- [ ] Implement all 7 level themes
- [ ] Add particle effects
- [ ] Leaderboard system
- [ ] Settings menu (volume, controls)

### Post-Launch
- [ ] Additional characters
- [ ] Championship mode
- [ ] Unlockable vehicles
- [ ] Time trial mode
- [ ] Multiplayer support

## Asset Checklist

### SVG Assets (Placeholder)
- [x] 8 rat character bases
- [x] 3 patch variants
- [x] Open-top car sprite
- [x] Basic obstacles (6 types)
- [x] Ramp objects
- [x] UI elements (buttons, meters)

### Audio (To Add)
- [ ] Engine loop
- [ ] Boost sound
- [ ] Collision/crash SFX
- [ ] Ramp launch sound
- [ ] Victory fanfare
- [ ] Background music (3 tracks)
- [ ] UI click sounds

### Backgrounds
- [ ] 7 themed backgrounds (parallax layers)
- [ ] Start/finish line graphics
- [ ] Track decorations

## Mobile Optimization

### Performance Targets
- 60 FPS on iPad Air 2+
- < 3 second initial load
- < 50MB total package size

### Optimization Strategies
1. Use SVG for scalable graphics
2. Implement object pooling for obstacles
3. Minimize draw calls with sprite batching
4. Lazy load non-critical assets
5. Use CSS containment for UI elements
6. Throttle non-critical updates

## Packaging & Distribution

### Newgrounds Export
1. Run `npm run build-zip`
2. Ensure index.html at root
3. Include all assets in relative paths
4. Test in Newgrounds preview
5. Submit with appropriate tags

### PWA Support
- manifest.json configured
- Service worker for offline play
- App icons in multiple sizes
- Install prompt implementation

### Native App (Future)
- Capacitor.js integration ready
- iOS build configuration
- App Store assets preparation
- TestFlight beta testing

## Testing Checklist

### Functionality
- [ ] All 8 characters selectable
- [ ] Lane changes responsive
- [ ] Boost depletes and regenerates
- [ ] Ramps create proper airtime
- [ ] Obstacles slow vehicles
- [ ] Race completes at distance
- [ ] AI opponents behave correctly

### Device Testing
- [ ] iPad Safari (primary)
- [ ] iPhone Safari
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Chrome Android

### Performance
- [ ] Maintain 60 FPS during gameplay
- [ ] No memory leaks over extended play
- [ ] Quick scene transitions
- [ ] Responsive touch controls

## Next Steps (Post-Prototype)

1. **Art Polish**
   - Commission final rat character art
   - Create detailed vehicle designs
   - Design themed obstacle sets
   - Develop parallax backgrounds

2. **Audio Integration**
   - Record/source sound effects
   - Commission background music
   - Implement dynamic audio mixing
   - Add voice clips for characters

3. **Gameplay Tuning**
   - Balance boost regeneration
   - Adjust AI difficulty curve
   - Fine-tune obstacle spawn rates
   - Perfect ramp physics feel

4. **User Testing**
   - Kids playtesting sessions
   - Parent feedback collection
   - Accessibility review
   - Control scheme validation

5. **Launch Preparation**
   - Newgrounds submission
   - itch.io page setup
   - Social media assets
   - Gameplay trailer

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Create Newgrounds ZIP
npm run build-zip

# Run tests
npm test
```

## File Structure
```
rat-racer/
├── index.html
├── package.json
├── CLAUDE.md
├── src/
│   ├── main.js
│   ├── config/
│   │   └── config.js
│   ├── scenes/
│   │   ├── PreloadScene.js
│   │   ├── MainMenuScene.js
│   │   ├── SelectionScene.js
│   │   ├── GameScene.js
│   │   ├── UIScene.js
│   │   └── RaceEndScene.js
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
│   └── data/
│       └── characters.js
├── assets/
│   ├── svg/
│   │   ├── rats/
│   │   ├── vehicles/
│   │   ├── obstacles/
│   │   └── ui/
│   ├── png/
│   └── audio/
└── docs/
    └── packaging.md
```

## Contact & Support
- GitHub Issues: [Project Repository]
- Discord: [Community Server]
- Email: support@ratracer.game

---
*Last Updated: [Current Date]*
*Version: 0.1.0-prototype*