// AI opponent. Racing mechanics live in Vehicle; this class adds the AI
// brain (decision making), a lane-change cooldown, rubber-banding to keep
// races close, and the offroad return-to-road failsafe.
class AIVehicle extends Vehicle {
    constructor(scene, x, y, character, difficulty = 0.5, carColor = null) {
        super(scene, x, y, character, {
            isPlayer: false,
            colors: carColor || { color: 0x666666, accent: 0x777777 },
            carScale: 0.96,
            ratScale: 0.75,
            shadowWidth: 54,
            shadowHeight: 11,
            shadowAlpha: 0.22,
            rumbleAmplitude: 4,
            dustInterval: 250,
            boostRegenScale: 0.8, // AI regenerates boost slower than the player
            boostParticleCount: 2,
            boostParticleColor: 0xFFAA00,
            baseSpeed: GameConfig.BASE_FORWARD_SPEED *
                Phaser.Math.FloatBetween(GameConfig.AI.MIN_SPEED_MULT, GameConfig.AI.MAX_SPEED_MULT)
        });

        this.difficulty = difficulty; // 0-1, affects speed and decision making
        this.carColor = carColor;     // read by GameScene for progress markers

        // AI behavior timers
        this.laneChangeTimer = 0;
        this.nextLaneChange = Phaser.Math.Between(1000, GameConfig.AI.LANE_CHANGE_FREQ);
        this.lastLaneChangeTime = 0;
        this.offroadStartTime = 0;
    }

    // ------------------------------------------------------------------ brain

    makeDecision(playerX, obstacles) {
        const decisionThreshold = 0.3 + (this.difficulty * 0.5);

        const dangerAhead = this.checkForDanger(obstacles);
        const rampAhead = this.checkForRamps();
        const strawberryAhead = this.checkForStrawberries();

        if (dangerAhead && Math.random() < decisionThreshold) {
            // Try to change lanes to avoid danger
            const possibleLanes = [];
            if (this.currentLane > 0) possibleLanes.push(-1);
            if (this.currentLane < GameConfig.LANE_COUNT - 1) possibleLanes.push(1);
            if (possibleLanes.length > 0) {
                this.changeLane(Phaser.Math.RND.pick(possibleLanes));
            }
        } else if (strawberryAhead && Math.random() < 0.4) {
            const direction = this.getStrawberryDirection();
            if (direction !== 0 && this.canChangeLaneInDirection(direction)) {
                this.changeLane(direction);
            }
        } else if (rampAhead && Math.random() < 0.3) {
            const direction = this.getRampDirection();
            if (direction !== 0 && this.canChangeLaneInDirection(direction)) {
                this.changeLane(direction);
            }
        }

        // Boost decision - AI uses the full-meter boost like the player
        if (this.boostMeter >= GameConfig.BOOST_MAX_SECONDS && !this.boostCooldown && Math.random() < (this.difficulty * 0.1)) {
            this.useFullBoost();
        }
    }

    checkForDanger(obstacles) {
        for (let obstacle of obstacles) {
            const relativeX = obstacle.x - this.x;
            const relativeY = Math.abs(obstacle.y - this.y);
            if (relativeX > 0 && relativeX < 200 && relativeY < 30) {
                return true;
            }
        }
        return false;
    }

    checkForRamps() {
        const ramps = this.scene.obstacleSpawner && this.scene.obstacleSpawner.ramps;
        if (!ramps) return false;
        return ramps.some(ramp => {
            const distanceAhead = ramp.x - this.x;
            return distanceAhead > 0 && distanceAhead < 200;
        });
    }

    getRampDirection() {
        const ramps = this.scene.obstacleSpawner && this.scene.obstacleSpawner.ramps;
        return this.directionToClosest(ramps, 200);
    }

    checkForStrawberries() {
        const strawberries = this.scene.obstacleSpawner && this.scene.obstacleSpawner.strawberries;
        if (!strawberries) return false;
        return strawberries.some(s => {
            const distanceAhead = s.x - this.x;
            return !s.collected && distanceAhead > 0 && distanceAhead < 250;
        });
    }

    getStrawberryDirection() {
        const strawberries = this.scene.obstacleSpawner && this.scene.obstacleSpawner.strawberries;
        const candidates = strawberries ? strawberries.filter(s => !s.collected) : null;
        return this.directionToClosest(candidates, 250);
    }

    // Shared "steer toward the closest target ahead" logic for ramps/strawberries
    directionToClosest(targets, range) {
        if (!targets) return 0;

        let closest = null;
        let closestDistance = Infinity;
        for (let target of targets) {
            const distanceAhead = target.x - this.x;
            if (distanceAhead > 0 && distanceAhead < range) {
                const totalDistance = distanceAhead + Math.abs(target.y - this.y);
                if (totalDistance < closestDistance) {
                    closestDistance = totalDistance;
                    closest = target;
                }
            }
        }

        if (closest && Math.abs(closest.y - this.y) > 40) {
            return closest.y > this.y ? 1 : -1;
        }
        return 0;
    }

    canChangeLaneInDirection(direction) {
        const targetLane = this.currentLane + direction;
        return targetLane >= 0 && targetLane < GameConfig.LANE_COUNT && !this.isChangingLanes;
    }

    // -------------------------------------------------------------- overrides

    changeLane(direction) {
        // AI never interrupts an in-flight change, and has a 500ms cooldown
        if (this.isChangingLanes) return false;
        const now = this.scene.time.now;
        if (now - this.lastLaneChangeTime < 500) return false;

        const changed = super.changeLane(direction);
        if (changed) {
            this.lastLaneChangeTime = now;
        }
        return changed;
    }

    update(delta) {
        // Periodic random lane changes (in addition to makeDecision)
        this.laneChangeTimer += delta;
        if (this.laneChangeTimer > this.nextLaneChange) {
            this.laneChangeTimer = 0;
            this.nextLaneChange = Phaser.Math.Between(1000, GameConfig.AI.LANE_CHANGE_FREQ);
            if (Math.random() < 0.3 && !this.isChangingLanes) {
                this.changeLane(Phaser.Math.RND.sign());
            }
        }

        super.update(delta);
    }

    // Rubber-banding: keep the race close and rivals on screen.
    // Far ahead of the player -> ease off; far behind -> push to catch up.
    applySpeedModifiers() {
        const player = this.scene.player;
        if (!player) return;

        const gap = this.x - player.x;
        if (gap > 320) {
            this.currentSpeed *= Math.max(0.7, 1 - (gap - 320) / 1500);
        } else if (gap < -220) {
            this.currentSpeed *= Math.min(1.45, 1 + (-gap - 220) / 700);
        }
    }

    // Failsafe: never let the AI grind along offroad for more than 1 second
    onOffroadTick() {
        const now = this.scene.time.now;
        if (this.offroadStartTime === 0) {
            this.offroadStartTime = now; // arm on any offroad entry (push or own lane change)
        }
        if (now - this.offroadStartTime > 1000) {
            this.returnToRoad();
        }
    }

    goOffroad(type) {
        super.goOffroad(type);
        this.offroadStartTime = this.scene.time.now;

        // AI tries to get back on the road almost immediately
        this.scene.time.delayedCall(Phaser.Math.Between(100, 400), () => {
            this.returnToRoad();
        });
    }

    returnToRoad() {
        if (!this.isOffroad()) return;

        const targetLane = this.extendedLane === -1 ? 0 : GameConfig.LANE_COUNT - 1;
        this.isChangingLanes = false; // cancel any in-flight animation
        this.extendedLane = targetLane;
        this.currentLane = targetLane;
        this.targetLane = targetLane;
        this.y = GameConfig.LANE_Y_POSITIONS[targetLane];

        this.setAlpha(1.0);
        this.rumbleSpeed = 0;
        this.offroadStartTime = 0;
    }
}
