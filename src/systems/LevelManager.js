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
        // Find theme in LevelThemes object
        const themeKeys = Object.keys(LevelThemes);
        for (let key of themeKeys) {
            if (LevelThemes[key].id === themeId) {
                this.currentTheme = LevelThemes[key];
                break;
            }
        }
        
        // Fallback to first theme if not found
        if (!this.currentTheme) {
            this.currentTheme = LevelThemes.LIVING_ROOM;
        }
        
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
        // Create simple parallax background layers
        const bg1 = this.scene.add.rectangle(
            0, 0, 
            GameConfig.VIEWPORT.WIDTH * 2, 
            GameConfig.VIEWPORT.HEIGHT,
            Phaser.Display.Color.HexStringToColor(this.currentTheme.backgroundColor).color
        );
        bg1.setOrigin(0, 0);
        bg1.setDepth(-10);
        bg1.setAlpha(0.8);
        
        // Add some decorative elements based on theme
        if (this.currentTheme.id === 'backyard' || this.currentTheme.id === 'beach') {
            // Add clouds
            for (let i = 0; i < 5; i++) {
                const cloud = this.createCloud(
                    Phaser.Math.Between(0, GameConfig.VIEWPORT.WIDTH),
                    Phaser.Math.Between(50, 150)
                );
                cloud.setDepth(-9);
            }
        }
        
        // Create road/track
        this.createRoad();
    }
    
    createCloud(x, y) {
        const cloud = this.scene.add.container(x, y);
        
        const circle1 = this.scene.add.circle(0, 0, 30, 0xFFFFFF);
        const circle2 = this.scene.add.circle(25, 0, 25, 0xFFFFFF);
        const circle3 = this.scene.add.circle(-25, 0, 25, 0xFFFFFF);
        const circle4 = this.scene.add.circle(0, -10, 20, 0xFFFFFF);
        
        cloud.add([circle1, circle2, circle3, circle4]);
        cloud.setAlpha(0.6);
        
        // Add slow drift animation
        this.scene.tweens.add({
            targets: cloud,
            x: cloud.x - 50,
            duration: 20000,
            repeat: -1
        });
        
        return cloud;
    }
    
    createRoad() {
        const roadY = GameConfig.VIEWPORT.HEIGHT / 2;
        const roadHeight = 320;
        
        // Main road surface - make it much wider to cover entire screen width
        const road = this.scene.add.rectangle(
            -2000, roadY, 
            GameConfig.VIEWPORT.WIDTH * 6, 
            roadHeight,
            GameConfig.COLORS.ROAD
        );
        road.setOrigin(0, 0.5);
        road.setDepth(-5);
        
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
        // High offroad area (above top lane)
        const offroadHigh = this.scene.add.rectangle(
            -2000, GameConfig.OFFROAD_HIGH_Y,
            GameConfig.VIEWPORT.WIDTH * 6, 60,
            0x8B7355 // Brown rough terrain
        );
        offroadHigh.setOrigin(0, 0.5);
        offroadHigh.setDepth(-6);
        
        // Low offroad area (below bottom lane)
        const offroadLow = this.scene.add.rectangle(
            -2000, GameConfig.OFFROAD_LOW_Y,
            GameConfig.VIEWPORT.WIDTH * 6, 60,
            0x8B7355 // Brown rough terrain
        );
        offroadLow.setOrigin(0, 0.5);
        offroadLow.setDepth(-6);
        
        // Add rough texture pattern to offroad areas
        console.log('Creating offroad textures at Y positions:', GameConfig.OFFROAD_HIGH_Y, GameConfig.OFFROAD_LOW_Y);
        this.createOffroadTexture(GameConfig.OFFROAD_HIGH_Y);
        this.createOffroadTexture(GameConfig.OFFROAD_LOW_Y);
    }
    
    createOffroadTexture(y) {
        // Create brown spots using simple approach - create individual spots and move them
        console.log('Creating offroad texture at Y:', y);
        
        // Create spots directly, not in a container
        const spots = [];
        for (let x = -400; x < 8000; x += 80) { // Same 80px spacing as dividers
            if (Math.random() < 0.4) { // 40% chance to create a spot
                const spot = this.scene.add.circle(
                    x + Phaser.Math.Between(-20, 20), // Add some randomness to X
                    y + Phaser.Math.Between(-25, 25), // Random Y within offroad area
                    Phaser.Math.Between(4, 10), // Bigger spots to be more visible
                    0x654321 // Dark brown
                );
                spot.setAlpha(0.8); // More visible
                spot.setDepth(-5);
                spots.push(spot);
            }
        }
        
        // Store spots for animation
        this.offroadSpots.push({ spots: spots, isSpotArray: true });
        console.log('Created', spots.length, 'individual offroad spots at Y:', y);
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
            if (Math.random() < 0.01) { // Log 1% of the time
                console.log('Updating offroad spots, groups:', this.offroadSpots.length, 'scrollSpeed:', scrollSpeed);
            }
            
            this.offroadSpots.forEach((spotGroup, groupIndex) => {
                if (spotGroup.isSpotArray && spotGroup.spots) {
                    // Move individual spots
                    spotGroup.spots.forEach((spot, spotIndex) => {
                        spot.x -= scrollSpeed;
                        
                        // Reset spot when it goes off screen left - give much more buffer
                        if (spot.x < -400) { // Much further left to avoid early disappearing
                            spot.x += 8400; // Move to far right (8000 + 400 buffer)
                        }
                        
                        // Debug logging
                        if (groupIndex === 0 && spotIndex === 0 && Math.random() < 0.005) {
                            console.log('Moving spot:', spot.x, 'scrollSpeed:', scrollSpeed);
                        }
                    });
                }
            });
        } else if (Math.random() < 0.01) {
            console.log('Offroad spots not updating - offroadSpots:', !!this.offroadSpots, 'scrollSpeed:', scrollSpeed);
        }
        
        // Check for race completion
        if (this.raceProgress >= 1 && !this.isRaceComplete) {
            this.isRaceComplete = true;
            
            // Create finish line if it doesn't exist
            if (!this.finishLine) {
                this.createFinishLine(GameConfig.VIEWPORT.WIDTH + 200);
            }
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