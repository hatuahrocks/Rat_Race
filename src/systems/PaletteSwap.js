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

        // Add accessories based on character
        this.addAccessory(container, character);

        return container;
    }

    addAccessory(container, character) {
        const accessoryColor = this.hexToNumber(character.accessoryColor || '#000000');

        switch(character.accessory) {
            case 'bow-tie':
                // Create bow tie using graphics for exact control (smaller version)
                const bowTie = this.scene.add.graphics();

                // Left wing triangle - red
                bowTie.fillStyle(accessoryColor);
                bowTie.beginPath();
                bowTie.moveTo(-16, -5); // top left corner
                bowTie.lineTo(-3, 2);   // inner point (center)
                bowTie.lineTo(-16, 9);  // bottom left corner
                bowTie.closePath();
                bowTie.fillPath();

                // Right wing triangle - red
                bowTie.fillStyle(accessoryColor);
                bowTie.beginPath();
                bowTie.moveTo(16, -5);  // top right corner
                bowTie.lineTo(3, 2);    // inner point (center)
                bowTie.lineTo(16, 9);   // bottom right corner
                bowTie.closePath();
                bowTie.fillPath();

                // Center knot - darker red oval
                bowTie.fillStyle(0x8B0000);
                bowTie.fillEllipse(0, 2, 10, 7);

                container.add(bowTie);
                break;

            case 'monocle-tophat':
                // Monocle and top hat for Duke
                const monocle = this.scene.add.circle(6, -15, 5);
                monocle.setStrokeStyle(1, accessoryColor);
                const monocleChain = this.scene.add.line(0, 0, 6, -15, 10, -10, accessoryColor);
                monocleChain.setLineWidth(0.5);
                const hatBrim = this.scene.add.ellipse(0, -32, 25, 6, accessoryColor);
                const hatTop = this.scene.add.rectangle(0, -38, 18, 12, accessoryColor);
                container.add([monocle, monocleChain, hatBrim, hatTop]);
                break;

            case 'tiara':
                // Tiara for Daisy
                const tiaraBase = this.scene.add.arc(0, -28, 15, 180, 360, false);
                tiaraBase.setStrokeStyle(2, accessoryColor);
                const gem1 = this.scene.add.circle(-5, -30, 2, 0xFF69B4);
                const gem2 = this.scene.add.circle(0, -32, 3, 0xFF69B4);
                const gem3 = this.scene.add.circle(5, -30, 2, 0xFF69B4);
                container.add([tiaraBase, gem1, gem2, gem3]);
                break;

            case 'goggles':
                // Racing goggles on forehead for Pip
                const goggleLeft = this.scene.add.circle(-5, -25, 4);
                goggleLeft.setStrokeStyle(2, accessoryColor);
                goggleLeft.setFillStyle(0x333333, 0.3);
                const goggleRight = this.scene.add.circle(5, -25, 4);
                goggleRight.setStrokeStyle(2, accessoryColor);
                goggleRight.setFillStyle(0x333333, 0.3);
                const goggleStrap = this.scene.add.line(0, 0, -9, -25, -12, -27, accessoryColor);
                goggleStrap.setLineWidth(2);
                const goggleStrap2 = this.scene.add.line(0, 0, 9, -25, 12, -27, accessoryColor);
                goggleStrap2.setLineWidth(2);
                const goggleBridge = this.scene.add.line(0, 0, -1, -25, 1, -25, accessoryColor);
                goggleBridge.setLineWidth(1.5);
                container.add([goggleLeft, goggleRight, goggleStrap, goggleStrap2, goggleBridge]);
                break;

            case 'vest':
                // Leather vest at chest level for Biscuit
                const vestLeft = this.scene.add.rectangle(-8, 5, 8, 18, accessoryColor);
                const vestRight = this.scene.add.rectangle(8, 5, 8, 18, accessoryColor);
                const vestButton1 = this.scene.add.circle(-8, 2, 1.5, 0x888888);
                const vestButton2 = this.scene.add.circle(8, 2, 1.5, 0x888888);
                container.add([vestLeft, vestRight, vestButton1, vestButton2]);
                break;

            case 'sunglasses':
                // Cool bigger sunglasses for Slurp
                const lensLeft = this.scene.add.ellipse(-6, -15, 9, 6, accessoryColor);
                const lensRight = this.scene.add.ellipse(6, -15, 9, 6, accessoryColor);
                const bridge = this.scene.add.rectangle(0, -15, 3, 1, accessoryColor);
                container.add([lensLeft, lensRight, bridge]);
                break;

            case 'sweatband':
                // Sweatband for Dippy
                const band = this.scene.add.rectangle(0, -23, 20, 4, accessoryColor);
                const stripe1 = this.scene.add.rectangle(0, -23, 20, 1, 0xFFFFFF);
                container.add([band, stripe1]);
                break;

            case 'scarf':
                // Blue scarf with darker outline for Marshmallow
                const scarfOutline = this.scene.add.ellipse(0, 8, 27, 10, 0x2B5797);
                const scarfMain = this.scene.add.ellipse(0, 8, 25, 8, accessoryColor);
                const scarfEndOutline = this.scene.add.rectangle(-10, 10, 8, 17, 0x2B5797);
                const scarfEnd = this.scene.add.rectangle(-10, 10, 6, 15, accessoryColor);
                const scarfStripe = this.scene.add.rectangle(-10, 15, 6, 2, 0xFFFFFF);
                container.add([scarfOutline, scarfMain, scarfEndOutline, scarfEnd, scarfStripe]);
                break;
        }
    }
}