const GameConfig = {
    LANE_COUNT: 4,
    LANE_Y_POSITIONS: [-120, -40, 40, 120],
    BASE_FORWARD_SPEED: 200,
    BOOST_SPEED_MULTIPLIER: 1.6,
    BOOST_MAX_SECONDS: 3,
    BOOST_REGEN_PER_SEC: 0.5,
    AIR_IMPULSE: -420,
    GRAVITY: 1600,
    OBSTACLE_SLOW_AMOUNT: 0.5,
    OBSTACLE_SLOW_DURATION: 1200,
    RACE_DISTANCE: 10000,
    SWIPE_THRESHOLD: 30,
    LANE_CHANGE_DURATION: 200,
    
    VIEWPORT: {
        WIDTH: 1024,
        HEIGHT: 768
    },
    
    COLORS: {
        SKY: 0x87CEEB,
        GROUND: 0x8B7355,
        ROAD: 0x4A4A4A
    },
    
    Z_LAYERS: {
        BACKGROUND: 0,
        ROAD: 1,
        OBSTACLES: 2,
        RAMPS: 3,
        VEHICLES: 4,
        EFFECTS: 5,
        UI: 6
    },
    
    AI: {
        COUNT: 3,
        MIN_SPEED_MULT: 0.85,
        MAX_SPEED_MULT: 1.1,
        LANE_CHANGE_FREQ: 2000,
        BOOST_FREQ: 4000
    },
    
    SPAWN: {
        OBSTACLE_FREQ_MIN: 1500,
        OBSTACLE_FREQ_MAX: 3000,
        RAMP_FREQ_MIN: 4000,
        RAMP_FREQ_MAX: 6000,
        MIN_GAP: 300
    }
};