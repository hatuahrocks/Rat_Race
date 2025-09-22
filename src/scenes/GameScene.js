class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Get shared audio manager from registry
        this.audioManager = this.registry.get('audioManager');

        // Stop menu music when entering race
        if (this.audioManager) {
            this.audioManager.stopMusic();
            // Resume audio context for iOS
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        }

        // Initialize systems
        this.paletteSwap = new PaletteSwap(this);
        this.patchesManager = new PatchesManager(this);
        this.inputManager = new InputManager(this);
        
        // Get selected character
        const selectedCharacter = this.registry.get('selectedCharacter') || Characters[0];
        const currentTheme = this.registry.get('currentTheme') || 'living_room';
        
        // Initialize level
        this.levelManager = new LevelManager(this);
        this.levelManager.setTheme(currentTheme);
        
        // Initialize obstacle spawner
        this.obstacleSpawner = new ObstacleSpawner(this, this.levelManager.currentTheme);
        
        // Create start line
        this.createStartLine();
        
        // Create player vehicle - start behind start line
        this.player = new PlayerVehicle(this, 50, GameConfig.LANE_Y_POSITIONS[1], selectedCharacter);
        
        // Create AI opponents - one per lane (excluding player's lane)
        this.aiVehicles = [];
        const availableLanes = [0, 2, 3]; // Player is in lane 1, so use other lanes
        const maxAI = Math.min(GameConfig.AI.COUNT, availableLanes.length); // Don't exceed available lanes
        
        for (let i = 0; i < maxAI; i++) {
            const aiCharacter = Characters[Phaser.Math.Between(0, Characters.length - 1)];
            const lane = availableLanes[i]; // Use each available lane once
            
            // Stagger X positions slightly to avoid perfect alignment
            const staggerX = 50 + Phaser.Math.Between(-10, 10);
            
            const ai = new AIVehicle(
                this, 
                staggerX,
                GameConfig.LANE_Y_POSITIONS[lane],
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
    
    createStartLine() {
        const startLineX = 100;
        const roadY = GameConfig.VIEWPORT.HEIGHT / 2;
        const roadHeight = 320;
        
        // Create checkered start line pattern
        const lineContainer = this.add.container(startLineX, roadY);
        const checkeredHeight = roadHeight;
        const checkSize = 20;
        const numChecks = Math.ceil(checkeredHeight / checkSize);
        
        for (let i = 0; i < numChecks; i++) {
            const color = i % 2 === 0 ? 0x000000 : 0xFFFFFF;
            const check = this.add.rectangle(
                0, 
                (i * checkSize) - (checkeredHeight / 2),
                8, 
                checkSize,
                color
            );
            lineContainer.add(check);
        }
        
        // Add "START" text above the line (moved down slightly)
        const startText = this.add.text(startLineX, roadY - roadHeight/2 - 20, 'START', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        startText.setOrigin(0.5);
        startText.setDepth(10);
        
        this.startLine = lineContainer;
        this.startText = startText;
    }
    
    checkVehicleCollisions() {
        const allVehicles = [this.player, ...this.aiVehicles];
        
        for (let i = 0; i < allVehicles.length; i++) {
            for (let j = i + 1; j < allVehicles.length; j++) {
                const vehicle1 = allVehicles[i];
                const vehicle2 = allVehicles[j];
                
                const distance = Phaser.Math.Distance.Between(vehicle1.x, vehicle1.y, vehicle2.x, vehicle2.y);
                const xDistance = Math.abs(vehicle1.x - vehicle2.x);
                const yDistance = Math.abs(vehicle1.y - vehicle2.y);
                
                // Check for collision with better detection - increased ranges to match vehicle size
                if (distance < 70 && xDistance < 60 && yDistance < 45) {
                    // Create collision pair key to prevent duplicate collisions
                    const collisionKey = `${Math.min(i,j)}-${Math.max(i,j)}`;
                    const currentTime = this.time.now;
                    
                    // Initialize collision cooldowns if not exists
                    if (!this.collisionCooldowns) {
                        this.collisionCooldowns = {};
                    }
                    
                    // Check cooldown (500ms between same pair collisions)
                    if (!this.collisionCooldowns[collisionKey] || currentTime - this.collisionCooldowns[collisionKey] > 500) {
                        console.log('Vehicle collision detected!', distance, 'xDist:', xDistance, 'yDist:', yDistance, 'vehicles:', vehicle1.constructor.name, vehicle2.constructor.name);
                        this.handleVehicleCollision(vehicle1, vehicle2);
                        this.collisionCooldowns[collisionKey] = currentTime;
                    }
                }
            }
        }
    }
    
    handleVehicleCollision(vehicle1, vehicle2) {
        const xDistance = Math.abs(vehicle1.x - vehicle2.x);
        const yDistance = Math.abs(vehicle1.y - vehicle2.y);
        
        console.log('Collision detected - xDist:', xDistance, 'yDist:', yDistance);
        
        // Determine collision type based on relative positions
        if (yDistance < 35 && xDistance < 25) { // More strict rear-end detection
            // Same lane collision - rear-end collision
            const frontVehicle = vehicle1.x > vehicle2.x ? vehicle1 : vehicle2;
            const backVehicle = vehicle1.x > vehicle2.x ? vehicle2 : vehicle1;
            
            console.log('Rear-end collision:', backVehicle.constructor.name, 'hitting', frontVehicle.constructor.name);
            
            // Block the back vehicle and boost the front
            if (backVehicle.blockVehicle) {
                backVehicle.blockVehicle(frontVehicle);
                console.log('Blocked', backVehicle.constructor.name);
            }
            if (frontVehicle.receiveBoostFromCollision) {
                frontVehicle.receiveBoostFromCollision();
                console.log('Boosted', frontVehicle.constructor.name);
            }

            // Play bump sound effect for rear-end collision
            if (this.audioManager) {
                this.audioManager.playSound('bump');
            }
        } else if (xDistance < 40 && yDistance >= 20) { // Improved side collision detection
            // Side collision - lane pushing
            console.log('Side collision - lane pushing, xDist:', xDistance, 'yDist:', yDistance);
            this.handleLanePush(vehicle1, vehicle2);
        } else {
            console.log('Collision type not determined - xDist:', xDistance, 'yDist:', yDistance);
        }
    }
    
    handleLanePush(vehicle1, vehicle2) {
        // Determine which vehicle is the aggressor based on who's slightly ahead
        const aggressor = vehicle1.x >= vehicle2.x - 20 ? vehicle1 : vehicle2;
        const victim = vehicle1.x >= vehicle2.x - 20 ? vehicle2 : vehicle1;
        
        // Determine push direction based on Y positions
        if (vehicle1.y < vehicle2.y) {
            // vehicle1 is above vehicle2
            if (aggressor === vehicle1) {
                this.pushVehicle(vehicle2, 1, aggressor); // Push down
            } else {
                this.pushVehicle(vehicle1, -1, aggressor); // Push up
            }
        } else {
            // vehicle2 is above vehicle1
            if (aggressor === vehicle2) {
                this.pushVehicle(vehicle1, 1, aggressor); // Push down
            } else {
                this.pushVehicle(vehicle2, -1, aggressor); // Push up
            }
        }
    }
    
    pushVehicle(vehicle, direction, aggressor = null) {
        // Use extended lane system if available, otherwise use current lane
        const currentExtendedLane = vehicle.extendedLane !== undefined ? vehicle.extendedLane : vehicle.currentLane;
        const newExtendedLane = currentExtendedLane + direction;
        
        console.log(`PUSH ATTEMPT: ${vehicle.constructor.name} from lane ${currentExtendedLane} to ${newExtendedLane} (direction: ${direction})`);
        
        // Check bounds for extended lane system (-1 to 4)
        if (newExtendedLane < -1) {
            console.log('Push blocked - would go beyond high offroad');
            return;
        } else if (newExtendedLane > 4) {
            console.log('Push blocked - would go beyond low offroad');
            return;
        } else {
            // Valid lane change in extended system
            if (vehicle.changeLane) {
                console.log(`PUSHING ${vehicle.constructor.name} to extended lane ${newExtendedLane}`);
                vehicle.changeLane(direction);

                // Show exclamation effect when pushed
                if (vehicle.showExclamationEffect) {
                    vehicle.showExclamationEffect();
                }

                // Play push sound effect only when player is the aggressor
                if (this.audioManager && aggressor === this.player) {
                    this.audioManager.playSoundWithCooldown('push', 800); // 800ms cooldown
                }

                console.log('Vehicle pushed to new lane with exclamation effect and sound');
            } else {
                console.log('Push failed - vehicle has no changeLane method');
            }
        }
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

        // Finger tracing lane target
        this.events.on('laneChangeToTarget', (targetLane) => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.changeLaneToTarget(targetLane);
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
        
        // Scroll start line away
        if (this.startLine) {
            this.startLine.x -= this.scrollSpeed * delta / 1000;
            this.startText.x -= this.scrollSpeed * delta / 1000;
        }
        
        // Update obstacles and ramps
        this.obstacleSpawner.update(time, delta, this.scrollSpeed * delta / 1000);
        
        // Check player collisions
        const collision = this.obstacleSpawner.checkCollision(this.player);
        if (collision) {
            if (collision.type === 'obstacle') {
                this.player.hitObstacle(collision.object);
            } else if (collision.type === 'ramp') {
                this.player.hitRamp();
            }
        }

        // Check player strawberry collection
        const strawberry = this.obstacleSpawner.checkStrawberryCollision(this.player);
        if (strawberry) {
            this.collectStrawberry(strawberry, this.player);
        }
        
        // Update AI vehicles
        this.aiVehicles.forEach(ai => {
            ai.update(delta);
            ai.makeDecision(this.player.x, this.obstacleSpawner.obstacles);
            
            // Check AI collisions with obstacles
            const aiCollision = this.obstacleSpawner.checkCollision(ai);
            if (aiCollision) {
                if (aiCollision.type === 'obstacle') {
                    ai.hitObstacle();
                } else if (aiCollision.type === 'ramp') {
                    ai.hitRamp();
                }
            }

            // Check AI strawberry collection
            const aiStrawberry = this.obstacleSpawner.checkStrawberryCollision(ai);
            if (aiStrawberry) {
                this.collectStrawberry(aiStrawberry, ai);
            }
            
            // Move AI forward relative to scroll
            ai.x += (ai.currentSpeed - this.scrollSpeed) * delta / 1000;
        });
        
        // Check vehicle-to-vehicle collisions
        this.checkVehicleCollisions();
        
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
        this.events.off('laneChangeToTarget');
        this.events.off('boostStart');
        this.events.off('boostEnd');
        this.events.off('boostPartial');
    }

    collectStrawberry(strawberry, vehicle) {
        // Mark strawberry as collected and play collection effect
        strawberry.collect();

        // Give boost energy to the vehicle
        const boostAmount = 2; // 2 seconds of boost energy

        if (vehicle === this.player) {
            // Player gets boost energy AND immediate speed boost
            vehicle.boostMeter = Math.min(
                vehicle.boostMeter + boostAmount,
                GameConfig.BOOST_MAX_SECONDS
            );

            // Give immediate strawberry boost effect (stackable with regular boost)
            vehicle.strawberryBoostTime = 2000; // 2 seconds of 40% speed boost

            console.log(`Player collected strawberry! Boost meter: ${vehicle.boostMeter.toFixed(1)}s, Strawberry boost for 2s`);

            // If already boosting, extend the boost
            if (vehicle.isBoosting) {
                console.log('Extended boost duration!');
            }
        } else {
            // AI gets boost energy AND immediate speed boost
            vehicle.boostMeter = Math.min(
                vehicle.boostMeter + boostAmount,
                GameConfig.BOOST_MAX_SECONDS
            );

            // Give immediate strawberry boost effect for AI too
            vehicle.strawberryBoostTime = 2000; // 2 seconds of 40% speed boost

            console.log(`AI collected strawberry! Boost meter: ${vehicle.boostMeter.toFixed(1)}s, Strawberry boost for 2s`);
        }

        // Play collection sound effect (only for player, not AI)
        if (vehicle === this.player && this.audioManager) {
            this.audioManager.playSound('powerup');
        }
    }
}