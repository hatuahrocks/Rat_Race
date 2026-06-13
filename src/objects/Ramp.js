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
        // Ground shadow
        const shadow = this.scene.add.ellipse(2, 13, 64, 10, 0x000000);
        shadow.setAlpha(0.2);

        // Wedge rising to the right (direction of travel), drawn with shading
        const g = this.scene.add.graphics();

        // Side face (darker, gives the wedge thickness)
        g.fillStyle(0xB8860B, 1);
        g.fillTriangle(-30, 12, 30, 12, 30, -10);
        g.fillRect(24, -10, 6, 22);

        // Top surface (bright)
        g.fillStyle(0xFFC107, 1);
        g.beginPath();
        g.moveTo(-30, 10);
        g.lineTo(26, -10);
        g.lineTo(30, -8);
        g.lineTo(30, 12);
        g.lineTo(-30, 12);
        g.closePath();
        g.fillPath();

        // Incline edge highlight
        g.lineStyle(2.5, 0xFFE082, 1);
        g.lineBetween(-30, 10, 27, -9);

        // Hazard stripes along the base
        g.fillStyle(0x333333, 0.85);
        [-22, -6, 10].forEach(sx => {
            g.beginPath();
            g.moveTo(sx, 12);
            g.lineTo(sx + 6, 12);
            g.lineTo(sx + 12, 4 - (sx + 12 + 30) * 0.18);
            g.lineTo(sx + 6, 4 - (sx + 6 + 30) * 0.18);
            g.closePath();
            g.fillPath();
        });

        // White chevrons pointing in the direction of travel
        const chevrons = this.scene.add.graphics();
        chevrons.lineStyle(3.5, 0xFFFFFF, 1);
        [0, 11].forEach(cx => {
            chevrons.beginPath();
            chevrons.moveTo(cx - 4, -1);
            chevrons.lineTo(cx + 2, 4);
            chevrons.lineTo(cx - 4, 9);
            chevrons.strokePath();
        });
        chevrons.setAlpha(0.9);

        this.add([shadow, g, chevrons]);

        // Pulse the chevrons for visibility
        this.scene.tweens.add({
            targets: chevrons,
            alpha: { from: 0.4, to: 1 },
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.setSize(60, 20);
    }
    
    onHit() {
        if (!this.hasBeenHit && this.scene && this.scene.tweens) {
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