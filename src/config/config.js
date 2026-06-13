const GameConfig = {
    VERSION: '1.12.2', // Per-track music volume: menu louder (0.6), race quiet (0.25)
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
    SPIN_OUT_DURATION: 1100, // ms of spin-out after hitting an obstacle (heavy slow, no full stop)
    VEHICLE_BLOCK_SPEED: 0.25, // speed multiplier while stuck behind another vehicle
    RACE_DISTANCE: 10000, // Back to original - progress bar reaches 100% when finish line appears
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
        COUNT: 3, // fallback when no difficulty is selected
        MIN_SPEED_MULT: 0.85,
        MAX_SPEED_MULT: 1.1,
        LANE_CHANGE_FREQ: 2000,
        BOOST_FREQ: 4000
    },

    // Difficulty settings chosen on the track-select screen
    DIFFICULTY: {
        easy:   { label: 'EASY',   aiCount: 3, aiSkill: 0.35, speedRange: [0.80, 1.00] },
        medium: { label: 'MEDIUM', aiCount: 4, aiSkill: 0.55, speedRange: [0.85, 1.10] },
        hard:   { label: 'HARD',   aiCount: 5, aiSkill: 0.80, speedRange: [0.95, 1.20] }
    },
    
    SPAWN: {
        OBSTACLE_FREQ_MIN: 1500,
        OBSTACLE_FREQ_MAX: 3000,
        RAMP_FREQ_MIN: 2000, // Increased frequency for testing
        RAMP_FREQ_MAX: 3500,
        MIN_GAP: 300
    }
};