# Rat Racer - Packaging & Deployment Guide

## Running Locally

### Quick Start
```bash
# Install dependencies (if any)
npm install

# Start local server
npm start

# Open browser to http://localhost:8080
```

### Alternative Methods
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js http-server
npx http-server -p 8080

# PHP
php -S localhost:8080
```

## Testing on iPad Safari

1. **Local Network Testing:**
   - Find your computer's IP address: `ifconfig` or `ipconfig`
   - Start server with: `npm start`
   - On iPad, navigate to: `http://YOUR_IP:8080`

2. **USB Testing (Mac):**
   - Connect iPad via USB
   - Open Safari on Mac
   - Develop menu → Your iPad → Select page

3. **Remote Debugging:**
   - Enable Web Inspector on iPad: Settings → Safari → Advanced → Web Inspector
   - Use Safari developer tools on Mac for debugging

## Building for Newgrounds

### Automatic Build
```bash
npm run build-zip
```

This creates `rat-racer.zip` with:
- index.html at root
- All source files
- All assets
- Proper structure for Newgrounds

### Manual Build
```bash
# Create zip file
zip -r rat-racer.zip index.html src assets package.json

# Exclude unnecessary files
zip -r rat-racer.zip index.html src assets -x "*.DS_Store" -x "__MACOSX/*"
```

### Newgrounds Upload Checklist
1. ✅ index.html must be at root of ZIP
2. ✅ All paths must be relative
3. ✅ File size under 100MB
4. ✅ No external dependencies (CDN Phaser is OK)
5. ✅ Test in Newgrounds preview before publishing

### Newgrounds Project Settings
- **Category:** Games - Action - Other
- **Tags:** racing, animals, kids, arcade
- **Rating:** Everyone
- **Technology:** HTML5
- **Dimensions:** 1024x768 (will scale)

## PWA Deployment

### Required Files

1. **manifest.json**
```json
{
  "name": "Rat Racer",
  "short_name": "RatRacer",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#87CEEB",
  "theme_color": "#FFD700",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Service Worker (sw.js)**
```javascript
const CACHE_NAME = 'rat-racer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  // Add all game files
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

3. **Add to index.html**
```html
<link rel="manifest" href="manifest.json">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
</script>
```

## Performance Optimization

### Asset Optimization
1. **Compress SVGs:**
```bash
npx svgo assets/svg/**/*.svg
```

2. **Create sprite atlases:**
   - Combine multiple PNGs into texture atlases
   - Use Texture Packer or similar tools

3. **Minify JavaScript:**
```bash
npx terser src/**/*.js -o dist/game.min.js
```

### Loading Optimization
1. Preload critical assets first
2. Lazy load backgrounds and non-essential sprites
3. Use asset compression (gzip/brotli)
4. Implement progressive loading screens

### Mobile Optimization
1. Reduce particle effects on mobile
2. Lower resolution textures for older devices
3. Implement quality settings
4. Use object pooling for frequently created objects

## Platform-Specific Builds

### itch.io
- Direct HTML5 upload supported
- ZIP file with index.html at root
- Set viewport: 1024x768
- Enable fullscreen button

### Game Portals
- Remove external links
- Add portal-specific APIs if required
- Test ad integration points
- Implement leaderboard hooks

### App Stores (via Capacitor)

1. **Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. **Add platforms:**
```bash
npx cap add ios
npx cap add android
```

3. **Build:**
```bash
npx cap sync
npx cap open ios  # Opens Xcode
npx cap open android  # Opens Android Studio
```

## Troubleshooting

### Common Issues

**Problem:** Game doesn't load on Newgrounds
- Check console for errors
- Verify all paths are relative
- Ensure no CORS issues

**Problem:** Touch controls not working
- Check touch event handlers
- Verify pointer events are enabled
- Test with device emulation

**Problem:** Performance issues on mobile
- Reduce particle effects
- Lower texture resolution
- Implement frame skipping
- Check memory leaks

**Problem:** Audio not playing
- User interaction required for audio
- Check audio format compatibility
- Implement audio unlock on first tap

## Testing Checklist

### Pre-release Testing
- [ ] Test on iPad Safari
- [ ] Test on iPhone Safari  
- [ ] Test on Chrome Desktop
- [ ] Test on Firefox Desktop
- [ ] Test on Chrome Android
- [ ] Test Newgrounds preview
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Check all 8 characters
- [ ] Verify boost mechanics
- [ ] Test lane changes
- [ ] Verify race completion
- [ ] Check memory usage over time

### Performance Metrics
- Target: 60 FPS on iPad Air 2+
- Load time: < 3 seconds
- Memory usage: < 200MB
- Package size: < 50MB

## Version Management

### Semantic Versioning
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Update Process
1. Update version in package.json
2. Update CLAUDE.md with changes
3. Create git tag
4. Build production ZIP
5. Upload to platforms
6. Update live version

## Support & Feedback

### Bug Reports
Include:
- Device and OS version
- Browser version
- Steps to reproduce
- Screenshot/video if possible
- Console errors

### Analytics (Optional)
```javascript
// Simple analytics
function trackEvent(category, action, label) {
  // Implementation depends on service
  console.log('Event:', category, action, label);
}
```

## Next Steps

1. **Polish Phase:**
   - Add final art assets
   - Implement sound effects
   - Add music tracks
   - Polish UI animations

2. **Feature Additions:**
   - Leaderboards
   - Achievements
   - More characters
   - Additional tracks
   - Power-ups

3. **Marketing:**
   - Create trailer
   - Screenshots for stores
   - Press kit
   - Social media assets

---
*Last Updated: [Current Date]*
*Version: 0.1.0*