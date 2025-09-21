class Ramp extends Phaser.GameObjects.Container {
    constructor(scene, x, y, lane) {
        super(scene, x, y);
        
        this.scene = scene;
        this.lane = lane;
        this.isActive = true;
        this.hasBeenHit = false;
        
        this.createRamp();
        scene.add.existing(this);
    }
    
    createRamp() {
        // Create ramp shape
        const rampBase = this.scene.add.polygon(0, 10, [
            -30, 10,
            30, 10,
            25, -10,
            -25, -10
        ], 0xFFD700);
        
        // Add stripes for visibility
        const stripe1 = this.scene.add.rectangle(-10, 0, 8, 20, 0x333333);
        stripe1.setAngle(-15);
        const stripe2 = this.scene.add.rectangle(10, 0, 8, 20, 0x333333);
        stripe2.setAngle(-15);
        
        // Add arrow indicator
        const arrow = this.scene.add.triangle(0, -5, -8, 8, 8, 8, 0, -8, 0xFFFFFF);
        arrow.setAlpha(0.8);
        
        this.add([rampBase, stripe1, stripe2, arrow]);
        
        // Add pulsing animation to arrow
        this.scene.tweens.add({
            targets: arrow,
            alpha: { from: 0.4, to: 1 },
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        this.setSize(60, 20);
    }
    
    onHit() {
        if (!this.hasBeenHit) {
            this.hasBeenHit = true;
            
            // Visual feedback
            this.scene.tweens.add({
                targets: this,
                scaleY: 0.8,
                duration: 100,
                yoyo: true
            });
        }
    }
    
    update(scrollSpeed) {
        this.x -= scrollSpeed; // Move at same speed as all other elements
        
        // Deactivate if off screen (give much more buffer to avoid early disappearing)
        if (this.x < -400) {
            this.isActive = false;
            this.destroy();
        }
    }
}