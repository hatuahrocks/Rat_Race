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
        // Resolve the requested theme by id; GARDEN is the default/fallback
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

        const id = this.currentTheme.id;
        const p = this.currentTheme.palette;
        const fullWidth = GameConfig.VIEWPORT.WIDTH * 6;

        // Backdrop gradient: sky outdoors, wallpaper indoors
        // (drawn tall so it covers above the visible area too)
        GameArt.ensureGradient(this.scene, `sky-${id}`, 32, 512, p.sky);
        const sky = this.scene.add.image(-2000, -400, `sky-${id}`);
        sky.setOrigin(0, 0);
        sky.setDisplaySize(fullWidth, 560); // covers up to y=160 (horizon)
        sky.setDepth(-12);

        if (p.sun) {
            const sunGlow = this.scene.add.circle(890, 58, 46, 0xFFF59D, 0.35);
            const sun = this.scene.add.circle(890, 58, 30, 0xFFEE58);
            sunGlow.setDepth(-11);
            sun.setDepth(-11);
        }

        // Horizon band between backdrop and the high shoulder
        // (grass / ocean / wainscot paneling depending on theme)
        GameArt.ensureGradient(this.scene, `band-${id}`, 32, 64, p.bandTop);
        const bandTop = this.scene.add.image(-2000, 100, `band-${id}`);
        bandTop.setOrigin(0, 0);
        bandTop.setDisplaySize(fullWidth, 58);
        bandTop.setDepth(-9);

        // Foreground below the low shoulder (grass / sand / rug)
        GameArt.ensureGradient(this.scene, `fg-${id}`, 32, 64, p.foreground);
        const foreground = this.scene.add.image(-2000, 616, `fg-${id}`);
        foreground.setOrigin(0, 0);
        foreground.setDisplaySize(fullWidth, 360);
        foreground.setDepth(-9);

        // Theme-specific parallax scenery
        if (id === 'beach') {
            this.createParallaxPair(w => this.buildWaveSegment(w), 1280, 0.3, -8.5);
            this.createParallaxPair(w => this.buildSailboatSegment(w), 1600, 0.15, -8.75);
            this.createParallaxPair(w => this.buildPalmSegment(w), 1280, 0.4, -8);
            this.createParallaxPair(w => this.buildShellSegment(w), 1400, 1.0, -7.5);
        } else if (id === 'living_room') {
            this.createParallaxPair(w => this.buildWallSegment(w), 1280, 0.2, -10);
            this.createParallaxPair(w => this.buildWainscotSegment(w), 1280, 0.3, -8.5);
            this.createParallaxPair(w => this.buildRugSegment(w), 1400, 1.0, -7.5);
        } else {
            // Garden (default): picket fence + hedge + flowers
            this.createParallaxPair(w => this.buildFenceSegment(w), 1280, 0.25, -8.5);
            this.createParallaxPair(w => this.buildHedgeSegment(w), 1280, 0.35, -8);
            this.createParallaxPair(w => this.buildTopFlowerSegment(w), 1280, 0.45, -7.5);
            this.createParallaxPair(w => this.buildBottomFlowerSegment(w), 1400, 1.0, -7.5);
        }

        // Drifting clouds for outdoor themes (very slow parallax)
        if (p.clouds) {
            this.createParallaxPair(w => this.buildCloudSegment(w), 1600, 0.08, -10);
        }

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

    // ---- Beach scenery -------------------------------------------------

    buildWaveSegment(width) {
        const c = this.scene.add.container(0, 0);
        // Rows of white foam arcs across the ocean band
        [[112, 0.5], [130, 0.7], [148, 0.9]].forEach(([y, alpha], row) => {
            for (let x = row * 30; x < width; x += 90) {
                const g = this.scene.add.graphics({ x, y });
                g.lineStyle(2.5, 0xFFFFFF, alpha);
                g.beginPath();
                g.arc(0, 0, 14, Math.PI, Math.PI * 2);
                g.strokePath();
                c.add(g);
            }
        });
        return c;
    }

    buildSailboatSegment(width) {
        const c = this.scene.add.container(0, 0);
        [200, 950].forEach((x, i) => {
            const y = 112 + i * 6;
            const hull = this.scene.add.triangle(x, y, -14, 0, 14, 0, 8, 7, 0x8D5524);
            const sail = this.scene.add.triangle(x + 1, y - 11, 0, 10, 0, -10, 12, 8, 0xFFFFFF);
            const mast = this.scene.add.rectangle(x, y - 10, 1.5, 20, 0x5D4037);
            c.add([hull, mast, sail]);
        });
        return c;
    }

    buildPalmSegment(width) {
        const c = this.scene.add.container(0, 0);
        for (let x = 90; x < width; x += 340) {
            const lean = ((x * 13) % 10) - 5; // deterministic slight lean
            const baseY = 156;
            const trunk = this.scene.add.rectangle(x, baseY - 22, 7, 46, 0x8D6E63);
            trunk.setRotation(lean * 0.02);
            c.add(trunk);
            // Fronds fan out from the crown
            const crownX = x + lean;
            const crownY = baseY - 46;
            [[-22, -8], [-14, -16], [0, -19], [14, -16], [22, -8]].forEach(([fx, fy]) => {
                const frond = this.scene.add.ellipse(crownX + fx, crownY + fy, 30, 9, 0x2E7D32);
                frond.setRotation(Math.atan2(fy, fx) * 0.5);
                c.add(frond);
            });
            c.add(this.scene.add.circle(crownX, crownY, 5, 0x6D4C41));
        }
        return c;
    }

    buildShellSegment(width) {
        const c = this.scene.add.container(0, 0);
        for (let x = 50; x < width; x += 150) {
            const y = 645 + ((x * 11) % 60);
            if ((x * 7) % 3 === 0) {
                // Starfish
                const star = this.scene.add.star(x, y, 5, 3, 7, 0xFF8A65);
                star.setRotation((x % 7) * 0.3);
                c.add(star);
            } else {
                // Shell: small fan of arcs
                const g = this.scene.add.graphics({ x, y });
                g.fillStyle(0xFFF3E0, 1);
                g.slice(0, 0, 8, Math.PI, Math.PI * 2);
                g.fillPath();
                g.lineStyle(1, 0xD7B894, 1);
                g.lineBetween(0, 0, -5, -6);
                g.lineBetween(0, 0, 0, -8);
                g.lineBetween(0, 0, 5, -6);
                c.add(g);
            }
        }
        return c;
    }

    // ---- Living room scenery -------------------------------------------

    buildWallSegment(width) {
        const c = this.scene.add.container(0, 0);
        // Picture frames and a window on the wallpaper
        for (let x = 130; x < width; x += 430) {
            const frame = this.scene.add.rectangle(x, 52, 64, 48, 0x6D4C41);
            const mat = this.scene.add.rectangle(x, 52, 52, 36, 0xF5F0E1);
            const art = this.scene.add.rectangle(x, 52, 42, 26, 0x7E9E72);
            const artSun = this.scene.add.circle(x + 12, 44, 5, 0xFFEE58);
            c.add([frame, mat, art, artSun]);
        }
        for (let x = 345; x < width; x += 430) {
            const sill = this.scene.add.rectangle(x, 86, 84, 6, 0xF5F0E1);
            const glass = this.scene.add.rectangle(x, 50, 72, 66, 0x9ADCF7);
            const frameV = this.scene.add.rectangle(x, 50, 5, 66, 0xF5F0E1);
            const frameH = this.scene.add.rectangle(x, 50, 72, 5, 0xF5F0E1);
            const border = this.scene.add.rectangle(x, 50, 72, 66);
            border.setStrokeStyle(5, 0xF5F0E1);
            c.add([glass, frameV, frameH, border, sill]);
        }
        return c;
    }

    buildWainscotSegment(width) {
        const c = this.scene.add.container(0, 0);
        // Chair rail along the top of the paneling band
        const rail = this.scene.add.rectangle(0, 103, width, 6, 0xFFFFFF);
        rail.setOrigin(0, 0.5);
        rail.setAlpha(0.9);
        c.add(rail);
        // Panel seams
        for (let x = 0; x < width; x += 96) {
            const seam = this.scene.add.rectangle(x, 131, 3, 50, 0xC4B59C);
            c.add(seam);
        }
        // Baseboard where the wall meets the floor
        const base = this.scene.add.rectangle(0, 155, width, 7, 0xEFE6D4);
        base.setOrigin(0, 0.5);
        c.add(base);
        return c;
    }

    buildRugSegment(width) {
        const c = this.scene.add.container(0, 0);
        // Rug motifs on the foreground carpet
        for (let x = 70; x < width; x += 180) {
            const y = 655 + ((x * 13) % 50);
            const motif = this.scene.add.rectangle(x, y, 22, 22, 0xD8A657, 0.35);
            motif.setRotation(Math.PI / 4);
            const inner = this.scene.add.rectangle(x, y, 10, 10, 0xF0CC8B, 0.35);
            inner.setRotation(Math.PI / 4);
            c.add([motif, inner]);
        }
        // The occasional stray toy block
        for (let x = 160; x < width; x += 520) {
            const y = 680 + ((x * 7) % 30);
            const block = this.scene.add.rectangle(x, y, 18, 18, 0xE53935);
            block.setStrokeStyle(2, 0xB71C1C);
            const letter = this.scene.add.text(x, y, 'A', {
                fontSize: '11px', fontFamily: 'Arial Black', color: '#FFFFFF'
            });
            letter.setOrigin(0.5);
            c.add([block, letter]);
        }
        return c;
    }
    
    createRoad() {
        const roadY = GameConfig.VIEWPORT.HEIGHT / 2;
        const roadHeight = 320;
        const id = this.currentTheme.id;

        // Main racing surface - subtle vertical gradient (asphalt outdoors,
        // hardwood floorboards in the living room)
        GameArt.ensureGradient(this.scene, `road-${id}`, 32, 256, this.currentTheme.palette.road);
        const road = this.scene.add.image(-2000, roadY - roadHeight / 2, `road-${id}`);
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
        const id = this.currentTheme.id;
        const p = this.currentTheme.palette;

        // Shoulders (dirt / sand / rug border) get a gradient and are tall
        // enough to touch both the road edge and the horizon band (no gaps)
        GameArt.ensureGradient(this.scene, `shoulder-high-${id}`, 32, 80, p.dirtHigh);
        GameArt.ensureGradient(this.scene, `shoulder-low-${id}`, 32, 80, p.dirtLow);

        // High offroad area (above top lane): from band (y=158) to road edge (y=224)
        const offroadHigh = this.scene.add.image(-2000, 156, `shoulder-high-${id}`);
        offroadHigh.setOrigin(0, 0);
        offroadHigh.setDisplaySize(GameConfig.VIEWPORT.WIDTH * 6, 70);
        offroadHigh.setDepth(-6);

        // Low offroad area (below bottom lane): from road edge (y=544) to foreground (y=616)
        const offroadLow = this.scene.add.image(-2000, 546, `shoulder-low-${id}`);
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
                    this.currentTheme.palette.spotColor
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