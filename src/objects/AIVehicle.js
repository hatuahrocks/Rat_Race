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
        
        this.add([carBack, carBody, carFront, wheelFront, wheelBack]);
        
        // Create and add AI rat
        this.ratSprite = this.scene.paletteSwap.createRatSprite(this.character);
        this.ratSprite.setScale(0.75);
        this.ratSprite.y = -5;
        this.add(this.ratSprite);
        
        // Boost effect
        this.boostEffect = this.scene.add.container(0, 0);
        this.add(this.boostEffect);
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
    
    hitRamp() {
        if (!this.isAirborne) {
            this.isAirborne = true;
            this.verticalVelocity = GameConfig.AIR_IMPULSE;
        }
    }
    
    hitObstacle() {
        this.currentSpeed = this.baseSpeed * GameConfig.OBSTACLE_SLOW_AMOUNT;
        this.scene.time.delayedCall(GameConfig.OBSTACLE_SLOW_DURATION, () => {
            this.currentSpeed = this.baseSpeed;
        });
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
            if (this.boostMeter < GameConfig.BOOST_MAX_SECONDS) {
                this.boostMeter += GameConfig.BOOST_REGEN_PER_SEC * dt * 0.8; // AI regenerates slower
                this.boostMeter = Math.min(this.boostMeter, GameConfig.BOOST_MAX_SECONDS);
            }
            this.currentSpeed = this.baseSpeed;
        }
        
        // Update distance
        this.distanceTraveled += this.currentSpeed * dt;
    }
}