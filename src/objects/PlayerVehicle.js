// The player's vehicle. All racing mechanics live in Vehicle; this class
// only adds what is player-specific: the selected color and the rule that
// voluntary lane changes onto a road lane must be clear of obstacles.
class PlayerVehicle extends Vehicle {
    constructor(scene, x, y, character) {
        const selectedCarColor = scene.registry.get('selectedCarColor') || { color: 0x333333, accent: 0x444444 };

        super(scene, x, y, character, {
            isPlayer: true,
            colors: selectedCarColor,
            ratScale: 0.8
        });
    }

    // Voluntary changes onto a road lane are vetoed if the lane is occupied
    // (unless blocked behind a vehicle, where swerving out must stay possible)
    approveLaneChange(newExtendedLane) {
        const isRoadLane = newExtendedLane >= 0 && newExtendedLane < GameConfig.LANE_COUNT;
        if (isRoadLane && !this.isBlocked && this.scene.obstacleSpawner) {
            return this.scene.obstacleSpawner.isLaneClearForVehicle(newExtendedLane, this.x, this.x + 100);
        }
        return true;
    }
}
