class PatchesManager {
    constructor(scene) {
        this.scene = scene;
        this.patchVariants = ['small', 'medium', 'large'];
    }
    
    createPatches(parentContainer) {
        const patchContainer = this.scene.add.container(0, 0);
        const numPatches = Phaser.Math.Between(2, 4);
        
        for (let i = 0; i < numPatches; i++) {
            const patch = this.createRandomPatch();
            patchContainer.add(patch);
        }
        
        return patchContainer;
    }
    
    createRandomPatch() {
        const variant = Phaser.Math.RND.pick(this.patchVariants);
        let patch;
        
        switch(variant) {
            case 'small':
                patch = this.scene.add.circle(
                    Phaser.Math.Between(-10, 10),
                    Phaser.Math.Between(-15, 15),
                    Phaser.Math.Between(3, 5),
                    0xFFFFFF
                );
                break;
            case 'medium':
                patch = this.scene.add.ellipse(
                    Phaser.Math.Between(-12, 12),
                    Phaser.Math.Between(-18, 18),
                    Phaser.Math.Between(8, 12),
                    Phaser.Math.Between(6, 10),
                    0xFFFFFF
                );
                patch.setRotation(Phaser.Math.Between(0, Math.PI));
                break;
            case 'large':
                patch = this.scene.add.ellipse(
                    Phaser.Math.Between(-8, 8),
                    Phaser.Math.Between(-10, 10),
                    Phaser.Math.Between(12, 18),
                    Phaser.Math.Between(8, 14),
                    0xFFFFFF
                );
                patch.setRotation(Phaser.Math.Between(0, Math.PI));
                break;
        }
        
        patch.setAlpha(0.95);
        return patch;
    }
    
    createStaticPatches(x, y, count = 3) {
        const patches = [];
        const positions = [
            { x: -8, y: -5 },
            { x: 6, y: -8 },
            { x: -4, y: 7 },
            { x: 8, y: 4 },
            { x: -10, y: 0 }
        ];
        
        for (let i = 0; i < Math.min(count, positions.length); i++) {
            const pos = positions[i];
            const size = Phaser.Math.Between(4, 8);
            const patch = this.scene.add.circle(
                x + pos.x,
                y + pos.y,
                size,
                0xFFFFFF
            );
            patch.setAlpha(0.9);
            patches.push(patch);
        }
        
        return patches;
    }
}