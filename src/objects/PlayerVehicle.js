class PlayerVehicle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, character) {
        super(scene, x, y);
        
        this.scene = scene;
        this.character = character;
        this.currentLane = 1; // Start in lane 1 (0-3)
        this.targetLane = 1;
        this.isChangingLanes = false;
        this.laneChangeProgress = 0;
        
        // Physics properties
        this.baseSpeed = GameConfig.BASE_FORWARD_SPEED;
        this.currentSpeed = this.baseSpeed;
        this.verticalVelocity = 0;
        this.isAirborne = false;
        this.airborneTime = 0;
        
        // Boost properties
        this.boostMeter = GameConfig.BOOST_MAX_SECONDS;
        this.isBoosting = false;
        
        // Collision properties
        this.isBlocked = false;
        this.blockingObstacle = null;
        this.lastObstacleHit = null;
        this.blockingVehicle = null;
        
        // Offroad effects
        this.rumbleOffset = 0;
        this.rumbleSpeed = 0;
        this.dustTimer = 0;
        
        // Extended lane system - tracks current extended lane (-1 to 4)
        // -1 = high offroad, 0-3 = road lanes, 4 = low offroad
        this.extendedLane = 1; // Start in road lane 1
        
        // Collision boost tracking
        this.hasCollisionBoost = false;

        // Ramp boost tracking
        this.rampBoostSpeed = 0;
        this.rampBoostTime = 0;

        // Strawberry boost tracking
        this.strawberryBoostSpeed = 0;
        this.strawberryBoostTime = 0;

        this.createVehicle();
        scene.add.existing(this);
    }
    
    createVehicle() {
        // Create shadow (will be visible when airborne)
        this.shadow = this.scene.add.ellipse(0, 25, 50, 15, 0x000000);
        this.shadow.setAlpha(0.3);
        this.shadow.setVisible(false);
        this.shadow.setDepth(-1);
        
        // Create car container that will lift when airborne
        this.carContainer = this.scene.add.container(0, 0);
        
        // Get selected car color or default
        const selectedCarColor = this.scene.registry.get('selectedCarColor') || { color: 0x333333, accent: 0x444444 };
        
        // Create car body (open-top design) with selected colors
        const carBody = this.scene.add.rectangle(0, 10, 60, 25, selectedCarColor.color);
        const carFront = this.scene.add.rectangle(20, 8, 20, 20, selectedCarColor.accent);
        const carBack = this.scene.add.rectangle(-20, 8, 15, 20, selectedCarColor.accent);
        
        // Create wheels
        const wheelFront = this.scene.add.circle(15, 20, 8, 0x222222);
        const wheelBack = this.scene.add.circle(-15, 20, 8, 0x222222);
        
        this.carContainer.add([carBack, carBody, carFront, wheelFront, wheelBack]);
        
        // Create and add rat
        this.ratSprite = this.scene.paletteSwap.createRatSprite(this.character);
        this.ratSprite.setScale(0.8);
        this.ratSprite.y = -5;
        this.carContainer.add(this.ratSprite);
        
        // Add boost effect container
        this.boostEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.boostEffect);
        
        // Add dust effect container for offroad
        this.dustEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.dustEffect);
        
        this.add([this.shadow, this.carContainer]);
    }
    
    changeLane(direction) {
        if (this.isAirborne || this.isChangingLanes) return false;
        
        const newExtendedLane = this.extendedLane + direction;
        
        console.log(`PlayerVehicle changeLane: from ${this.extendedLane} to ${newExtendedLane} (direction: ${direction})`);
        
        // Check bounds for 6-lane system (-1 to 4)
        if (newExtendedLane < -1 || newExtendedLane > 4) {
            console.log(`Lane change blocked - out of bounds: ${newExtendedLane}`);
            return false;
        }
        
        // Check if it's a road lane and if it's clear of obstacles (but allow offroad pushing)
        if (newExtendedLane >= 0 && newExtendedLane < GameConfig.LANE_COUNT) {
            if (!this.canChangeLane(newExtendedLane)) {
                console.log(`Lane change blocked - lane ${newExtendedLane} not clear`);
                return false;
            }
        }
        
        // Execute the lane change
        this.targetExtendedLane = newExtendedLane;
        this.isChangingLanes = true;
        this.laneChangeProgress = 0;
        
        console.log(`PlayerVehicle changing to extended lane ${newExtendedLane}`);
        return true;
    }

    changeLaneToTarget(targetLane) {
        if (this.isAirborne || this.isChangingLanes) return false;

        // Clamp target lane to valid range (-1 to 4)
        targetLane = Phaser.Math.Clamp(targetLane, -1, 4);

        // Don't change if already in target lane
        if (targetLane === this.extendedLane) return false;

        // Check if it's a road lane and if it's clear of obstacles (but allow offroad)
        if (targetLane >= 0 && targetLane < GameConfig.LANE_COUNT) {
            if (!this.canChangeLane(targetLane)) {
                console.log(`Direct lane change blocked - lane ${targetLane} not clear`);
                return false;
            }
        }

        // Execute the lane change
        this.targetExtendedLane = targetLane;
        this.isChangingLanes = true;
        this.laneChangeProgress = 0;

        console.log(`PlayerVehicle finger tracing to extended lane ${targetLane}`);
        return true;
    }
    
    isOffroad() {
        return this.extendedLane === -1 || this.extendedLane === 4;
    }
    
    goOffroad(type) {
        // Force move to offroad lane
        if (type === 'high') {
            this.extendedLane = -1;
            this.y = GameConfig.OFFROAD_HIGH_Y;
        } else {
            this.extendedLane = 4;
            this.y = GameConfig.OFFROAD_LOW_Y;
        }
        
        this.currentLane = -1;
        this.setAlpha(0.8);
        this.currentSpeed *= GameConfig.OFFROAD_SLOWDOWN;
    }
    
    canChangeLane(targetLane) {
        // Check with the scene's obstacle spawner if lane is clear
        if (this.scene.obstacleSpawner) {
            return this.scene.obstacleSpawner.isLaneClearForVehicle(targetLane, this.x, this.x + 100);
        }
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
    
    usePartialBoost() {
        const boostAmount = GameConfig.BOOST_MAX_SECONDS * 0.2;
        if (this.boostMeter >= boostAmount) {
            this.boostMeter -= boostAmount;
            // Apply temporary speed boost
            this.currentSpeed = this.baseSpeed * GameConfig.BOOST_SPEED_MULTIPLIER;
            this.showBoostEffect();
            
            this.scene.time.delayedCall(500, () => {
                this.currentSpeed = this.baseSpeed;
                this.hideBoostEffect();
            });
        }
    }
    
    showBoostEffect() {
        this.boostEffect.removeAll(true);
        
        // Create boost particles
        for (let i = 0; i < 3; i++) {
            const particle = this.scene.add.circle(
                -30 - (i * 10),
                Phaser.Math.Between(-5, 5),
                Phaser.Math.Between(2, 4),
                0xFFFF00
            );
            particle.setAlpha(0.7);
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
                this.x - 40 - (i * 15), // Behind the vehicle in world coordinates
                this.y + Phaser.Math.Between(-8, 8),
                Phaser.Math.Between(3, 6),
                0x654321 // Darker brown dust color for better visibility
            );
            dust.setAlpha(0.8); // Increased opacity
            dust.setDepth(1); // Above background but below vehicles
            
            // Animate dust particles
            this.scene.tweens.add({
                targets: dust,
                x: dust.x - 50,
                y: dust.y + Phaser.Math.Between(-10, 10),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 800,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    hideDustEffect() {
        this.dustEffect.removeAll(true);
    }
    
    hitRamp() {
        if (!this.isAirborne) {
            console.log('Player hit ramp - going airborne!');
            this.isAirborne = true;
            this.verticalVelocity = GameConfig.AIR_IMPULSE;
            this.airborneTime = 0;

            // Give a small speed boost as reward for hitting ramp
            this.rampBoostTime = 1500; // Boost lasts 1.5 seconds (30% speed boost)

            console.log('Ramp boost activated for 1.5s!');

            // Play ramp sound effect
            if (this.scene.audioManager) {
                this.scene.audioManager.playSound('ramp');
            }
        }
    }
    
    hitObstacle(obstacle) {
        // Prevent multiple hits from the same obstacle
        if (this.lastObstacleHit === obstacle) return;

        // Stop the vehicle instead of slowing down
        this.isBlocked = true;
        this.currentSpeed = 0;
        this.blockingObstacle = obstacle;
        this.lastObstacleHit = obstacle;

        // Play bump sound effect when hitting obstacle
        if (this.scene.audioManager) {
            this.scene.audioManager.playSound('bump');
        }
        
        // Stop boost if currently boosting
        if (this.isBoosting) {
            this.stopBoost();
        }
        
        console.log('Player hit obstacle - STOPPED');
    }
    
    clearObstacle() {
        // Called when obstacle moves away
        this.isBlocked = false;
        this.currentSpeed = this.baseSpeed;
        this.lastObstacleHit = null;
        
        console.log('Player cleared obstacle - MOVING');
    }
    
    blockVehicle(frontVehicle) {
        // Prevent multiple blocks from the same vehicle
        if (this.blockingVehicle === frontVehicle) return;
        
        this.isBlocked = true;
        this.currentSpeed = 0;
        this.blockingVehicle = frontVehicle;
        
        console.log('Player blocked by vehicle - STOPPED');
    }
    
    clearVehicleBlock() {
        this.isBlocked = false;
        this.currentSpeed = this.baseSpeed;
        this.blockingVehicle = null;
        
        console.log('Player cleared vehicle block - MOVING');
    }
    
    update(delta) {
        const dt = delta / 1000;
        
        // Handle lane changing
        if (this.isChangingLanes) {
            this.laneChangeProgress += delta;
            const progress = this.laneChangeProgress / GameConfig.LANE_CHANGE_DURATION;
            
            if (progress >= 1) {
                // Complete the lane change
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
                
                // Speed will be set correctly in the main update loop
                
                console.log(`Lane change complete to extended lane ${this.extendedLane}`);
            } else {
                // Animate between positions
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
            
            // Check for landing
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
            // Regenerate boost
            if (this.boostMeter < GameConfig.BOOST_MAX_SECONDS) {
                this.boostMeter += GameConfig.BOOST_REGEN_PER_SEC * dt;
                this.boostMeter = Math.min(this.boostMeter, GameConfig.BOOST_MAX_SECONDS);
            }
            
            // Handle ramp boost timer
            if (this.rampBoostTime > 0) {
                this.rampBoostTime -= delta;
                if (this.rampBoostTime <= 0) {
                    this.rampBoostTime = 0;
                    this.rampBoostSpeed = 0;
                    console.log('Ramp boost ended');
                }
            }

            // Handle strawberry boost timer
            if (this.strawberryBoostTime > 0) {
                this.strawberryBoostTime -= delta;
                if (this.strawberryBoostTime <= 0) {
                    this.strawberryBoostTime = 0;
                    this.strawberryBoostSpeed = 0;
                    console.log('Strawberry boost ended');
                }
            }

            if (!this.isBlocked && !this.hasCollisionBoost) {
                // Calculate base speed first
                let speedMultiplier = 1.0;

                // Apply power-up boosts (these should be VERY noticeable!)
                if (this.strawberryBoostTime > 0) {
                    speedMultiplier = Math.max(speedMultiplier, 1.7); // 70% boost from strawberry (more than manual boost!)
                }
                if (this.rampBoostTime > 0) {
                    speedMultiplier = Math.max(speedMultiplier, 1.5); // 50% boost from ramp (similar to manual boost)
                }

                // Set speed based on whether we're offroad or not
                if (this.isOffroad()) {
                    this.currentSpeed = this.baseSpeed * speedMultiplier * GameConfig.OFFROAD_SLOWDOWN;
                } else {
                    this.currentSpeed = this.baseSpeed * speedMultiplier;
                }

                // Log when boosts are active for debugging
                if (speedMultiplier > 1.0) {
                    console.log(`Speed boost active! Multiplier: ${speedMultiplier}, Speed: ${this.currentSpeed}`);
                }
            }
        }
        
        // Handle offroad effects (only if not airborne)
        if (this.isOffroad() && !this.isAirborne) {
            // Rumble effect - car bounces up and down (doubled bouncing)
            this.rumbleOffset += this.rumbleSpeed * dt;
            const rumbleAmount = Math.sin(this.rumbleOffset) * 6; // 6px rumble amplitude (doubled from 3px)
            this.carContainer.y = rumbleAmount;
            
            // Dust particles
            this.dustTimer += delta;
            if (this.dustTimer > 200) { // Create dust every 200ms
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
            const xDistance = Math.abs(this.x - this.blockingVehicle.x);
            
            // Only clear if vehicle is significantly ahead or far away - even stricter
            if (distance > 100 || (this.blockingVehicle.x - this.x) > 80) { // Much stricter clearing conditions
                this.clearVehicleBlock();
            } else {
                // Force stay blocked and behind the other vehicle
                this.currentSpeed = 0;
            }
        }
    }
    
    getBoostPercentage() {
        return this.boostMeter / GameConfig.BOOST_MAX_SECONDS;
    }
    
    receiveBoostFromCollision() {
        // Get a moderate temporary speed boost from being hit from behind
        const oldSpeed = this.currentSpeed;
        this.hasCollisionBoost = true;
        this.currentSpeed = this.baseSpeed * 1.4; // 40% speed boost (more reasonable)
        
        console.log(`COLLISION BOOST: Speed changed from ${oldSpeed} to ${this.currentSpeed} (base: ${this.baseSpeed})`);
        
        this.scene.time.delayedCall(1500, () => { // 1.5 seconds (reduced from 3 seconds)
            this.hasCollisionBoost = false;
            if (!this.isBoosting && !this.isBlocked) {
                this.currentSpeed = this.baseSpeed;
                console.log(`COLLISION BOOST ENDED: Speed reset to ${this.currentSpeed}`);
            }
        });
        
        // Visual feedback
        this.showCollisionBoostEffect();
        this.showExclamationEffect();
        
        console.log('Player received collision boost - 40% speed boost for 1.5 seconds');
    }
    
    showCollisionBoostEffect() {
        // Create much more visible collision boost effect
        for (let i = 0; i < 6; i++) { // More particles
            const particle = this.scene.add.circle(
                this.x - 20 - (i * 8), // Closer to vehicle
                this.y + Phaser.Math.Between(-10, 10),
                Phaser.Math.Between(4, 8), // Bigger particles
                0x00AAFF // Bright blue
            );
            particle.setAlpha(0.9); // More visible
            particle.setDepth(5); // Above most elements
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x - 40, // Move further back
                y: particle.y + Phaser.Math.Between(-15, 15),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 800, // Longer duration
                onComplete: () => particle.destroy()
            });
        }
        
        // Add a bright flash effect
        const flash = this.scene.add.circle(this.x, this.y, 30, 0x00AAFF);
        flash.setAlpha(0.6);
        flash.setDepth(5);
        
        this.scene.tweens.add({
            targets: flash,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
        
        // Add speed lines effect
        for (let i = 0; i < 4; i++) {
            const speedLine = this.scene.add.rectangle(
                this.x + 20 + (i * 15),
                this.y + Phaser.Math.Between(-15, 15),
                20, 3,
                0x00AAFF
            );
            speedLine.setAlpha(0.8);
            speedLine.setDepth(5);
            
            this.scene.tweens.add({
                targets: speedLine,
                x: speedLine.x + 60,
                alpha: 0,
                duration: 600,
                onComplete: () => speedLine.destroy()
            });
        }
    }
    
    showExclamationEffect() {
        // Create exclamation mark effect above the vehicle
        const exclamation = this.scene.add.text(this.x, this.y - 40, '!', {
            fontSize: '24px',
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
}