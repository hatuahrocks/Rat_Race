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
        
        // Get player's selected car color and character
        const selectedCarColor = this.registry.get('selectedCarColor') || { color: 0x333333, accent: 0x444444 };

        // Create player vehicle - start behind start line in lane 1
        this.player = new PlayerVehicle(this, 50, GameConfig.LANE_Y_POSITIONS[1], selectedCharacter);
        console.log(`Player created in lane 1 at Y: ${GameConfig.LANE_Y_POSITIONS[1]}`);

        // Create AI opponents - ensure unique lanes, colors, and characters
        this.aiVehicles = [];
        this.createUniqueAIOpponents(selectedCharacter, selectedCarColor);
        
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

    createUniqueAIOpponents(playerCharacter, playerCarColor) {
        // Available car colors from CarColorSelectionScene
        const availableCarColors = [
            { name: 'Classic Black', color: 0x333333, accent: 0x444444 },
            { name: 'Racing Red', color: 0xCC0000, accent: 0xFF3333 },
            { name: 'Electric Blue', color: 0x0066CC, accent: 0x3399FF },
            { name: 'Forest Green', color: 0x228B22, accent: 0x32CD32 },
            { name: 'Sunset Orange', color: 0xFF6600, accent: 0xFF9933 },
            { name: 'Royal Purple', color: 0x663399, accent: 0x9966CC },
            { name: 'Bright Yellow', color: 0xFFCC00, accent: 0xFFDD33 },
            { name: 'Hot Pink', color: 0xFF1493, accent: 0xFF69B4 }
        ];

        // Remove player's car color from available colors
        const aiCarColors = availableCarColors.filter(carColor =>
            carColor.color !== playerCarColor.color
        );

        // Remove player's character from available characters
        const aiCharacters = Characters.filter(character =>
            character.name !== playerCharacter.name
        );

        // Available lanes (player is in lane 1, so use 0, 2, 3)
        const availableLanes = [0, 2, 3];
        const maxAI = Math.min(GameConfig.AI.COUNT, availableLanes.length, aiCarColors.length, aiCharacters.length);

        console.log(`Creating ${maxAI} AI opponents with unique colors and characters`);

        // Shuffle arrays to get random selection
        const shuffledCarColors = this.shuffleArray([...aiCarColors]);
        const shuffledCharacters = this.shuffleArray([...aiCharacters]);

        for (let i = 0; i < maxAI; i++) {
            const lane = availableLanes[i];
            const aiCharacter = shuffledCharacters[i];
            const aiCarColor = shuffledCarColors[i];

            // Stagger X positions slightly to avoid perfect alignment
            const staggerX = 50 + Phaser.Math.Between(-10, 10);

            console.log(`AI ${i}: Lane ${lane} at Y: ${GameConfig.LANE_Y_POSITIONS[lane]}, Character: ${aiCharacter.name}, Color: ${aiCarColor.name}`);

            const ai = new AIVehicle(
                this,
                staggerX,
                GameConfig.LANE_Y_POSITIONS[lane],
                aiCharacter,
                0.5 + (i * 0.2),
                aiCarColor // Pass the car color
            );
            this.aiVehicles.push(ai);
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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

                // Get current bounding boxes
                const box1 = vehicle1.getBoundingBox();
                const box2 = vehicle2.getBoundingBox();

                // Check for current collision using precise bounding box intersection
                if (this.boundingBoxIntersect(box1, box2)) {
                    this.handleCollisionDetected(vehicle1, vehicle2, i, j, 'current');
                    continue; // Skip other checks if current collision exists
                }

                // Check velocities to determine if we need high-speed collision detection
                const vel1 = vehicle1.getVelocity();
                const vel2 = vehicle2.getVelocity();
                const speed1 = Math.sqrt(vel1.x * vel1.x + vel1.y * vel1.y);
                const speed2 = Math.sqrt(vel2.x * vel2.x + vel2.y * vel2.y);
                const isHighSpeed = speed1 > 15 || speed2 > 15; // Lowered threshold for better detection

                // ALWAYS check swept collision for ANY moving vehicle (brute force approach)
                const isMoving = speed1 > 1 || speed2 > 1; // Any movement at all
                if (isMoving) {
                    const sweptBox1 = vehicle1.getSweptBoundingBox();
                    const sweptBox2 = vehicle2.getSweptBoundingBox();

                    if (this.boundingBoxIntersect(sweptBox1, sweptBox2)) {
                        const collisionType = isHighSpeed ? 'swept-highspeed' : 'swept-normal';
                        this.handleCollisionDetected(vehicle1, vehicle2, i, j, collisionType);
                        continue;
                    }
                }

                // Fallback: Standard predictive collision
                const predictedBox1 = vehicle1.getPredictedBoundingBox(16.67); // Assume 60fps (16.67ms)
                const predictedBox2 = vehicle2.getPredictedBoundingBox(16.67);

                if (this.boundingBoxIntersect(predictedBox1, predictedBox2)) {
                    this.handleCollisionDetected(vehicle1, vehicle2, i, j, 'predicted');
                } else {
                    // Debug near-misses for braking scenarios
                    const v1Braking = vehicle1.isBraking && vehicle1.isBraking();
                    const v2Braking = vehicle2.isBraking && vehicle2.isBraking();
                    const distance = Phaser.Math.Distance.Between(vehicle1.x, vehicle1.y, vehicle2.x, vehicle2.y);

                    if ((v1Braking || v2Braking) && distance < 80) {
                        console.log(`NEAR MISS: ${vehicle1.constructor.name}(${v1Braking ? 'BRAKING' : 'normal'}, speed:${speed1.toFixed(1)}) vs ${vehicle2.constructor.name}(${v2Braking ? 'BRAKING' : 'normal'}, speed:${speed2.toFixed(1)}) - Distance:${distance.toFixed(1)}`);
                    }
                }
            }
        }
    }

    // Check if two bounding boxes intersect
    boundingBoxIntersect(box1, box2) {
        return !(box1.right < box2.left ||
                 box1.left > box2.right ||
                 box1.bottom < box2.top ||
                 box1.top > box2.bottom);
    }

    // Handle detected collision with cooldown management
    handleCollisionDetected(vehicle1, vehicle2, i, j, type) {
        // Create collision pair key to prevent duplicate collisions
        const collisionKey = `${Math.min(i,j)}-${Math.max(i,j)}`;
        const currentTime = this.time.now;

        // Initialize collision cooldowns if not exists
        if (!this.collisionCooldowns) {
            this.collisionCooldowns = {};
        }

        // Check if either vehicle is braking for reduced cooldown
        const v1Braking = vehicle1.isBraking && vehicle1.isBraking();
        const v2Braking = vehicle2.isBraking && vehicle2.isBraking();
        const anyBraking = v1Braking || v2Braking;

        // Reduced cooldown for braking scenarios to prevent pass-through
        const cooldownTime = anyBraking ? 50 : 150; // 50ms when braking, 150ms normal

        if (!this.collisionCooldowns[collisionKey] || currentTime - this.collisionCooldowns[collisionKey] > cooldownTime) {
            // Debug collision info (braking already calculated above)
            const distance = Phaser.Math.Distance.Between(vehicle1.x, vehicle1.y, vehicle2.x, vehicle2.y);
            const vel1 = vehicle1.getVelocity();
            const vel2 = vehicle2.getVelocity();
            const speed1 = Math.sqrt(vel1.x * vel1.x + vel1.y * vel1.y);
            const speed2 = Math.sqrt(vel2.x * vel2.x + vel2.y * vel2.y);

            console.log(`COLLISION (${type}): Distance:${distance.toFixed(1)}`);
            console.log(`Vehicles: ${vehicle1.constructor.name}(${v1Braking ? 'BRAKING' : 'normal'}, speed:${speed1.toFixed(1)}) vs ${vehicle2.constructor.name}(${v2Braking ? 'BRAKING' : 'normal'}, speed:${speed2.toFixed(1)})`);
            console.log(`Positions: V1(${vehicle1.x.toFixed(1)},${vehicle1.y.toFixed(1)}) V2(${vehicle2.x.toFixed(1)},${vehicle2.y.toFixed(1)})`);

            this.handleVehicleCollision(vehicle1, vehicle2);
            this.collisionCooldowns[collisionKey] = currentTime;
        }
    }
    
    handleVehicleCollision(vehicle1, vehicle2) {
        const xDistance = Math.abs(vehicle1.x - vehicle2.x);
        const yDistance = Math.abs(vehicle1.y - vehicle2.y);
        
        console.log('Collision detected - xDist:', xDistance, 'yDist:', yDistance);
        
        // Determine collision type based on relative positions
        // More lenient rear-end detection, especially when braking
        const frontVehicle = vehicle1.x > vehicle2.x ? vehicle1 : vehicle2;
        const backVehicle = vehicle1.x > vehicle2.x ? vehicle2 : vehicle1;
        const frontIsBraking = frontVehicle.isBraking && frontVehicle.isBraking();

        // Adjust collision thresholds for braking scenarios
        const yThreshold = frontIsBraking ? 45 : 35; // More lenient Y distance when braking
        const xThreshold = frontIsBraking ? 40 : 25; // More lenient X distance when braking

        if (yDistance < yThreshold && xDistance < xThreshold) {
            // Same lane collision - rear-end collision

            console.log(`Rear-end collision: ${backVehicle.constructor.name} hitting ${frontVehicle.constructor.name} ${frontIsBraking ? '(BRAKING!)' : ''}`);
            console.log(`Thresholds used: Y<${yThreshold}, X<${xThreshold} (actual: Y=${yDistance}, X=${xDistance})`);
            
            // Block the back vehicle and boost the front
            if (backVehicle.blockVehicle) {
                backVehicle.blockVehicle(frontVehicle);
                console.log('Blocked', backVehicle.constructor.name);
            }
            if (frontVehicle.receiveBoostFromCollision) {
                frontVehicle.receiveBoostFromCollision();
                console.log('Boosted', frontVehicle.constructor.name);
            }

            // Play bump sound effects for rear-end collision (only if player is involved)
            if (this.audioManager && (vehicle1 === this.player || vehicle2 === this.player)) {
                this.audioManager.playSoundWithCooldown('bump', 800); // 800ms cooldown
                this.audioManager.playSound('bump2'); // Snarky "HaHa" sound
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

                // Apply push slowdown effect
                if (vehicle.receivePushSlowdown) {
                    vehicle.receivePushSlowdown();
                }

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

        // Boost events - single tap to use full boost
        this.events.on('boostTap', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.useFullBoost();
            }
        });

        // Brake events - strategic braking for collision setup
        this.events.on('brake', () => {
            if (this.gameStarted && !this.gameEnded) {
                this.player.activateBrake();
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
            const boostAvailable = this.player.getBoostPercentage() >= 1.0 && !this.player.boostCooldown;
            uiScene.updateBoostMeter(this.player.getBoostPercentage(), boostAvailable);
            uiScene.updateBoostButtons(boostAvailable);
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
        this.events.off('boostTap');
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

            // Play boost whoosh sound for speed boost
            if (this.audioManager) {
                this.audioManager.playSound('boost');
            }

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