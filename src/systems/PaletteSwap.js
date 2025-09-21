class PaletteSwap {
    constructor(scene) {
        this.scene = scene;
    }
    
    createColoredSprite(baseTexture, primaryColor, secondaryColor) {
        // Create a new render texture
        const rt = this.scene.add.renderTexture(0, 0, 64, 64);
        rt.setVisible(false);
        
        // Draw the base sprite
        rt.draw(baseTexture, 32, 32);
        
        // Apply color tinting
        // This is a simplified version - in production you'd use shaders or canvas manipulation
        return rt;
    }
    
    tintSVG(svgElement, primaryColor, secondaryColor) {
        if (!svgElement) return;
        
        // Find and color primary elements
        const primaryElements = svgElement.querySelectorAll('.primary-color');
        primaryElements.forEach(el => {
            el.style.fill = primaryColor;
        });
        
        // Find and color secondary elements
        const secondaryElements = svgElement.querySelectorAll('.secondary-color');
        secondaryElements.forEach(el => {
            el.style.fill = secondaryColor;
        });
    }
    
    hexToNumber(hex) {
        return parseInt(hex.replace('#', '0x'));
    }
    
    applyTint(sprite, color) {
        if (sprite && color) {
            sprite.setTint(this.hexToNumber(color));
        }
    }
    
    createRatSprite(character) {
        const container = this.scene.add.container(0, 0);
        
        // Create base rat shape (placeholder)
        const body = this.scene.add.ellipse(0, 0, 30, 40, this.hexToNumber(character.primaryColor));
        const face = this.scene.add.ellipse(0, -10, 25, 25, this.hexToNumber(character.secondaryColor));
        const earLeft = this.scene.add.circle(-10, -25, 8, this.hexToNumber(character.primaryColor));
        const earRight = this.scene.add.circle(10, -25, 8, this.hexToNumber(character.primaryColor));
        
        container.add([body, face, earLeft, earRight]);
        
        // Add patches if needed
        if (character.hasPatches) {
            const patches = this.scene.patchesManager.createPatches(container);
            container.add(patches);
        }
        
        return container;
    }
}