class Strawberry extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;
        this.floatOffset = 0;
        this.collected = false;

        this.createStrawberry();
        scene.add.existing(this);
    }

    createStrawberry() {
        // Shadow (on ground)
        this.shadow = this.scene.add.ellipse(0, 25, 30, 12, 0x000000);
        this.shadow.setAlpha(0.3);

        // Strawberry container (will float up and down)
        this.strawberryContainer = this.scene.add.container(0, 0);

        // Strawberry body (main red part)
        const body = this.scene.add.ellipse(0, 0, 25, 30, 0xFF4444);

        // Strawberry seeds (small yellow dots)
        const seed1 = this.scene.add.circle(-6, -3, 1.5, 0xFFDD44);
        const seed2 = this.scene.add.circle(4, -6, 1.5, 0xFFDD44);
        const seed3 = this.scene.add.circle(-2, 4, 1.5, 0xFFDD44);
        const seed4 = this.scene.add.circle(6, 2, 1.5, 0xFFDD44);
        const seed5 = this.scene.add.circle(-7, 6, 1.5, 0xFFDD44);
        const seed6 = this.scene.add.circle(2, 8, 1.5, 0xFFDD44);

        // Strawberry leaves (green top)
        const leaf1 = this.scene.add.triangle(0, -18, -8, 0, 0, -10, 8, 0, 0x44AA44);
        const leaf2 = this.scene.add.triangle(-3, -20, -6, 0, 0, -8, 3, 0, 0x44AA44);
        const leaf3 = this.scene.add.triangle(3, -20, -3, 0, 0, -8, 6, 0, 0x44AA44);

        // Add all parts to the floating container
        this.strawberryContainer.add([
            body, seed1, seed2, seed3, seed4, seed5, seed6,
            leaf1, leaf2, leaf3
        ]);

        // Add shadow and strawberry to main container
        this.add([this.shadow, this.strawberryContainer]);

        // Set up floating animation
        this.floatTween = this.scene.tweens.add({
            targets: this.strawberryContainer,
            y: -15, // Float 15px above base position
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add sparkle effect
        this.createSparkle();
    }

    createSparkle() {
        // Create a subtle sparkle effect around the strawberry
        for (let i = 0; i < 3; i++) {
            const sparkle = this.scene.add.star(
                Phaser.Math.Between(-20, 20),
                Phaser.Math.Between(-25, 5),
                4, 2, 6,
                0xFFFFFF
            );
            sparkle.setAlpha(0);

            this.strawberryContainer.add(sparkle);

            this.scene.tweens.add({
                targets: sparkle,
                alpha: { from: 0, to: 0.8 },
                scaleX: { from: 0, to: 1 },
                scaleY: { from: 0, to: 1 },
                duration: 800,
                delay: i * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    collect() {
        if (this.collected) return;

        this.collected = true;

        // Stop floating animation
        if (this.floatTween) {
            this.floatTween.destroy();
        }

        // Play collection effect
        this.scene.tweens.add({
            targets: this.strawberryContainer,
            scaleX: { from: 1, to: 1.5 },
            scaleY: { from: 1, to: 1.5 },
            alpha: { from: 1, to: 0 },
            y: this.strawberryContainer.y - 30,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });

        // Hide shadow immediately
        this.shadow.setVisible(false);

        console.log('Strawberry collected!');
    }

    update(scrollSpeed) {
        // Move strawberry with the world scroll
        this.x -= scrollSpeed;

        // Remove if off screen
        if (this.x < -100) {
            this.destroy();
        }
    }

    destroy() {
        if (this.floatTween) {
            this.floatTween.destroy();
        }
        super.destroy();
    }
}