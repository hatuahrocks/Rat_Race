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
        
        // Body (scaled for in-game use)
        const body = this.scene.add.ellipse(0, 0, 30, 40, this.hexToNumber(character.primaryColor));
        
        // Belly/face area
        const belly = this.scene.add.ellipse(0, 3, 22, 30, this.hexToNumber(character.secondaryColor));
        
        // Head
        const head = this.scene.add.circle(0, -15, 18, this.hexToNumber(character.primaryColor));
        
        // Face details
        const face = this.scene.add.ellipse(0, -13, 15, 16, this.hexToNumber(character.secondaryColor));
        
        // Ears
        const earLeft = this.scene.add.ellipse(-8, -25, 8, 12, this.hexToNumber(character.primaryColor));
        const earRight = this.scene.add.ellipse(8, -25, 8, 12, this.hexToNumber(character.primaryColor));
        
        // Inner ears
        const innerEarLeft = this.scene.add.ellipse(-8, -25, 4, 7, 0xFFAAAA);
        const innerEarRight = this.scene.add.ellipse(8, -25, 4, 7, 0xFFAAAA);
        
        // Eyes (matching selection screen size)
        const eyeLeft = this.scene.add.circle(-4, -15, 2, 0x000000);
        const eyeRight = this.scene.add.circle(4, -15, 2, 0x000000);
        
        // Nose (matching selection screen size)
        const nose = this.scene.add.circle(0, -9, 1.5, 0xFF69B4);
        
        container.add([body, belly, head, face, earLeft, earRight, 
                      innerEarLeft, innerEarRight, eyeLeft, eyeRight, nose]);
        
        // Simple two-tone design - no patches needed
        
        return container;
    }
}