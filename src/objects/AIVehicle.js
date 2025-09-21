class AIVehicle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, character, difficulty = 0.5) {
        super(scene, x, y);
        
        this.scene = scene;
        this.character = character;
        this.difficulty = difficulty; // 0-1, affects speed and decision making
        this.currentLane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        this.targetLane = this.currentLane;
        this.isChangingLanes = false;
        this.laneChangeProgress = 0;
        
        // AI behavior timers
        this.laneChangeTimer = 0;
        this.boostTimer = 0;
        this.nextLaneChange = Phaser.Math.Between(1000, GameConfig.AI.LANE_CHANGE_FREQ);
        this.nextBoost = Phaser.Math.Between(2000, GameConfig.AI.BOOST_FREQ);
        
        // Physics
        this.baseSpeed = GameConfig.BASE_FORWARD_SPEED * 
            Phaser.Math.FloatBetween(GameConfig.AI.MIN_SPEED_MULT, GameConfig.AI.MAX_SPEED_MULT);
        this.currentSpeed = this.baseSpeed;
        this.verticalVelocity = 0;
        this.isAirborne = false;
        
        // Boost
        this.boostMeter = GameConfig.BOOST_MAX_SECONDS;
        this.isBoosting = false;
        
        // Position tracking
        this.distanceTraveled = 0;
        
        // Collision properties
        this.isBlocked = false;
        this.blockingObstacle = null;
        this.blockingVehicle = null;
        
        // Extended lane system
        this.extendedLane = this.currentLane; // Start in current road lane
        this.targetExtendedLane = this.currentLane;
        
        // Offroad effects
        this.rumbleOffset = 0;
        this.rumbleSpeed = 0;
        this.dustTimer = 0;
        
        this.createVehicle();
        scene.add.existing(this);
        
        this.y = GameConfig.LANE_Y_POSITIONS[this.currentLane];
    }
    
    createVehicle() {
        // Create car body with slight variation for AI
        const carColor = Phaser.Math.Between(0x555555, 0x888888);
        const carBody = this.scene.add.rectangle(0, 10, 58, 24, carColor);
        const carFront = this.scene.add.rectangle(19, 8, 19, 19, carColor + 0x111111);
        const carBack = this.scene.add.rectangle(-19, 8, 14, 19, carColor + 0x111111);
        
        // Wheels
        const wheelFront = this.scene.add.circle(14, 20, 7, 0x333333);
        const wheelBack = this.scene.add.circle(-14, 20, 7, 0x333333);
        
        // Create shadow (will be visible when airborne)
        this.shadow = this.scene.add.ellipse(0, 22, 45, 12, 0x000000);
        this.shadow.setAlpha(0.3);
        this.shadow.setVisible(false);
        this.shadow.setDepth(-1);
        
        // Create car container that will lift when airborne
        this.carContainer = this.scene.add.container(0, 0);
        this.carContainer.add([carBack, carBody, carFront, wheelFront, wheelBack]);
        
        // Create and add AI rat
        this.ratSprite = this.scene.paletteSwap.createRatSprite(this.character);
        this.ratSprite.setScale(0.75);
        this.ratSprite.y = -5;
        this.carContainer.add(this.ratSprite);
        
        // Boost effect
        this.boostEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.boostEffect);
        
        // Add dust effect container for offroad
        this.dustEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.dustEffect);
        
        this.add([this.shadow, this.carContainer]);
    }
    
    makeDecision(playerX, obstacles) {
        // Simple AI decision making based on difficulty
        const decisionThreshold = 0.3 + (this.difficulty * 0.5);
        
        // Check for obstacles in current lane
        const dangerAhead = this.checkForDanger(obstacles);
        
        if (dangerAhead && Math.random() < decisionThreshold) {
            // Try to change lanes
            const possibleLanes = [];
            if (this.currentLane > 0) possibleLanes.push(-1);
            if (this.currentLane < GameConfig.LANE_COUNT - 1) possibleLanes.push(1);
            
            if (possibleLanes.length > 0) {
                const direction = Phaser.Math.RND.pick(possibleLanes);
                this.changeLane(direction);
            }
        }
        
        // Boost decision
        if (this.boostMeter > 1 && Math.random() < (this.difficulty * 0.1)) {
            this.startBoost();
            this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
                this.stopBoost();
            });
        }
    }
    
    checkForDanger(obstacles) {
        // Simple collision prediction
        for (let obstacle of obstacles) {
            const relativeX = obstacle.x - this.x;
            const relativeY = Math.abs(obstacle.y - this.y);
            
            if (relativeX > 0 && relativeX < 200 && relativeY < 30) {
                return true;
            }
        }
        return false;
    }
    
    changeLane(direction) {
        if (this.isAirborne || this.isChangingLanes) return false;
        
        const newExtendedLane = this.extendedLane + direction;
        
        console.log(`AIVehicle changeLane: from ${this.extendedLane} to ${newExtendedLane} (direction: ${direction})`);
        
        // Use extended lane system like PlayerVehicle
        if (newExtendedLane < -1 || newExtendedLane > 4) {
            console.log(`AI Lane change blocked - out of bounds: ${newExtendedLane}`);
            return false;
        }
        
        // Update to use extended lane system
        this.targetExtendedLane = newExtendedLane;
        this.isChangingLanes = true;
        this.laneChangeProgress = 0;
        
        console.log(`AIVehicle changing to extended lane ${newExtendedLane}`);
        return true;
    }
    
    startBoost() {
        if (this.boostMeter > 0 && !this.isBlocked) {
            this.isBoosting = true;
            this.showBoostEffect();
        }
    }
    
    stopBoost() {
        this.isBoosting = false;
        this.hideBoostEffect();
    }
    
    showBoostEffect() {
        this.boostEffect.removeAll(true);
        for (let i = 0; i < 2; i++) {
            const particle = this.scene.add.circle(
                -28 - (i * 8),
                Phaser.Math.Between(-4, 4),
                3,
                0xFFAA00
            );
            particle.setAlpha(0.6);
            this.boostEffect.add(particle);
        }
    }
    
    hideBoostEffect() {
        this.boostEffect.removeAll(true);
    }
    
    showDustEffect() {
        // Create dust particles behind vehicle in world space, not in container
        for (let i = 0; i < 2; i++) {
            const dust = this.scene.add.circle(
                this.x - 35 - (i * 12), // Behind the vehicle in world coordinates
                this.y + Phaser.Math.Between(-6, 6),
                Phaser.Math.Between(2, 5),
                0x654321 // Darker brown dust color for better visibility
            );
            dust.setAlpha(0.7); // Increased opacity
            dust.setDepth(1); // Above background but below vehicles
            
            this.scene.tweens.add({
                targets: dust,
                x: dust.x - 40,
                y: dust.y + Phaser.Math.Between(-8, 8),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 700,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    isOffroad() {
        return this.extendedLane === -1 || this.extendedLane === 4;
    }
    
    hitRamp() {
        if (!this.isAirborne) {
            this.isAirborne = true;
            this.verticalVelocity = GameConfig.AIR_IMPULSE;
        }
    }
    
    hitObstacle() {
        // Stop the vehicle instead of slowing down
        this.isBlocked = true;
        this.currentSpeed = 0;
        
        // Stop boost if currently boosting
        if (this.isBoosting) {
            this.stopBoost();
        }
    }
    
    clearObstacle() {
        // Called when obstacle moves away
        this.isBlocked = false;
        this.currentSpeed = this.baseSpeed;
    }
    
    blockVehicle(frontVehicle) {
        // Prevent multiple blocks from the same vehicle
        if (this.blockingVehicle === frontVehicle) return;
        
        this.isBlocked = true;
        this.currentSpeed = 0;
        this.blockingVehicle = frontVehicle;
        
        console.log('AI vehicle blocked by front vehicle');
    }
    
    clearVehicleBlock() {
        this.isBlocked = false;
        this.currentSpeed = this.baseSpeed;
        this.blockingVehicle = null;
        
        console.log('AI vehicle cleared vehicle block');
    }
    
    update(delta) {
        const dt = delta / 1000;
        
        // Update AI timers
        this.laneChangeTimer += delta;
        this.boostTimer += delta;
        
        // Make periodic decisions
        if (this.laneChangeTimer > this.nextLaneChange) {
            this.laneChangeTimer = 0;
            this.nextLaneChange = Phaser.Math.Between(1000, GameConfig.AI.LANE_CHANGE_FREQ);
            
            if (Math.random() < 0.3 && !this.isChangingLanes) {
                const direction = Phaser.Math.RND.sign();
                this.changeLane(direction);
            }
        }
        
        // Handle lane changing
        if (this.isChangingLanes) {
            this.laneChangeProgress += delta;
            const progress = this.laneChangeProgress / GameConfig.LANE_CHANGE_DURATION;
            
            if (progress >= 1) {
                // Complete the lane change using extended lane system
                this.extendedLane = this.targetExtendedLane;
                this.isChangingLanes = false;
                
                // Update current lane and position
                if (this.extendedLane >= 0 && this.extendedLane < GameConfig.LANE_COUNT) {
                    // On road
                    this.currentLane = this.extendedLane;
                    this.y = GameConfig.LANE_Y_POSITIONS[this.extendedLane];
                    this.setAlpha(1.0);
                } else {
                    // Offroad
                    this.currentLane = -1;
                    this.y = GameConfig.EXTENDED_LANE_POSITIONS[this.extendedLane + 1]; // Adjust for array index
                    this.setAlpha(0.8);
                    
                    // Start rumble effect
                    this.rumbleSpeed = 8; // Rumble frequency
                }
                
                // Check if we're clear of obstacles after lane change
                if (this.isBlocked && this.blockingObstacle) {
                    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.blockingObstacle.x, this.blockingObstacle.y);
                    if (distance > 60) { // Clear of obstacle
                        this.clearObstacle();
                    }
                }
                
                console.log(`AI lane change complete to extended lane ${this.extendedLane}`);
            } else {
                // Animate between positions using extended lane system
                const startY = GameConfig.EXTENDED_LANE_POSITIONS[this.extendedLane + 1];
                const endY = GameConfig.EXTENDED_LANE_POSITIONS[this.targetExtendedLane + 1];
                this.y = Phaser.Math.Linear(startY, endY, progress);
            }
        }
        
        // Handle airborne physics
        if (this.isAirborne) {
            this.verticalVelocity += GameConfig.GRAVITY * dt;
            const verticalOffset = this.verticalVelocity * dt;
            this.carContainer.y += verticalOffset;
            
            // Show shadow when airborne
            this.shadow.setVisible(true);
            
            if (this.verticalVelocity > 0 && this.carContainer.y >= 0) {
                this.isAirborne = false;
                this.carContainer.y = 0;
                this.verticalVelocity = 0;
                this.shadow.setVisible(false);
            }
        }
        
        // Handle boost
        if (this.isBoosting && this.boostMeter > 0 && !this.isBlocked) {
            this.boostMeter -= dt;
            // Apply boost speed, considering offroad status
            if (this.isOffroad()) {
                this.currentSpeed = this.baseSpeed * GameConfig.BOOST_SPEED_MULTIPLIER * GameConfig.OFFROAD_SLOWDOWN;
            } else {
                this.currentSpeed = this.baseSpeed * GameConfig.BOOST_SPEED_MULTIPLIER;
            }
            
            if (this.boostMeter <= 0) {
                this.boostMeter = 0;
                this.stopBoost();
            }
        } else {
            if (this.boostMeter < GameConfig.BOOST_MAX_SECONDS) {
                this.boostMeter += GameConfig.BOOST_REGEN_PER_SEC * dt * 0.8; // AI regenerates slower
                this.boostMeter = Math.min(this.boostMeter, GameConfig.BOOST_MAX_SECONDS);
            }
            
            // Set speed based on whether we're offroad or not
            if (this.isOffroad()) {
                this.currentSpeed = this.baseSpeed * GameConfig.OFFROAD_SLOWDOWN;
            } else {
                this.currentSpeed = this.baseSpeed;
            }
        }
        
        // Handle obstacle blocking
        if (this.isBlocked && this.blockingObstacle) {
            // Check if we can move around the obstacle
            const relativeX = this.blockingObstacle.x - this.x;
            if (relativeX < -60) { // Obstacle has passed
                this.clearObstacle();
                this.blockingObstacle = null;
            }
        }
        
        // Handle vehicle blocking
        if (this.isBlocked && this.blockingVehicle) {
            // Check if the blocking vehicle has moved away - be more strict about clearing
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.blockingVehicle.x, this.blockingVehicle.y);
            
            // Only clear if vehicle is significantly ahead or far away - even stricter
            if (distance > 100 || (this.blockingVehicle.x - this.x) > 80) { // Much stricter clearing conditions
                this.clearVehicleBlock();
            } else {
                // Force stay blocked and behind the other vehicle
                this.currentSpeed = 0;
            }
        }
        
        // Handle offroad effects (only if not airborne)
        if (this.isOffroad() && !this.isAirborne) {
            // Rumble effect - car bounces up and down (doubled bouncing)
            this.rumbleOffset += this.rumbleSpeed * dt;
            const rumbleAmount = Math.sin(this.rumbleOffset) * 4; // 4px rumble amplitude (doubled from 2px for AI)
            this.carContainer.y = rumbleAmount;
            
            // Dust particles
            this.dustTimer += delta;
            if (this.dustTimer > 250) { // Less frequent dust for AI
                this.showDustEffect();
                this.dustTimer = 0;
            }
        } else if (!this.isAirborne) {
            // No rumble when on road and not airborne
            this.carContainer.y = 0;
            this.rumbleOffset = 0;
            this.rumbleSpeed = 0;
            // Don't reset dustTimer here - only when actually showing dust
        }
        
        // Update distance
        this.distanceTraveled += this.currentSpeed * dt;
    }
    
    receiveBoostFromCollision() {
        // Get a moderate temporary speed boost from being hit from behind
        if (this.isOffroad()) {
            this.currentSpeed = this.baseSpeed * 1.4 * GameConfig.OFFROAD_SLOWDOWN; // Apply offroad penalty to boost
        } else {
            this.currentSpeed = this.baseSpeed * 1.4; // 40% speed boost (more reasonable)
        }
        this.scene.time.delayedCall(1500, () => { // 1.5 seconds (reduced from 3 seconds)
            if (!this.isBoosting && !this.isBlocked) {
                // Reset to appropriate speed based on offroad status
                if (this.isOffroad()) {
                    this.currentSpeed = this.baseSpeed * GameConfig.OFFROAD_SLOWDOWN;
                } else {
                    this.currentSpeed = this.baseSpeed;
                }
            }
        });
        
        // Visual feedback
        this.showExclamationEffect();
        this.showCollisionBoostEffect();
        
        console.log('AI vehicle received collision boost - 40% speed boost for 1.5 seconds');
    }
    
    showExclamationEffect() {
        // Create exclamation mark effect above the vehicle
        const exclamation = this.scene.add.text(this.x, this.y - 40, '!', {
            fontSize: '20px', // Slightly smaller for AI
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });
        exclamation.setOrigin(0.5);
        exclamation.setDepth(10); // Above everything else
        
        // Animate the exclamation mark
        this.scene.tweens.add({
            targets: exclamation,
            y: exclamation.y - 30, // Float upward
            alpha: { from: 1, to: 0 }, // Fade out
            scaleX: { from: 1, to: 1.5 }, // Scale up slightly
            scaleY: { from: 1, to: 1.5 },
            duration: 1000,
            ease: 'Power2',
            onComplete: () => exclamation.destroy()
        });
    }
    
    showCollisionBoostEffect() {
        // Create visible collision boost effect for AI
        for (let i = 0; i < 4; i++) { // Fewer particles for AI
            const particle = this.scene.add.circle(
                this.x - 20 - (i * 8),
                this.y + Phaser.Math.Between(-8, 8),
                Phaser.Math.Between(3, 6), // Smaller particles for AI
                0x00AAFF
            );
            particle.setAlpha(0.8);
            particle.setDepth(5);
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x - 30,
                y: particle.y + Phaser.Math.Between(-10, 10),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // Add flash effect
        const flash = this.scene.add.circle(this.x, this.y, 25, 0x00AAFF);
        flash.setAlpha(0.5);
        flash.setDepth(5);
        
        this.scene.tweens.add({
            targets: flash,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 250,
            onComplete: () => flash.destroy()
        });
    }
    
    goOffroad(type) {
        this.currentLane = -1; // Mark as not in a lane
        
        // Move to offroad position
        if (type === 'high') {
            this.extendedLane = -1;
            this.y = GameConfig.OFFROAD_HIGH_Y;
        } else {
            this.extendedLane = 4;
            this.y = GameConfig.OFFROAD_LOW_Y;
        }
        
        // Visual feedback
        this.setAlpha(0.8);
        this.rumbleSpeed = 8; // Start rumble effect
        
        // AI will try to return to road after a delay
        this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
            this.returnToRoad();
        });
    }
    
    returnToRoad() {
        if (!this.isOffroad()) return;
        
        // Determine which lane to return to
        let targetLane;
        if (this.extendedLane === -1) {
            targetLane = 0; // Return to top lane
        } else {
            targetLane = GameConfig.LANE_COUNT - 1; // Return to bottom lane
        }
        
        this.extendedLane = targetLane;
        this.currentLane = targetLane;
        this.targetLane = targetLane;
        this.y = GameConfig.LANE_Y_POSITIONS[targetLane];
        
        // Restore normal appearance
        this.setAlpha(1.0);
        this.rumbleSpeed = 0; // Stop rumble
    }
}