class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        // Initialize systems
        this.paletteSwap = new PaletteSwap(this);
        this.patchesManager = new PatchesManager(this);
        this.inputManager = new InputManager(this);
        this.audioManager = new AudioManager(this);
        
        // Get selected character
        const selectedCharacter = this.registry.get('selectedCharacter') || Characters[0];
        const currentTheme = this.registry.get('currentTheme') || 'living_room';
        
        // Initialize level
        this.levelManager = new LevelManager(this);
        this.levelManager.setTheme(currentTheme);
        
        // Initialize obstacle spawner
        this.obstacleSpawner = new ObstacleSpawner(this, this.levelManager.currentTheme);
        
        // Create player vehicle
        this.player = new PlayerVehicle(this, 200, GameConfig.LANE_Y_POSITIONS[1], selectedCharacter);
        
        // Create AI opponents
        this.aiVehicles = [];
        for (let i = 0; i < GameConfig.AI.COUNT; i++) {
            const aiCharacter = Characters[Phaser.Math.Between(0, Characters.length - 1)];
            const ai = new AIVehicle(
                this, 
                150 - (i * 50), 
                GameConfig.LANE_Y_POSITIONS[Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1)],
                aiCharacter,
                0.5 + (i * 0.2)
            );
            this.aiVehicles.push(ai);
        }
        
        // Game state
        this.gameStarted = false;
        this.gameEnded = false;
        this.scrollSpeed = 0;
        this.countdown = 3;
        
        // Create countdown
        this.createCountdown();
        
        // Setup input events
        this.setupInputEvents();
        
        // Create camera follow
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
        this.cameras.main.setFollowOffset(-200, 0);
    }
    
    createCountdown() {
        const countdownText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '3',
            {
                fontSize: '120px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 10
            }
        );
        countdownText.setOrigin(0.5);
        countdownText.setScrollFactor(0);
        
        // Countdown timer
        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                this.countdown--;
                if (this.countdown > 0) {
                    countdownText.setText(this.countdown.toString());
                    this.tweens.add({
                        targets: countdownText,
                        scale: { from: 1.5, to: 1 },
                        alpha: { from: 1, to: 0.5 },
                        duration: 800
                    });
                } else {
                    countdownText.setText('GO!');
                    this.tweens.add({
                        targets: countdownText,
                        scale: { from: 2, to: 0 },
                        alpha: { from: 1, to: 0 },
                        duration: 500,
                        onComplete: () => {
                            countdownText.destroy();
                            this.startRace();
                        }
                    });
                }
            }
        });
    }
    
    startRace() {
        this.gameStarted = true;
        this.scrollSpeed = GameConfig.BASE_FORWARD_SPEED;
    }
    
    setupInputEvents() {
        // Lane change events
        this.events.on('laneChangeUp', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.changeLane(-1);
            }
        });
        
        this.events.on('laneChangeDown', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.changeLane(1);
            }
        });
        
        // Boost events
        this.events.on('boostStart', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.startBoost();
            }
        });
        
        this.events.on('boostEnd', () => {
            this.player.stopBoost();
        });
        
        this.events.on('boostPartial', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.usePartialBoost();
            }
        });
    }
    
    update(time, delta) {
        if (!this.gameStarted) return;
        
        // Update input
        this.inputManager.update();
        
        // Update player
        this.player.update(delta);
        
        // Update scroll speed based on player speed
        this.scrollSpeed = this.player.currentSpeed;
        
        // Update level
        this.levelManager.update(this.scrollSpeed * delta / 1000, delta);
        
        // Update obstacles and ramps
        this.obstacleSpawner.update(time, delta, this.scrollSpeed * delta / 1000);
        
        // Check player collisions
        const collision = this.obstacleSpawner.checkCollision(this.player);
        if (collision) {
            if (collision.type === 'obstacle') {
                this.player.hitObstacle();
            } else if (collision.type === 'ramp') {
                this.player.hitRamp();
            }
        }
        
        // Update AI vehicles
        this.aiVehicles.forEach(ai => {
            ai.update(delta);
            ai.makeDecision(this.player.x, this.obstacleSpawner.obstacles);
            
            // Check AI collisions
            const aiCollision = this.obstacleSpawner.checkCollision(ai);
            if (aiCollision) {
                if (aiCollision.type === 'obstacle') {
                    ai.hitObstacle();
                } else if (aiCollision.type === 'ramp') {
                    ai.hitRamp();
                }
            }
            
            // Move AI forward relative to scroll
            ai.x += (ai.currentSpeed - this.scrollSpeed) * delta / 1000;
        });
        
        // Update UI Scene with game data
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.scene.isActive()) {
            uiScene.updateBoostMeter(this.player.getBoostPercentage());
            uiScene.updateProgress(this.levelManager.raceProgress);
            uiScene.updatePosition(this.calculatePosition());
        }
        
        // Check for race completion
        if (this.levelManager.isFinished() && !this.gameEnded) {
            this.endRace();
        }
    }
    
    calculatePosition() {
        let position = 1;
        const playerDistance = this.levelManager.distanceTraveled;
        
        this.aiVehicles.forEach(ai => {
            if (ai.distanceTraveled > playerDistance) {
                position++;
            }
        });
        
        return position;
    }
    
    endRace() {
        this.gameEnded = true;
        this.scrollSpeed = 0;
        
        // Stop all vehicles
        this.player.stopBoost();
        
        // Calculate final position
        const finalPosition = this.calculatePosition();
        
        // Transition to race end scene
        this.time.delayedCall(1000, () => {
            this.scene.stop('UIScene');
            this.scene.start('RaceEndScene', { 
                position: finalPosition,
                totalRacers: GameConfig.AI.COUNT + 1,
                character: this.registry.get('selectedCharacter')
            });
        });
    }
    
    shutdown() {
        // Cleanup
        this.inputManager.destroy();
        this.audioManager.destroy();
        this.obstacleSpawner.destroy();
        this.events.off('laneChangeUp');
        this.events.off('laneChangeDown');
        this.events.off('boostStart');
        this.events.off('boostEnd');
        this.events.off('boostPartial');
    }
}