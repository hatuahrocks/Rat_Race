# 🐀 Rat Racer

A kid-friendly side-scrolling lane racing game built with Phaser 3. Race as one of 8 unique rat characters through themed environments, using boost strategically and hitting ramps for airtime!

## 🎮 Play Now

### Local Development
```bash
# Quick start
npm start

# Then open http://localhost:8080
```

## 🎯 Game Features

- **8 Unique Rat Characters** - Each with two-tone colors or patches
- **Lane-Based Racing** - 4 lanes with swipe controls
- **Boost System** - Hold or tap modes for strategic speed bursts
- **Ramps & Airtime** - Automatic launches when hitting ramps
- **Themed Environments** - Indoor and outdoor racing tracks
- **AI Opponents** - Race against computer-controlled rats
- **Mobile Optimized** - Designed for iPad Safari with touch controls

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

### Touch (iPad/Mobile)
- **Swipe Up** - Move one lane up
- **Swipe Down** - Move one lane down
- **Boost Button** - Large on-screen button (right side)

### Keyboard
- **↑/↓ Arrows** - Change lanes
- **Spacebar/→** - Activate boost

## 🏗️ Project Structure

```
rat-racer/
├── index.html          # Entry point
├── package.json        # Project config
├── src/
│   ├── main.js        # Game initialization
│   ├── config/        # Game constants
│   ├── scenes/        # Game scenes
│   ├── objects/       # Game objects
│   ├── systems/       # Core systems
│   └── data/          # Character data
├── assets/
│   ├── svg/           # Vector graphics
│   ├── png/           # Raster fallbacks
│   └── audio/         # Sound effects
└── docs/              # Documentation
```

## 🚀 Building for Distribution

### Newgrounds
```bash
npm run build-zip
# Creates rat-racer.zip ready for upload
```

### Web Hosting
Simply upload all files to any static web server. The game runs entirely in the browser with no backend required.

## 📱 Mobile Testing

1. Start local server: `npm start`
2. Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
3. On mobile device: Navigate to `http://YOUR_IP:8080`

## 🛠️ Development

### Requirements
- Modern web browser
- Python 3 or Node.js (for local server)
- No build step required for development

### Key Technologies
- **Phaser 3** - HTML5 game framework
- **SVG Graphics** - Scalable vector graphics
- **Touch Events** - Mobile-first input handling
- **ES6 JavaScript** - Modern JavaScript features

## 📈 Performance Targets

- **60 FPS** on iPad Air 2+
- **< 3 second** initial load time
- **< 50MB** total package size
- **Responsive** scaling for all screen sizes

## 🎨 Customization

### Adding Characters
Edit `src/data/characters.js` to add new rat presets with custom colors.

### Creating Themes
Add new level themes in `src/data/characters.js` under `LevelThemes`.

### Adjusting Difficulty
Modify constants in `src/config/config.js` to tune gameplay.

## 📝 TODO - Next Steps

### Art & Audio
- [ ] Commission final rat character art
- [ ] Create detailed vehicle designs
- [ ] Design themed obstacle sets
- [ ] Add sound effects (engine, boost, collision)
- [ ] Compose background music tracks

### Features
- [ ] Implement leaderboards
- [ ] Add achievement system
- [ ] Create more level themes
- [ ] Add power-up system
- [ ] Implement championship mode

### Polish
- [ ] Add particle effects
- [ ] Improve UI animations
- [ ] Create intro cutscene
- [ ] Add tutorial mode
- [ ] Implement settings menu

## 🐛 Known Issues

- Audio requires user interaction to start (browser requirement)
- Touch controls need refinement for small screens
- AI behavior could be more sophisticated

## 📄 License

MIT License - Feel free to use this code for your own projects!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ using Phaser 3**

*Version 0.1.0 - Prototype*