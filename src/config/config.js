const GameConfig = {
    VERSION: '1.0.7', // Increment this for each update
    LANE_COUNT: 4,
    LANE_Y_POSITIONS: [264, 344, 424, 504], // Positioned on the road (road center at 384)
    OFFROAD_HIGH_Y: 184, // Above top lane
    OFFROAD_LOW_Y: 584,  // Below bottom lane
    OFFROAD_SLOWDOWN: 0.75, // 25% slowdown (multiply speed by 0.75)
    // Extended lane system (0-5): -1=high offroad, 0-3=road lanes, 4=low offroad
    EXTENDED_LANE_POSITIONS: [184, 264, 344, 424, 504, 584], // All 6 positions
    BASE_FORWARD_SPEED: 312, // Increased by 56% total (200 * 1.56 = 30% more than previous 240)
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
        RAMP_FREQ_MIN: 2000, // Increased frequency for testing
        RAMP_FREQ_MAX: 3500,
        MIN_GAP: 300
    }
};