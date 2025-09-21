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
        
        // Slowdown properties
        this.slowdownTimer = 0;
        this.isSlowed = false;
        
        this.createVehicle();
        scene.add.existing(this);
    }
    
    createVehicle() {
        // Create car body (open-top design)
        const carBody = this.scene.add.rectangle(0, 10, 60, 25, 0x333333);
        const carFront = this.scene.add.rectangle(20, 8, 20, 20, 0x444444);
        const carBack = this.scene.add.rectangle(-20, 8, 15, 20, 0x444444);
        
        // Create wheels
        const wheelFront = this.scene.add.circle(15, 20, 8, 0x222222);
        const wheelBack = this.scene.add.circle(-15, 20, 8, 0x222222);
        
        this.add([carBack, carBody, carFront, wheelFront, wheelBack]);
        
        // Create and add rat
        this.ratSprite = this.scene.paletteSwap.createRatSprite(this.character);
        this.ratSprite.setScale(0.8);
        this.ratSprite.y = -5;
        this.add(this.ratSprite);
        
        // Add boost effect container
        this.boostEffect = this.scene.add.container(0, 0);
        this.add(this.boostEffect);
    }
    
    changeLane(direction) {
        if (this.isAirborne || this.isChangingLanes) return;
        
        const newLane = this.currentLane + direction;
        if (newLane >= 0 && newLane < GameConfig.LANE_COUNT) {
            this.targetLane = newLane;
            this.isChangingLanes = true;
            this.laneChangeProgress = 0;
        }
    }
    
    startBoost() {
        if (this.boostMeter > 0) {
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
    
    hitRamp() {
        if (!this.isAirborne) {
            this.isAirborne = true;
            this.verticalVelocity = GameConfig.AIR_IMPULSE;
            this.airborneTime = 0;
        }
    }
    
    hitObstacle() {
        if (!this.isSlowed) {
            this.isSlowed = true;
            this.slowdownTimer = GameConfig.OBSTACLE_SLOW_DURATION;
            this.currentSpeed *= GameConfig.OBSTACLE_SLOW_AMOUNT;
        }
    }
    
    update(delta) {
        const dt = delta / 1000;
        
        // Handle lane changing
        if (this.isChangingLanes) {
            this.laneChangeProgress += delta;
            const progress = this.laneChangeProgress / GameConfig.LANE_CHANGE_DURATION;
            
            if (progress >= 1) {
                this.currentLane = this.targetLane;
                this.isChangingLanes = false;
                this.y = GameConfig.LANE_Y_POSITIONS[this.currentLane];
            } else {
                const startY = GameConfig.LANE_Y_POSITIONS[this.currentLane];
                const endY = GameConfig.LANE_Y_POSITIONS[this.targetLane];
                this.y = Phaser.Math.Linear(startY, endY, progress);
            }
        }
        
        // Handle airborne physics
        if (this.isAirborne) {
            this.verticalVelocity += GameConfig.GRAVITY * dt;
            const verticalOffset = this.verticalVelocity * dt;
            this.ratSprite.y = -5 + verticalOffset;
            
            // Check for landing
            if (this.verticalVelocity > 0 && this.ratSprite.y >= -5) {
                this.isAirborne = false;
                this.ratSprite.y = -5;
                this.verticalVelocity = 0;
            }
        }
        
        // Handle boost
        if (this.isBoosting && this.boostMeter > 0) {
            this.boostMeter -= dt;
            this.currentSpeed = this.baseSpeed * GameConfig.BOOST_SPEED_MULTIPLIER;
            
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
            
            if (!this.isSlowed) {
                this.currentSpeed = this.baseSpeed;
            }
        }
        
        // Handle slowdown
        if (this.isSlowed) {
            this.slowdownTimer -= delta;
            if (this.slowdownTimer <= 0) {
                this.isSlowed = false;
                this.currentSpeed = this.baseSpeed;
            }
        }
    }
    
    getBoostPercentage() {
        return this.boostMeter / GameConfig.BOOST_MAX_SECONDS;
    }
}