// Shared base class for PlayerVehicle and AIVehicle.
// All racing mechanics live here once: lanes, boosts, spin-outs, blocking,
// airborne physics, offroad effects, collision boxes. Subclasses supply
// input/AI and tweak behavior through opts and the hook methods at the bottom.
class Vehicle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, character, opts = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.character = character;
        this.isPlayer = !!opts.isPlayer;
        this.colors = opts.colors || { color: 0x333333, accent: 0x444444 };

        // Visual tuning (player is slightly bigger/louder than AI)
        this.carScale = opts.carScale !== undefined ? opts.carScale : 1;
        this.ratScale = opts.ratScale !== undefined ? opts.ratScale : 0.8;
        this.shadowWidth = opts.shadowWidth !== undefined ? opts.shadowWidth : 58;
        this.shadowHeight = opts.shadowHeight !== undefined ? opts.shadowHeight : 12;
        this.shadowAlpha = opts.shadowAlpha !== undefined ? opts.shadowAlpha : 0.25;
        this.rumbleAmplitude = opts.rumbleAmplitude !== undefined ? opts.rumbleAmplitude : 6;
        this.dustInterval = opts.dustInterval !== undefined ? opts.dustInterval : 200;
        this.boostParticleCount = opts.boostParticleCount !== undefined ? opts.boostParticleCount : 3;
        this.boostParticleColor = opts.boostParticleColor !== undefined ? opts.boostParticleColor : 0xFFFF00;

        // Lane state: extendedLane (-1..4) is the source of truth
        this.currentLane = this.getLaneFromY(y);
        this.targetLane = this.currentLane;
        this.extendedLane = this.currentLane;
        this.targetExtendedLane = this.currentLane;
        this.isChangingLanes = false;
        this.laneChangeProgress = 0;
        this.laneChangeStartY = y;

        // Physics
        this.baseSpeed = opts.baseSpeed !== undefined ? opts.baseSpeed : GameConfig.BASE_FORWARD_SPEED;
        this.currentSpeed = this.baseSpeed;
        this.verticalVelocity = 0;
        this.isAirborne = false;

        // Boost (tap-to-use full meter, cooldown until refilled)
        this.boostMeter = GameConfig.BOOST_MAX_SECONDS;
        this.isBoosting = false;
        this.boostCooldown = false;
        this.boostRegenScale = opts.boostRegenScale !== undefined ? opts.boostRegenScale : 1;

        // Collision state (isBlocked = stuck behind another vehicle)
        this.isBlocked = false;
        this.blockingVehicle = null;
        this.lastObstacleHit = null;

        // Spin-out state (obstacle hits)
        this.isSpinningOut = false;
        this.spinOutTime = 0;

        // Collision boost guard: stops the per-frame speed recalculation
        // from overwriting an externally-granted boost
        this.hasCollisionBoost = false;

        // Timed effects
        this.rampBoostTime = 0;
        this.strawberryBoostTime = 0;
        this.pushSlowdownTime = 0;
        this.pushSlowdownMultiplier = 0.6;
        this.brakeTime = 0;
        this.brakeMultiplier = 0.4;
        this.brakeDuration = 750;

        // Offroad effects
        this.rumbleOffset = 0;
        this.rumbleSpeed = 0;
        this.dustTimer = 0;

        // Race stats / progress
        this.boostsUsed = 0;
        this.obstaclesHit = 0;
        this.distanceTraveled = 0;

        // Collision bounding box
        this.collisionWidth = 45;
        this.collisionHeight = 35;
        this.lastPosition = { x: x, y: y };

        this.createVehicle();
        scene.add.existing(this);
    }

    getLaneFromY(yPosition) {
        for (let i = 0; i < GameConfig.LANE_Y_POSITIONS.length; i++) {
            if (Math.abs(GameConfig.LANE_Y_POSITIONS[i] - yPosition) < 20) {
                return i;
            }
        }
        return 0;
    }

    // World Y for an extended lane (-1..4); the +1 offsets into the array
    static yForLane(extendedLane) {
        return GameConfig.EXTENDED_LANE_POSITIONS[extendedLane + 1];
    }

    createVehicle() {
        // Ground-contact shadow, always visible; softens when airborne
        this.shadow = this.scene.add.ellipse(2, 27, this.shadowWidth, this.shadowHeight, 0x000000);
        this.shadow.setAlpha(this.shadowAlpha);
        this.shadow.setDepth(-1);

        // Car container lifts when airborne and spins on spin-outs
        this.carContainer = this.scene.add.container(0, 0);
        const car = GameArt.createCar(this.scene, this.colors);
        car.setScale(this.carScale);
        this.carContainer.add(car);

        // Rat driver
        this.ratSprite = this.scene.paletteSwap.createRatSprite(this.character);
        this.ratSprite.setScale(this.ratScale);
        this.ratSprite.y = -5;
        this.carContainer.add(this.ratSprite);

        // Effect containers
        this.boostEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.boostEffect);
        this.dustEffect = this.scene.add.container(0, 0);
        this.carContainer.add(this.dustEffect);

        this.add([this.shadow, this.carContainer]);
    }

    // ------------------------------------------------------------------ lanes

    changeLane(direction) {
        if (this.isAirborne || this.isSpinningOut) return false;

        const newExtendedLane = this.extendedLane + direction;
        if (newExtendedLane < -1 || newExtendedLane > 4) return false;
        if (!this.approveLaneChange(newExtendedLane)) return false;

        this.targetExtendedLane = newExtendedLane;
        // Start the animation from the current visual position so rapid
        // inputs can interrupt an in-flight lane change smoothly
        this.laneChangeStartY = this.isChangingLanes
            ? this.y
            : Vehicle.yForLane(this.extendedLane);
        this.isChangingLanes = true;
        this.laneChangeProgress = 0;
        return true;
    }

    isOffroad() {
        return this.extendedLane === -1 || this.extendedLane === 4;
    }

    goOffroad(type) {
        if (type === 'high') {
            this.extendedLane = -1;
            this.y = GameConfig.OFFROAD_HIGH_Y;
        } else {
            this.extendedLane = 4;
            this.y = GameConfig.OFFROAD_LOW_Y;
        }
        this.currentLane = -1;
        this.setAlpha(0.8);
        this.rumbleSpeed = 8;
        this.currentSpeed *= GameConfig.OFFROAD_SLOWDOWN;
    }

    // ------------------------------------------------------------------ boost

    useFullBoost() {
        if (this.boostMeter >= GameConfig.BOOST_MAX_SECONDS && !this.boostCooldown && !this.isBlocked) {
            this.isBoosting = true;
            this.boostCooldown = true;
            this.boostsUsed++;
            this.showBoostEffect();

            if (this.isPlayer && this.scene.audioManager) {
                this.scene.audioManager.playSound('manualboost');
                this.scene.audioManager.playSound('boost');
            }
        }
    }

    stopBoost() {
        this.isBoosting = false;
        this.hideBoostEffect();
        // Cooldown stays until the meter refills naturally
    }

    showBoostEffect() {
        this.boostEffect.removeAll(true);
        for (let i = 0; i < this.boostParticleCount; i++) {
            const particle = this.scene.add.circle(
                -30 - (i * 10),
                Phaser.Math.Between(-5, 5),
                Phaser.Math.Between(2, 4),
                this.boostParticleColor
            );
            particle.setAlpha(0.7);
            this.boostEffect.add(particle);
        }
    }

    hideBoostEffect() {
        this.boostEffect.removeAll(true);
    }

    getBoostPercentage() {
        return this.boostMeter / GameConfig.BOOST_MAX_SECONDS;
    }

    // ------------------------------------------------------------ collisions

    hitRamp() {
        if (!this.isAirborne) {
            this.isAirborne = true;
            this.verticalVelocity = GameConfig.AIR_IMPULSE;
            this.rampBoostTime = 1500; // +50% speed for 1.5s

            if (this.isPlayer && this.scene.audioManager) {
                this.scene.audioManager.playSound('ramp');
                this.scene.audioManager.playSound('boost');
            }
        }
    }

    hitObstacle(obstacle) {
        // Dedup per obstacle; airborne vehicles clear obstacles entirely
        if (this.lastObstacleHit === obstacle || this.isSpinningOut || this.isAirborne) return;

        this.lastObstacleHit = obstacle || null;
        this.obstaclesHit++;
        this.startSpinOut();

        if (this.isPlayer && this.scene.audioManager) {
            this.scene.audioManager.playSoundWithCooldown('bump', 1000);
        }
        if (this.isBoosting) {
            this.stopBoost();
        }
    }

    startSpinOut() {
        // Heavy slowdown with a 360° spin - the world keeps moving
        this.isSpinningOut = true;
        this.spinOutTime = GameConfig.SPIN_OUT_DURATION;
        if (this.isPlayer) this.showExclamationEffect();

        this.scene.tweens.add({
            targets: this.carContainer,
            angle: 360,
            duration: GameConfig.SPIN_OUT_DURATION,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (this.carContainer) this.carContainer.setAngle(0);
            }
        });
    }

    blockVehicle(frontVehicle) {
        if (this.blockingVehicle === frontVehicle) return;
        this.isBlocked = true;
        this.currentSpeed = this.baseSpeed * GameConfig.VEHICLE_BLOCK_SPEED;
        this.blockingVehicle = frontVehicle;
    }

    clearVehicleBlock() {
        this.isBlocked = false;
        this.currentSpeed = this.baseSpeed;
        this.blockingVehicle = null;
    }

    receiveBoostFromCollision() {
        // Bigger reward when the collision was baited with the brake
        const wasBraking = this.isBraking();
        const boostMultiplier = wasBraking ? 1.8 : 1.4;
        const boostDuration = wasBraking ? 1400 : 1500;

        // hasCollisionBoost stops update() from overwriting this next frame
        this.hasCollisionBoost = true;
        const offroadFactor = this.isOffroad() ? GameConfig.OFFROAD_SLOWDOWN : 1;
        this.currentSpeed = this.baseSpeed * boostMultiplier * offroadFactor;

        if (this.isPlayer && this.scene.audioManager) {
            this.scene.audioManager.playSound('boost');
        }

        this.scene.time.delayedCall(boostDuration, () => {
            this.hasCollisionBoost = false;
            if (!this.isBoosting && !this.isBlocked) {
                this.currentSpeed = this.baseSpeed * (this.isOffroad() ? GameConfig.OFFROAD_SLOWDOWN : 1);
            }
        });

        this.showCollisionBoostEffect();
        this.showExclamationEffect();
    }

    receivePushSlowdown() {
        this.pushSlowdownTime = 1000;
    }

    activateBrake() {
        this.brakeTime = this.brakeDuration;
        this.showBrakeSmokeEffect();
        if (this.isPlayer && this.scene.audioManager) {
            this.scene.audioManager.playSound('brake');
        }
    }

    isBraking() {
        return this.brakeTime > 0;
    }

    // ---------------------------------------------------------------- update

    update(delta) {
        const dt = delta / 1000;

        // Lane change animation
        if (this.isChangingLanes) {
            this.laneChangeProgress += delta;
            const progress = this.laneChangeProgress / GameConfig.LANE_CHANGE_DURATION;

            if (progress >= 1) {
                this.extendedLane = this.targetExtendedLane;
                this.isChangingLanes = false;

                if (this.extendedLane >= 0 && this.extendedLane < GameConfig.LANE_COUNT) {
                    this.currentLane = this.extendedLane;
                    this.y = GameConfig.LANE_Y_POSITIONS[this.extendedLane];
                    this.setAlpha(1.0);
                } else {
                    this.currentLane = -1;
                    this.y = Vehicle.yForLane(this.extendedLane);
                    this.setAlpha(0.8);
                    this.rumbleSpeed = 8;
                }
            } else {
                const endY = Vehicle.yForLane(this.targetExtendedLane);
                this.y = Phaser.Math.Linear(this.laneChangeStartY, endY, progress);
            }
        }

        // Airborne physics with altitude-scaled shadow
        if (this.isAirborne) {
            this.verticalVelocity += GameConfig.GRAVITY * dt;
            this.carContainer.y += this.verticalVelocity * dt;

            const altitude = Math.max(0, -this.carContainer.y);
            const shadowScale = Math.max(0.55, 1 - altitude / 220);
            this.shadow.setScale(shadowScale, shadowScale);
            this.shadow.setAlpha(this.shadowAlpha * shadowScale);

            if (this.verticalVelocity > 0 && this.carContainer.y >= 0) {
                this.isAirborne = false;
                this.carContainer.y = 0;
                this.verticalVelocity = 0;
                this.shadow.setScale(1, 1);
                this.shadow.setAlpha(this.shadowAlpha);
            }
        }

        // Boost meter drain / regen
        if (this.isBoosting && this.boostMeter > 0 && !this.isBlocked) {
            this.boostMeter -= dt;
            if (this.boostMeter <= 0) {
                this.boostMeter = 0;
                this.isBoosting = false;
                this.hideBoostEffect();
                this.boostCooldown = true;
            }
        } else if (!this.isBoosting) {
            if (this.boostMeter < GameConfig.BOOST_MAX_SECONDS) {
                this.boostMeter += GameConfig.BOOST_REGEN_PER_SEC * dt * this.boostRegenScale;
                this.boostMeter = Math.min(this.boostMeter, GameConfig.BOOST_MAX_SECONDS);
            }
            if (this.boostMeter >= GameConfig.BOOST_MAX_SECONDS && this.boostCooldown) {
                this.boostCooldown = false;
            }
        }

        // Timed effects
        if (this.rampBoostTime > 0) {
            this.rampBoostTime = Math.max(0, this.rampBoostTime - delta);
        }
        if (this.strawberryBoostTime > 0) {
            this.strawberryBoostTime = Math.max(0, this.strawberryBoostTime - delta);
        }
        if (this.pushSlowdownTime > 0) {
            this.pushSlowdownTime = Math.max(0, this.pushSlowdownTime - delta);
        }
        if (this.brakeTime > 0) {
            this.brakeTime = Math.max(0, this.brakeTime - delta);
        }
        if (this.spinOutTime > 0) {
            this.spinOutTime -= delta;
            if (this.spinOutTime <= 0) {
                this.spinOutTime = 0;
                this.isSpinningOut = false;
            }
        }

        // Speed calculation: all boosts stack additively, then slowdowns apply
        if (!this.isBlocked && !this.hasCollisionBoost) {
            let speedMultiplier = 1.0;
            if (this.isBoosting && this.boostMeter > 0) {
                speedMultiplier += (GameConfig.BOOST_SPEED_MULTIPLIER - 1.0);
            }
            if (this.rampBoostTime > 0) speedMultiplier += 0.5;
            if (this.strawberryBoostTime > 0) speedMultiplier += 0.7;

            this.currentSpeed = this.baseSpeed * speedMultiplier
                * (this.isOffroad() ? GameConfig.OFFROAD_SLOWDOWN : 1);

            if (this.pushSlowdownTime > 0) this.currentSpeed *= this.pushSlowdownMultiplier;
            if (this.brakeTime > 0) this.currentSpeed *= this.brakeMultiplier;

            if (this.isSpinningOut) {
                const recovery = 1 - (this.spinOutTime / GameConfig.SPIN_OUT_DURATION);
                this.currentSpeed *= 0.15 + 0.35 * recovery;
            }

            this.applySpeedModifiers();
        }

        // Forget the last obstacle once it has scrolled past
        if (this.lastObstacleHit && (!this.lastObstacleHit.active || this.lastObstacleHit.x - this.x < -60)) {
            this.lastObstacleHit = null;
        }

        // Vehicle blocking: crawl until the front vehicle pulls away
        if (this.isBlocked && this.blockingVehicle) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.blockingVehicle.x, this.blockingVehicle.y);
            if (distance > 100 || (this.blockingVehicle.x - this.x) > 80) {
                this.clearVehicleBlock();
            } else {
                this.currentSpeed = this.baseSpeed * GameConfig.VEHICLE_BLOCK_SPEED;
            }
        }

        // Offroad rumble + dust
        if (this.isOffroad() && !this.isAirborne) {
            this.rumbleOffset += this.rumbleSpeed * dt;
            this.carContainer.y = Math.sin(this.rumbleOffset) * this.rumbleAmplitude;

            this.dustTimer += delta;
            if (this.dustTimer > this.dustInterval) {
                this.showDustEffect();
                this.dustTimer = 0;
            }

            this.onOffroadTick();
        } else if (!this.isAirborne) {
            this.carContainer.y = 0;
            this.rumbleOffset = 0;
            this.rumbleSpeed = 0;
        }

        // Progress + position tracking
        this.distanceTraveled += this.currentSpeed * dt;
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
    }

    // ----------------------------------------------------- collision queries

    getBoundingBox() {
        // Slightly larger box when braking to prevent pass-through
        const m = this.isBraking() ? 1.2 : 1.0;
        return {
            left: this.x - (this.collisionWidth * m) / 2,
            right: this.x + (this.collisionWidth * m) / 2,
            top: this.y - (this.collisionHeight * m) / 2,
            bottom: this.y + (this.collisionHeight * m) / 2
        };
    }

    getPredictedBoundingBox(deltaTime) {
        const velocityX = (this.x - this.lastPosition.x) / deltaTime * 1000;
        const velocityY = (this.y - this.lastPosition.y) / deltaTime * 1000;
        const predictedX = this.x + velocityX * deltaTime / 1000;
        const predictedY = this.y + velocityY * deltaTime / 1000;
        return {
            left: predictedX - this.collisionWidth / 2,
            right: predictedX + this.collisionWidth / 2,
            top: predictedY - this.collisionHeight / 2,
            bottom: predictedY + this.collisionHeight / 2
        };
    }

    getSweptBoundingBox() {
        const currentBox = this.getBoundingBox();
        const lastBox = {
            left: this.lastPosition.x - this.collisionWidth / 2,
            right: this.lastPosition.x + this.collisionWidth / 2,
            top: this.lastPosition.y - this.collisionHeight / 2,
            bottom: this.lastPosition.y + this.collisionHeight / 2
        };
        return {
            left: Math.min(currentBox.left, lastBox.left),
            right: Math.max(currentBox.right, lastBox.right),
            top: Math.min(currentBox.top, lastBox.top),
            bottom: Math.max(currentBox.bottom, lastBox.bottom)
        };
    }

    getVelocity() {
        return {
            x: this.x - this.lastPosition.x,
            y: this.y - this.lastPosition.y
        };
    }

    // --------------------------------------------------------------- effects

    showDustEffect() {
        // Kicked-up offroad debris matches the surface (dirt/sand/carpet lint)
        const lm = this.scene.levelManager;
        const dustColor = (lm && lm.currentTheme) ? lm.currentTheme.palette.dustColor : 0x654321;
        for (let i = 0; i < 2; i++) {
            const dust = this.scene.add.circle(
                this.x - 40 - (i * 15),
                this.y + Phaser.Math.Between(-8, 8),
                Phaser.Math.Between(3, 6),
                dustColor
            );
            dust.setAlpha(0.8);
            dust.setDepth(1);
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

    showBrakeSmokeEffect() {
        for (let i = 0; i < 4; i++) {
            const smoke = this.scene.add.circle(
                this.x - 20 - (i * 8),
                this.y + Phaser.Math.Between(-12, 12),
                Phaser.Math.Between(4, 8),
                0x555555
            );
            smoke.setAlpha(0.7);
            smoke.setDepth(2);
            this.scene.tweens.add({
                targets: smoke,
                x: smoke.x - 30,
                y: smoke.y - Phaser.Math.Between(20, 40),
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 600,
                onComplete: () => smoke.destroy()
            });
        }
    }

    showCollisionBoostEffect() {
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.circle(
                this.x - 20 - (i * 8),
                this.y + Phaser.Math.Between(-10, 10),
                Phaser.Math.Between(4, 8),
                0x00AAFF
            );
            particle.setAlpha(0.9);
            particle.setDepth(5);
            this.scene.tweens.add({
                targets: particle,
                x: particle.x - 40,
                y: particle.y + Phaser.Math.Between(-15, 15),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }

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
        const exclamation = this.scene.add.text(this.x, this.y - 40, '!', {
            fontSize: this.isPlayer ? '24px' : '20px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });
        exclamation.setOrigin(0.5);
        exclamation.setDepth(10);

        this.scene.tweens.add({
            targets: exclamation,
            y: exclamation.y - 30,
            alpha: { from: 1, to: 0 },
            scaleX: { from: 1, to: 1.5 },
            scaleY: { from: 1, to: 1.5 },
            duration: 1000,
            ease: 'Power2',
            onComplete: () => exclamation.destroy()
        });
    }

    // ----------------------------------------------------------------- hooks

    // Approve/veto a lane change before it starts (e.g. obstacle checks)
    approveLaneChange(newExtendedLane) {
        return true;
    }

    // Extra per-frame speed adjustments (e.g. AI rubber-banding)
    applySpeedModifiers() {}

    // Called every frame while offroad (e.g. AI return-to-road failsafe)
    onOffroadTick() {}
}
