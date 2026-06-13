# Rat Race - Phaser 3 HTML5 Game

## Current Game State
An Excitebike-style lane racing game: 6-lane system (4 road + 2 offroad), vehicle collisions with boost/push mechanics, rubber-banded AI opponents, procedural garden visuals, and a PWA setup for iOS home-screen play.

## Core Mechanics

### Lanes
- **6-Lane System**: 4 road lanes (0-3) + 2 offroad lanes (-1 high, 4 low)
- `extendedLane` property (-1 to 4) is the source of truth; array lookups use `EXTENDED_LANE_POSITIONS[extendedLane + 1]`
- Offroad: 25% slowdown (`OFFROAD_SLOWDOWN`), rumble + dust effects, no obstacles spawn there

### Collisions
- **Rear-end**: front vehicle gets a speed boost (1.4x, or 1.8x if it was braking — the "brake bait" tactic); back vehicle crawls at `VEHICLE_BLOCK_SPEED` (25%) until clear
- **Side**: aggressor pushes victim into the adjacent lane (including offroad) with a 1s slowdown
- **Obstacles**: hitting one triggers a ~1.1s spin-out (`SPIN_OUT_DURATION`) — heavy slowdown with a 360° spin animation, NOT a full stop. The world never freezes. Airborne vehicles (off ramps) clear obstacles entirely.
- Collision detection: bounding boxes + swept boxes for high speed (GameScene.checkVehicleCollisions)

### AI & difficulty
- 3-5 opponents per `GameConfig.DIFFICULTY` (easy/medium/hard set on the track-select screen; controls AI count, skill, and speed range)
- **Rubber-banding** (AIVehicle.update): AI ahead of the player by >320px eases off (down to 0.7x); behind by >220px speeds up (up to 1.45x). Keeps rivals on screen and races close.
- AI seeks strawberries/ramps, avoids obstacles, returns to road within ~1s of going offroad

### Race flow & stats
- Camera is FIXED (`setScroll(-262, 0)`) — the world scrolls past it; the track never shifts when changing lanes
- World scroll speed = player speed; everything (obstacles, dividers, parallax) moves relative to the player
- GameScene tracks real stats (time, top speed, boosts used, strawberries, obstacles hit) in `raceStats` and passes them to RaceEndScene — never fake stat values
- Rival progress markers (colored dots) render on the UIScene progress bar via `updateRacerMarkers`

## Technical Architecture

### File Structure (verified)
```
RatRace/
├── index.html              # loads scripts sequentially with ?v=VERSION cache busting
├── manifest.json           # PWA manifest
├── src/
│   ├── main.js             # Phaser config + scene registration
│   ├── config/
│   │   ├── config.js       # GameConfig: all constants + VERSION
│   │   └── LevelThemes.js  # 3 themes (Garden/Beach/Living Room), each with full palette + scenery; LevelManager builds the environment from theme.palette
│   ├── data/
│   │   └── characters.js   # 8 rat characters (name, colors, accessory)
│   ├── scenes/
│   │   ├── PreloadScene.js
│   │   ├── MainMenuScene.js
│   │   ├── SelectionScene.js          # character select (NOT "CharacterSelectionScene")
│   │   ├── CarColorSelectionScene.js  # 8 car colors
│   │   ├── TrackSelectionScene.js     # theme + difficulty picker (persists to localStorage 'ratrace_prefs')
│   │   ├── GameScene.js               # main race: collisions, stats, race flow
│   │   ├── UIScene.js                 # HUD overlay (launched, not started)
│   │   └── RaceEndScene.js            # results + real stats
│   ├── objects/
│   │   ├── Vehicle.js         # BASE CLASS: all racing mechanics (lanes, boosts, spin-outs, blocking, airborne, offroad, collision boxes). Subclasses customize via opts + hooks (approveLaneChange, applySpeedModifiers, onOffroadTick)
│   │   ├── PlayerVehicle.js   # thin: registry color + obstacle-clear lane check
│   │   ├── AIVehicle.js       # AI brain, lane-change cooldown, rubber-banding, return-to-road failsafe
│   │   ├── Obstacle.js        # garden obstacle art + warning ring
│   │   ├── Ramp.js            # jump ramp
│   │   └── Strawberry.js      # boost power-up
│   └── systems/
│       ├── GameArt.js         # shared procedural art: gradients, car sprite, panels, buttons, warning rings
│       ├── LevelManager.js    # parallax garden environment, road, finish line, progress
│       ├── ObstacleSpawner.js # obstacle/ramp/strawberry spawning + collision queries
│       ├── InputManager.js    # keyboard + swipe input
│       ├── AudioManager.js    # SHARED via registry — never destroy from a scene
│       ├── PaletteSwap.js     # procedural rat sprites + accessories
│       ├── PatchesManager.js
│       └── DebugLogger.js     # window.debugLogger
├── assets/audio/              # real files (bump, boost, push, ramp, brake, music_menu.mp3, music_race.wav)
└── (all art is drawn procedurally — there are no image assets)
```

### Key Constants (src/config/config.js)
```javascript
EXTENDED_LANE_POSITIONS: [184, 264, 344, 424, 504, 584] // Y for all 6 lanes
BASE_FORWARD_SPEED: 312
OFFROAD_SLOWDOWN: 0.75
BOOST_SPEED_MULTIPLIER: 1.6   // manual boost adds +60%; ramp +50%; strawberry +70% (additive)
SPIN_OUT_DURATION: 1100       // ms; obstacle hit = spin-out, never a dead stop
VEHICLE_BLOCK_SPEED: 0.25     // crawl speed when stuck behind a vehicle
RACE_DISTANCE: 10000
```

## Known Pitfalls (learned the hard way)
- **AudioManager is shared** through `this.registry.get('audioManager')`. Destroying it in any scene's `shutdown()` silences the whole session.
- Per-frame speed is **recalculated every update** in both vehicle classes. Any externally-set speed (e.g. collision boost) must set a guard flag (`hasCollisionBoost`) or it is overwritten on the next frame.
- UIScene/GameScene instances are **reused across races** — reset any per-race state (e.g. `racerMarkers`) in `create()`, not just the constructor.
- Use `this.scene.time.now`, not `Date.now()`, for game-time cooldowns.
- Don't add per-frame `console.log` calls — they were a real performance/noise problem and were deliberately stripped.
- Racing mechanics belong in `Vehicle.js` (the shared base class), not in PlayerVehicle/AIVehicle. Add behavior differences through the hook methods (`approveLaneChange`, `applySpeedModifiers`, `onOffroadTick`) or constructor opts — do not re-duplicate logic into the subclasses.
- Best race times persist in `localStorage` under `ratrace_best_times` (per character name), managed by RaceEndScene. Track/difficulty preferences persist under `ratrace_prefs` (TrackSelectionScene).
- `GameArt.createButton(scene, x, y, WIDTH, HEIGHT, label, opts, cb)` — forgetting width/height shifts every argument and throws inside scene.create(), which kills Phaser's game loop SILENTLY (frozen game, empty console). If the game freezes with no errors, suspect an exception inside a scene lifecycle method.
- `music_race.wav` is a generated chiptune loop (played by GameScene.startRace, stopped in endRace); menu music is handled by MainMenuScene.

## Version Management
**IMPORTANT**: Always increment the version when making changes, in BOTH places:
1. `src/config/config.js` → `GameConfig.VERSION`
2. `index.html` → `gameVersion` constant

They must match. `index.html` appends `?v=X.X.X` to every script URL for cache busting (critical for iOS home-screen apps).

Format `MAJOR.MINOR.PATCH`: patch = bug fix, minor = feature, major = breaking.

## Running the Game
```bash
# Local dev server (no build step — plain script tags)
npx http-server -p 8082 -c-1
# or
python3 -m http.server 8082 --bind 0.0.0.0   # accessible from iPad/mobile on LAN
```
- Find your LAN IP with `ifconfig | grep "inet " | grep -v 127.0.0.1`, then open `http://<ip>:8082` on the device.
- There are **no lint/typecheck/test scripts** — `package.json` has stubs only.
- Syntax-check a file quickly with `node --check src/path/file.js`.

## Controls
- **Up/Down arrows**: lane changes (swipe up/down on touch)
- **Spacebar / boost buttons**: boost (full-meter tap system with cooldown)
- **Left arrow / swipe back**: brake (tactical — bait a rear-end collision for a 1.8x boost)

---
*Last Updated: 2026-06-12 (v1.12.0)*
