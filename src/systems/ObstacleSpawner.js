class ObstacleSpawner {
    constructor(scene, levelTheme) {
        this.scene = scene;
        this.levelTheme = levelTheme;
        this.obstacles = [];
        this.ramps = [];
        
        this.lastObstacleSpawn = 0;
        this.lastRampSpawn = 0;
        this.nextObstacleTime = Phaser.Math.Between(GameConfig.SPAWN.OBSTACLE_FREQ_MIN, GameConfig.SPAWN.OBSTACLE_FREQ_MAX);
        this.nextRampTime = Phaser.Math.Between(GameConfig.SPAWN.RAMP_FREQ_MIN, GameConfig.SPAWN.RAMP_FREQ_MAX);
        
        this.spawnX = GameConfig.VIEWPORT.WIDTH + 100;
    }
    
    update(time, delta, scrollSpeed) {
        // Update spawn timers
        this.lastObstacleSpawn += delta;
        this.lastRampSpawn += delta;
        
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
    }
    
    spawnObstacle() {
        const lane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        const y = GameConfig.LANE_Y_POSITIONS[lane];
        
        // Check if lane is clear
        if (this.isLaneClear(lane)) {
            const obstacleType = Phaser.Math.RND.pick(this.levelTheme.obstacles);
            const obstacle = new Obstacle(this.scene, this.spawnX, y, obstacleType, lane);
            this.obstacles.push(obstacle);
        }
    }
    
    spawnRamp() {
        const lane = Phaser.Math.Between(0, GameConfig.LANE_COUNT - 1);
        const y = GameConfig.LANE_Y_POSITIONS[lane];
        
        // Check if lane is clear
        if (this.isLaneClear(lane)) {
            const ramp = new Ramp(this.scene, this.spawnX, y, lane);
            this.ramps.push(ramp);
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
    
    checkCollision(vehicle) {
        const vehicleX = vehicle.x;
        const vehicleY = vehicle.y;
        const collisionRange = 40;
        
        // Check obstacle collisions
        for (let obstacle of this.obstacles) {
            if (Math.abs(obstacle.x - vehicleX) < collisionRange && 
                Math.abs(obstacle.y - vehicleY) < 30) {
                return { type: 'obstacle', object: obstacle };
            }
        }
        
        // Check ramp collisions
        for (let ramp of this.ramps) {
            if (Math.abs(ramp.x - vehicleX) < collisionRange && 
                Math.abs(ramp.y - vehicleY) < 30) {
                if (!ramp.hasBeenHit) {
                    ramp.onHit();
                    return { type: 'ramp', object: ramp };
                }
            }
        }
        
        return null;
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
    
    destroy() {
        this.reset();
    }
}