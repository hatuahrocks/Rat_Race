class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTheme = null;
        this.distanceTraveled = 0;
        this.raceProgress = 0;
        this.isRaceComplete = false;
        this.finishLine = null;
    }
    
    setTheme(themeId) {
        // Resolve the requested theme by id; GARDEN is the default/fallback.
        // (Only GARDEN has bespoke scenery so far - other themes get its
        // backdrop but use their own obstacle sets.)
        this.currentTheme = Object.values(LevelThemes).find(t => t.id === themeId) || LevelThemes.GARDEN;
        this.applyTheme();
    }
    
    applyTheme() {
        // Set background color
        const bgColor = Phaser.Display.Color.HexStringToColor(this.currentTheme.backgroundColor);
        this.scene.cameras.main.setBackgroundColor(bgColor);
        
        // Create themed background elements
        this.createBackgroundElements();
    }
    
    createBackgroundElements() {
        // Parallax layers scrolled in update(): { containers: [a, b], factor, width }
        this.parallaxLayers = [];

        // Sky gradient (drawn tall so vertical camera follow never reveals edges)
        GameArt.ensureGradient(this.scene, 'sky-garden', 32, 512, [
            [0, '#4FACE9'],
            [0.55, '#8ED1F7'],
            [1, '#D9F2FF']
        ]);
        const sky = this.scene.add.image(-2000, -400, 'sky-garden');
        sky.setOrigin(0, 0);
        sky.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 560); // covers up to y=160 (horizon)
        sky.setDepth(-12);

        // Sun with soft glow
        const sunGlow = this.scene.add.circle(890, 58, 46, 0xFFF59D, 0.35);
        const sun = this.scene.add.circle(890, 58, 30, 0xFFEE58);
        sunGlow.setDepth(-11);
        sun.setDepth(-11);

        // Top grass bank between sky and the high offroad dirt
        GameArt.ensureGradient(this.scene, 'grass-top', 32, 64, [
            [0, '#94C946'],
            [1, '#6FA834']
        ]);
        const grassTop = this.scene.add.image(-2000, 100, 'grass-top');
        grassTop.setOrigin(0, 0);
        grassTop.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 58);
        grassTop.setDepth(-9);

        // Bottom grass foreground below the low offroad dirt
        GameArt.ensureGradient(this.scene, 'grass-bottom', 32, 64, [
            [0, '#6FA834'],
            [1, '#3F6B1D']
        ]);
        const grassBottom = this.scene.add.image(-2000, 616, 'grass-bottom');
        grassBottom.setOrigin(0, 0);
        grassBottom.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 360);
        grassBottom.setDepth(-9);

        // Distant parallax scenery: picket fence + hedge + flowers
        this.createParallaxPair(w => this.buildFenceSegment(w), 1280, 0.25, -8.5);
        this.createParallaxPair(w => this.buildHedgeSegment(w), 1280, 0.35, -8);
        this.createParallaxPair(w => this.buildTopFlowerSegment(w), 1280, 0.45, -7.5);

        // Foreground flowers/tufts on the bottom grass (move with the world)
        this.createParallaxPair(w => this.buildBottomFlowerSegment(w), 1400, 1.0, -7.5);

        // Drifting clouds (very slow parallax)
        this.createParallaxPair(w => this.buildCloudSegment(w), 1600, 0.08, -10);

        // Create road/track
        this.createRoad();
    }

    // Build two identical segments side by side; update() wraps them for seamless scroll
    createParallaxPair(builder, segmentWidth, factor, depth) {
        const containers = [0, 1].map(i => {
            const c = builder(segmentWidth);
            // Start one segment left of origin so the visible area left of x=0 is covered
            c.x = (i - 1) * segmentWidth;
            c.setDepth(depth);
            return c;
        });
        this.parallaxLayers.push({ containers, factor, width: segmentWidth });
    }

    buildFenceSegment(width) {
        const c = this.scene.add.container(0, 0);
        // Horizontal rails
        [104, 124].forEach(y => {
            const rail = this.scene.add.rectangle(0, y, width, 5, 0xE8E2D4);
            rail.setOrigin(0, 0.5);
            c.add(rail);
        });
        // Pickets
        for (let x = 0; x < width; x += 34) {
            const slat = this.scene.add.rectangle(x, 114, 9, 44, 0xF5F0E1);
            slat.setStrokeStyle(1, 0xC9C2AE);
            c.add(slat);
            const tip = this.scene.add.triangle(x, 89, -4.5, 5, 4.5, 5, 0, -4, 0xF5F0E1);
            c.add(tip);
        }
        return c;
    }

    buildHedgeSegment(width) {
        const c = this.scene.add.container(0, 0);
        const greens = [0x2E7D32, 0x388E3C, 0x43A047];
        for (let x = 20; x < width; x += 130) {
            // Each bush is a cluster of overlapping circles
            const jitter = (x * 7919) % 23; // deterministic per-position variation
            const baseY = 132 + (jitter % 6);
            c.add(this.scene.add.circle(x - 16, baseY, 16, greens[0]));
            c.add(this.scene.add.circle(x + 14, baseY + 2, 14, greens[0]));
            c.add(this.scene.add.circle(x, baseY - 8, 17, greens[1]));
            c.add(this.scene.add.circle(x - 6, baseY - 4, 12, greens[2]));
        }
        return c;
    }

    buildTopFlowerSegment(width) {
        const c = this.scene.add.container(0, 0);
        const petals = [0xF06292, 0xFFFFFF, 0xFFB74D, 0xE57373, 0xBA68C8];
        for (let x = 30; x < width; x += 90) {
            const pick = Math.floor((x * 31) % petals.length);
            c.add(GameArt.createFlower(this.scene, x, 146 + ((x * 13) % 8), petals[pick]));
        }
        return c;
    }

    buildBottomFlowerSegment(width) {
        const c = this.scene.add.container(0, 0);
        const petals = [0xF06292, 0xFFFFFF, 0xFFB74D, 0x64B5F6];
        for (let x = 40; x < width; x += 120) {
            const pick = Math.floor((x * 17) % petals.length);
            c.add(GameArt.createFlower(this.scene, x, 648 + ((x * 11) % 30), petals[pick]));
            c.add(GameArt.createGrassTuft(this.scene, x + 55, 660 + ((x * 7) % 40), 0x4E7B2F));
        }
        return c;
    }

    buildCloudSegment(width) {
        const c = this.scene.add.container(0, 0);
        const spots = [[120, 38, 0.9], [520, 64, 0.7], [900, 30, 1.1], [1300, 70, 0.8]];
        spots.forEach(([x, y, s]) => c.add(GameArt.createCloud(this.scene, x, y, s)));
        return c;
    }
    
    createRoad() {
        const roadY = GameConfig.VIEWPORT.HEIGHT / 2;
        const roadHeight = 320;

        // Main road surface - subtle vertical gradient so it reads as asphalt, not a flat slab
        GameArt.ensureGradient(this.scene, 'road-asphalt', 32, 256, [
            [0, '#565A5E'],
            [0.5, '#484C50'],
            [1, '#3E4246']
        ]);
        const road = this.scene.add.image(-2000, roadY - roadHeight / 2, 'road-asphalt');
        road.setOrigin(0, 0);
        road.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, roadHeight);
        road.setDepth(-5);

        // Soft shading just inside the road edges for depth
        [roadY - roadHeight / 2 + 9, roadY + roadHeight / 2 - 9].forEach(y => {
            const edgeShade = this.scene.add.rectangle(
                -2000, y,
                GameConfig.VIEWPORT.WIDTH * 6, 14,
                0x000000, 0.18
            );
            edgeShade.setOrigin(0, 0.5);
            edgeShade.setDepth(-4.5);
        });
        
        // Initialize lane divider arrays for animation
        this.laneDividers = [];
        
        // Initialize offroad spot arrays for animation
        this.offroadSpots = [];
        
        // Lane dividers - create scrolling pattern using containers
        for (let i = 1; i < GameConfig.LANE_COUNT; i++) {
            const laneY = GameConfig.LANE_Y_POSITIONS[i] - 40; // Between lanes
            
            // Create a container for this lane's dividers
            const dividerContainer = this.scene.add.container(0, laneY);
            dividerContainer.setDepth(-4);
            
            // Create initial set of dashes in the container - start further left to avoid early disappearing
            const dashCount = 200; // Enough dashes to cover any reasonable screen width
            for (let j = -5; j < dashCount; j++) { // Start 5 dashes to the left (400px buffer)
                const dash = this.scene.add.rectangle(
                    j * 80, 0, // Evenly spaced every 80px
                    40, 4,
                    0xFFFFFF
                );
                dash.setOrigin(0, 0.5);
                dash.setAlpha(0.7);
                dividerContainer.add(dash);
            }
            
            // Store the container for animation
            this.laneDividers.push(dividerContainer);
        }
        
        // Road edges - extend across full width
        const edgeTop = this.scene.add.rectangle(
            -2000, roadY - roadHeight/2, 
            GameConfig.VIEWPORT.WIDTH * 6, 8,
            0xFFFF00
        );
        edgeTop.setOrigin(0, 0.5);
        edgeTop.setDepth(-4);
        
        const edgeBottom = this.scene.add.rectangle(
            -2000, roadY + roadHeight/2, 
            GameConfig.VIEWPORT.WIDTH * 6, 8,
            0xFFFF00
        );
        edgeBottom.setOrigin(0, 0.5);
        edgeBottom.setDepth(-4);
        
        // Add offroad areas with rough texture
        this.createOffroadAreas(roadY, roadHeight);
    }
    
    createOffroadAreas(roadY, roadHeight) {
        // Dirt shoulders get a gradient and are tall enough to touch both
        // the road edge and the grass (no sky-colored gaps)
        GameArt.ensureGradient(this.scene, 'dirt-high', 32, 80, [
            [0, '#A18560'],
            [1, '#7C654A']
        ]);
        GameArt.ensureGradient(this.scene, 'dirt-low', 32, 80, [
            [0, '#8A7050'],
            [1, '#6E5840']
        ]);

        // High offroad area (above top lane): from grass (y=158) to road edge (y=224)
        const offroadHigh = this.scene.add.image(-2000, 156, 'dirt-high');
        offroadHigh.setOrigin(0, 0);
        offroadHigh.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 70);
        offroadHigh.setDepth(-6);

        // Low offroad area (below bottom lane): from road edge (y=544) to grass (y=616)
        const offroadLow = this.scene.add.image(-2000, 546, 'dirt-low');
        offroadLow.setOrigin(0, 0);
        offroadLow.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 72);
        offroadLow.setDepth(-6);
        
        // Add rough texture pattern to offroad areas
        this.createOffroadTexture(GameConfig.OFFROAD_HIGH_Y);
        this.createOffroadTexture(GameConfig.OFFROAD_LOW_Y);
    }
    
    createOffroadTexture(y) {
        // Create brown spots using simple approach - create individual spots and move them
        
        // Create spots directly, not in a container
        const spots = [];
        for (let x = -400; x < 8000; x += 80) { // Same 80px spacing as dividers
            if (Math.random() < 0.4) { // 40% chance to create a spot
                const spot = this.scene.add.ellipse(
                    x + Phaser.Math.Between(-20, 20), // Add some randomness to X
                    y + Phaser.Math.Between(-22, 22), // Random Y within offroad area
                    Phaser.Math.Between(6, 12),
                    Phaser.Math.Between(3, 6), // Flattened pebble/rut shapes
                    0x55432F // Dark brown
                );
                spot.setAlpha(0.5);
                spot.setDepth(-5);
                spots.push(spot);
            }
        }
        
        // Store spots for animation
        this.offroadSpots.push({ spots: spots, isSpotArray: true });
    }
    
    createFinishLine(x) {
        const finishContainer = this.scene.add.container(x, GameConfig.VIEWPORT.HEIGHT / 2 + 10); // Shift down 10px (split the difference)
        
        // Checkered pattern
        const tileSize = 20;
        const numTiles = 16;
        
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < 2; j++) {
                const color = (i + j) % 2 === 0 ? 0x000000 : 0xFFFFFF;
                const tile = this.scene.add.rectangle(
                    j * tileSize,
                    (i - numTiles/2) * tileSize,
                    tileSize, tileSize,
                    color
                );
                finishContainer.add(tile);
            }
        }
        
        // Finish text
        const finishText = this.scene.add.text(0, -200, 'FINISH', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        finishText.setOrigin(0.5);
        finishContainer.add(finishText);
        
        finishContainer.setDepth(-3);
        this.finishLine = finishContainer;
        
        return finishContainer;
    }
    
    update(scrollSpeed, delta) {
        // Update distance traveled
        this.distanceTraveled += scrollSpeed;
        
        // Calculate race progress
        this.raceProgress = Math.min(this.distanceTraveled / GameConfig.RACE_DISTANCE, 1);
        
        // Animate lane dividers moving toward player using modulo for seamless looping
        if (this.laneDividers && scrollSpeed > 0) {
            this.laneDividers.forEach(dividerContainer => {
                // Move the entire container at same speed as other elements
                dividerContainer.x -= scrollSpeed;
                
                // Use modulo to create seamless looping pattern
                // Reset when we've moved one dash spacing (80px)
                if (dividerContainer.x <= -80) {
                    dividerContainer.x += 80; // Reset by one dash spacing
                }
            });
        }
        
        // Animate offroad spots - move individual spots
        if (this.offroadSpots && scrollSpeed > 0) {
            this.offroadSpots.forEach(spotGroup => {
                if (spotGroup.isSpotArray && spotGroup.spots) {
                    spotGroup.spots.forEach(spot => {
                        spot.x -= scrollSpeed;

                        // Reset spot when it goes off screen left - give much more buffer
                        if (spot.x < -400) {
                            spot.x += 8400; // Move to far right (8000 + 400 buffer)
                        }
                    });
                }
            });
        }

        // Scroll parallax scenery (fence, hedge, flowers, clouds) and wrap segments
        if (this.parallaxLayers && scrollSpeed > 0) {
            this.parallaxLayers.forEach(layer => {
                layer.containers.forEach(c => {
                    c.x -= scrollSpeed * layer.factor;
                    // Wrap once fully past the visible left edge (camera sees ~x=-320)
                    if (c.x <= -layer.width - 400) {
                        c.x += layer.width * 2;
                    }
                });
            });
        }
        
        // Check for race completion - create finish line when we're close to the end
        if (this.raceProgress >= 0.9 && !this.isRaceComplete) {
            this.isRaceComplete = true;

            // Create finish line if it doesn't exist
            if (!this.finishLine) {
                this.createFinishLine(GameConfig.VIEWPORT.WIDTH + 200);
            }
        }

        // Update progress based on finish line position once it exists
        if (this.finishLine && this.isRaceComplete) {
            // Progress should be 100% when finish line reaches x=200 (player crosses it)
            // Finish line starts at ~1224, so the total travel distance is 1024
            const finishLineTravel = (GameConfig.VIEWPORT.WIDTH + 200) - this.finishLine.x;
            const totalFinishLineTravel = (GameConfig.VIEWPORT.WIDTH + 200) - 200;
            const finishLineProgress = finishLineTravel / totalFinishLineTravel;

            // Blend between distance progress (90%) and finish line progress (90-100%)
            const baseProgress = 0.9;
            this.raceProgress = baseProgress + (1 - baseProgress) * finishLineProgress;
            this.raceProgress = Math.min(this.raceProgress, 1);
        }
        
        // Scroll finish line at same speed as other elements
        if (this.finishLine) {
            this.finishLine.x -= scrollSpeed;
        }
    }
    
    isFinished() {
        return this.isRaceComplete && this.finishLine && this.finishLine.x < 200;
    }
    
    reset() {
        this.distanceTraveled = 0;
        this.raceProgress = 0;
        this.isRaceComplete = false;
        if (this.finishLine) {
            this.finishLine.destroy();
            this.finishLine = null;
        }
    }
}