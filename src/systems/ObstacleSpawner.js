class ObstacleSpawner {
    constructor(scene, levelTheme) {
        this.scene = scene;
        this.levelTheme = levelTheme;
        this.obstacles = [];
        this.ramps = [];
        this.strawberries = [];

        this.lastObstacleSpawn = 0;
        this.lastRampSpawn = 0;
        this.lastStrawberrySpawn = 0;
        this.nextObstacleTime = Phaser.Math.Between(GameConfig.SPAWN.OBSTACLE_FREQ_MIN, GameConfig.SPAWN.OBSTACLE_FREQ_MAX);
        this.nextRampTime = Phaser.Math.Between(GameConfig.SPAWN.RAMP_FREQ_MIN, GameConfig.SPAWN.RAMP_FREQ_MAX);
        this.nextStrawberryTime = Phaser.Math.Between(3000, 6000); // Spawn strawberries every 3-6 seconds
        
        this.spawnX = GameConfig.VIEWPORT.WIDTH + 100;
    }
    
    update(time, delta, scrollSpeed) {
        // Update spawn timers
        this.lastObstacleSpawn += delta;
        this.lastRampSpawn += delta;
        this.lastStrawberrySpawn += delta;
        
        // Spawn obstacles
        if (this.lastObstacleSpawn > this.nextObstacleTime) {
            this.spawnObstacle();
            this.lastObstacleSpawn = 0;
            this.nextObstacleTime = Phaser.Math.Between(
                GameConfig.SPAWN.OBSTACLE_FREQ_MIN, 
                GameConfig.SPAWN.OBSTACLE_FREQ_MAX
            );
        }
        
        // Spawn ramps
        if (this.lastRampSpawn > this.nextRampTime) {
            this.spawnRamp();
            this.lastRampSpawn = 0;
            this.nextRampTime = Phaser.Math.Between(
                GameConfig.SPAWN.RAMP_FREQ_MIN,
                GameConfig.SPAWN.RAMP_FREQ_MAX
            );
        }

        // Spawn strawberries
        if (this.lastStrawberrySpawn > this.nextStrawberryTime) {
            this.spawnStrawberry();
            this.lastStrawberrySpawn = 0;
            this.nextStrawberryTime = Phaser.Math.Between(3000, 6000); // Every 3-6 seconds
        }
        
        // Update all obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.isActive) {
                obstacle.update(scrollSpeed);
                return true;
            }
            return false;
        });
        
        // Update all ramps
        this.ramps = this.ramps.filter(ramp => {
            if (ramp.isActive) {
                ramp.update(scrollSpeed);
                return true;
            }
            return false;
        });

        // Update all strawberries (power-ups, not obstacles)
        this.strawberries = this.strawberries.filter(strawberry => {
            if (!strawberry.collected) {
                strawberry.update(scrollSpeed);
                return strawberry.x > -400; // Remove when completely off screen (same as obstacles)
            }
            return false; // Remove if collected
        });
    }
    
    spawnObstacle() {
        const lane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        const y = GameConfig.LANE_Y_POSITIONS[lane];
        
        // Check if lane is clear (including strawberries)
        if (this.isLaneClearIncludingStrawberries(lane)) {
            const obstacleType = Phaser.Math.RND.pick(this.levelTheme.obstacles);
            const obstacle = new Obstacle(this.scene, this.spawnX, y, obstacleType, lane);
            this.obstacles.push(obstacle);
        }
    }
    
    spawnRamp() {
        const lane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        const y = GameConfig.LANE_Y_POSITIONS[lane];
        
        // Check if lane is clear (including strawberries)
        if (this.isLaneClearIncludingStrawberries(lane)) {
            const ramp = new Ramp(this.scene, this.spawnX, y, lane);
            this.ramps.push(ramp);
            console.log('Ramp spawned at lane', lane, 'position', this.spawnX, y);
        }
    }
    
    isLaneClear(lane) {
        const y = GameConfig.LANE_Y_POSITIONS[lane];

        // Check obstacles
        for (let obstacle of this.obstacles) {
            if (Math.abs(obstacle.y - y) < 20 && obstacle.x > this.spawnX - GameConfig.SPAWN.MIN_GAP) {
                return false;
            }
        }

        // Check ramps
        for (let ramp of this.ramps) {
            if (Math.abs(ramp.y - y) < 20 && ramp.x > this.spawnX - GameConfig.SPAWN.MIN_GAP) {
                return false;
            }
        }

        return true;
    }

    isLaneClearIncludingStrawberries(lane) {
        const y = GameConfig.LANE_Y_POSITIONS[lane];

        // Check obstacles
        for (let obstacle of this.obstacles) {
            if (Math.abs(obstacle.y - y) < 20 && obstacle.x > this.spawnX - GameConfig.SPAWN.MIN_GAP) {
                return false;
            }
        }

        // Check ramps
        for (let ramp of this.ramps) {
            if (Math.abs(ramp.y - y) < 20 && ramp.x > this.spawnX - GameConfig.SPAWN.MIN_GAP) {
                return false;
            }
        }

        // Check strawberries
        for (let strawberry of this.strawberries) {
            if (Math.abs(strawberry.y - y) < 20 && strawberry.x > this.spawnX - GameConfig.SPAWN.MIN_GAP) {
                return false;
            }
        }

        return true;
    }
    
    checkCollision(vehicle) {
        const vehicleX = vehicle.x;
        const vehicleY = vehicle.y;
        const collisionRange = 40;
        
        // Check obstacle collisions
        for (let obstacle of this.obstacles) {
            if (Math.abs(obstacle.x - vehicleX) < collisionRange && 
                Math.abs(obstacle.y - vehicleY) < 30) {
                // Store reference to blocking obstacle
                if (vehicle.hitObstacle) {
                    vehicle.blockingObstacle = obstacle;
                }
                return { type: 'obstacle', object: obstacle };
            }
        }
        
        // Check ramp collisions
        for (let ramp of this.ramps) {
            if (Math.abs(ramp.x - vehicleX) < collisionRange && 
                Math.abs(ramp.y - vehicleY) < 30) {
                // Check if this specific vehicle has already hit this ramp
                if (!ramp.hitVehicles) {
                    ramp.hitVehicles = new Set();
                }
                if (!ramp.hitVehicles.has(vehicle)) {
                    console.log('Ramp collision detected!', ramp.x, vehicleX, ramp.y, vehicleY);
                    ramp.onHit();
                    ramp.hitVehicles.add(vehicle);
                    return { type: 'ramp', object: ramp };
                }
            }
        }
        
        return null;
    }
    
    isLaneClearForVehicle(lane, startX, endX) {
        const laneY = GameConfig.LANE_Y_POSITIONS[lane];
        
        // Check obstacles in the lane change path
        for (let obstacle of this.obstacles) {
            if (Math.abs(obstacle.y - laneY) < 30 && 
                obstacle.x >= startX - 50 && obstacle.x <= endX + 50) {
                return false;
            }
        }
        
        // Check ramps in the lane change path
        for (let ramp of this.ramps) {
            if (Math.abs(ramp.y - laneY) < 30 && 
                ramp.x >= startX - 50 && ramp.x <= endX + 50) {
                return false;
            }
        }
        
        return true;
    }
    
    reset() {
        // Clear all obstacles and ramps
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.ramps.forEach(ramp => ramp.destroy());
        this.obstacles = [];
        this.ramps = [];
        
        // Reset spawn timers
        this.lastObstacleSpawn = 0;
        this.lastRampSpawn = 0;
    }
    
    spawnStrawberry() {
        const lane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        const y = GameConfig.LANE_Y_POSITIONS[lane];

        // Check if lane is clear before spawning strawberry
        if (this.isLaneClearIncludingStrawberries(lane)) {
            const strawberry = new Strawberry(this.scene, this.spawnX, y);
            this.strawberries.push(strawberry);
            console.log('Strawberry spawned at lane', lane, 'position', this.spawnX, y);
        } else {
            console.log('Strawberry spawn blocked - lane', lane, 'not clear');
        }
    }

    checkStrawberryCollision(vehicle) {
        const vehicleX = vehicle.x;
        const vehicleY = vehicle.y;
        const collisionRange = 30; // Smaller range for power-ups

        for (let strawberry of this.strawberries) {
            if (!strawberry.collected &&
                Math.abs(strawberry.x - vehicleX) < collisionRange &&
                Math.abs(strawberry.y - vehicleY) < 40) {
                return strawberry;
            }
        }
        return null;
    }

    destroy() {
        this.reset();
    }
}