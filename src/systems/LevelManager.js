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
        
        // Main road surface
        const road = this.scene.add.rectangle(
            0, roadY, 
            GameConfig.VIEWPORT.WIDTH * 2, 
            roadHeight,
            GameConfig.COLORS.ROAD
        );
        road.setOrigin(0, 0.5);
        road.setDepth(-5);
        
        // Lane dividers
        for (let i = 1; i < GameConfig.LANE_COUNT; i++) {
            const laneY = roadY + GameConfig.LANE_Y_POSITIONS[i] - 40;
            
            // Create dashed line effect
            for (let x = 0; x < GameConfig.VIEWPORT.WIDTH * 2; x += 80) {
                const dash = this.scene.add.rectangle(
                    x, laneY,
                    40, 4,
                    0xFFFFFF
                );
                dash.setOrigin(0, 0.5);
                dash.setDepth(-4);
                dash.setAlpha(0.5);
            }
        }
        
        // Road edges
        const edgeTop = this.scene.add.rectangle(
            0, roadY - roadHeight/2, 
            GameConfig.VIEWPORT.WIDTH * 2, 8,
            0xFFFF00
        );
        edgeTop.setOrigin(0, 0.5);
        edgeTop.setDepth(-4);
        
        const edgeBottom = this.scene.add.rectangle(
            0, roadY + roadHeight/2, 
            GameConfig.VIEWPORT.WIDTH * 2, 8,
            0xFFFF00
        );
        edgeBottom.setOrigin(0, 0.5);
        edgeBottom.setDepth(-4);
    }
    
    createFinishLine(x) {
        const finishContainer = this.scene.add.container(x, GameConfig.VIEWPORT.HEIGHT / 2);
        
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
        
        // Check for race completion
        if (this.raceProgress >= 1 && !this.isRaceComplete) {
            this.isRaceComplete = true;
            
            // Create finish line if it doesn't exist
            if (!this.finishLine) {
                this.createFinishLine(GameConfig.VIEWPORT.WIDTH + 200);
            }
        }
        
        // Scroll finish line
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