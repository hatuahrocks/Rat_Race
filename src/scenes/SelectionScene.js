class SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectionScene' });
        this.selectedIndex = 0;
        this.characterCards = [];
    }

    create() {
        // Get shared audio manager from registry
        this.audioManager = this.registry.get('audioManager');

        // Continue menu music if not already playing
        if (this.audioManager && !this.audioManager.currentMusic) {
            this.audioManager.playMusic('music_menu', true);
        }
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.cameras.main.setBackgroundColor('#2C3E50');
        
        // Title (positioned higher and more visible)
        const title = this.add.text(width / 2, 80, 'SELECT YOUR RACER', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(1000); // Ensure it's on top
        
        // Create character selection grid
        this.createCharacterGrid();
        
        // Instructions
        const instructions = this.add.text(width / 2, height - 100, 'Click a character to select', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        instructions.setOrigin(0.5);
        
        // Start button
        this.startButton = this.createStartButton(width / 2, height - 50);
        
        // Back button
        this.createBackButton(50, 50);
        
        // Initialize palette swap system
        this.paletteSwap = new PaletteSwap(this);
        this.patchesManager = new PatchesManager(this);
    }
    
    createCharacterGrid() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Responsive grid calculation
        const cols = width < 800 ? 2 : 4; // Use 2 columns on smaller screens
        const cardWidth = width < 800 ? 140 : 160; // Smaller cards on mobile
        const cardHeight = width < 800 ? 180 : 200;
        const spacing = width < 800 ? 15 : 20;
        
        // Calculate grid dimensions
        const gridWidth = (cols * cardWidth) + ((cols - 1) * spacing);
        const gridHeight = (Math.ceil(Characters.length / cols) * cardHeight) + 
                          ((Math.ceil(Characters.length / cols) - 1) * spacing);
        
        // Center the grid with proper spacing below title
        const startX = (width - gridWidth) / 2 + (cardWidth / 2);
        const startY = 160; // Margin below title (title now at Y=80)
        
        Characters.forEach((character, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + (col * (cardWidth + spacing));
            const y = startY + (row * (cardHeight + spacing));
            
            const card = this.createCharacterCard(x, y, character, index, cardWidth, cardHeight);
            this.characterCards.push(card);
        });
        
        // Select first character by default
        this.selectCharacter(0);
    }
    
    createCharacterCard(x, y, character, index, cardWidth = 160, cardHeight = 200) {
        const card = this.add.container(x, y);
        
        // Card background (use dynamic dimensions) - light grey as default
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xF0F0F0);
        bg.setStrokeStyle(4, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        
        // Selection highlight (slightly larger than background)
        const highlight = this.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xFFD700);
        highlight.setStrokeStyle(6, 0xFFD700);
        highlight.setVisible(false);
        highlight.setAlpha(0.3);
        card.highlight = highlight;
        
        // Character portrait container
        const portrait = this.add.container(0, -30);
        
        // Car base
        const car = this.add.rectangle(0, 40, 80, 30, 0x444444);
        const wheel1 = this.add.circle(-25, 55, 10, 0x222222);
        const wheel2 = this.add.circle(25, 55, 10, 0x222222);
        portrait.add([car, wheel1, wheel2]);
        
        // Rat character
        const ratSprite = this.createDetailedRat(character);
        portrait.add(ratSprite);
        
        // Character name
        const name = this.add.text(0, 55, character.name, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        });
        name.setOrigin(0.5);

        // Character personality
        const personality = this.add.text(0, 73, character.personality, {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#FF6B6B',
            fontStyle: 'italic'
        });
        personality.setOrigin(0.5);

        // Character trait
        const trait = this.add.text(0, 90, character.trait, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#666666',
            align: 'center',
            wordWrap: { width: 140 }
        });
        trait.setOrigin(0.5);
        
        card.add([highlight, bg, portrait, name, personality, trait]);
        card.character = character;
        card.index = index;
        
        // Click handler
        bg.on('pointerdown', () => {
            this.selectCharacter(index);
        });
        
        // Hover effects
        bg.on('pointerover', () => {
            if (index !== this.selectedIndex) {
                bg.setFillStyle(0xD8D8D8);
            }
        });

        bg.on('pointerout', () => {
            if (index !== this.selectedIndex) {
                bg.setFillStyle(0xF0F0F0);
            }
        });
        
        return card;
    }
    
    createDetailedRat(character) {
        const container = this.add.container(0, 10);
        
        // Body (larger and more detailed for selection screen)
        const body = this.add.ellipse(0, 0, 50, 60, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        
        // Belly/face area
        const belly = this.add.ellipse(0, 5, 35, 45, 
            Phaser.Display.Color.HexStringToColor(character.secondaryColor).color);
        
        // Head
        const head = this.add.circle(0, -20, 25, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        
        // Face details
        const face = this.add.ellipse(0, -18, 20, 22, 
            Phaser.Display.Color.HexStringToColor(character.secondaryColor).color);
        
        // Ears
        const earLeft = this.add.ellipse(-12, -35, 12, 18, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        const earRight = this.add.ellipse(12, -35, 12, 18, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        
        // Inner ears
        const innerEarLeft = this.add.ellipse(-12, -35, 6, 10, 0xFFAAAA);
        const innerEarRight = this.add.ellipse(12, -35, 6, 10, 0xFFAAAA);
        
        // Eyes
        const eyeLeft = this.add.circle(-7, -20, 3, 0x000000);
        const eyeRight = this.add.circle(7, -20, 3, 0x000000);
        
        // Nose
        const nose = this.add.circle(0, -12, 2, 0xFF69B4);
        
        container.add([body, belly, head, face, earLeft, earRight,
                      innerEarLeft, innerEarRight, eyeLeft, eyeRight, nose]);

        // Add larger accessories for selection screen
        this.addDetailedAccessory(container, character);

        return container;
    }

    addDetailedAccessory(container, character) {
        const accessoryColor = Phaser.Display.Color.HexStringToColor(character.accessoryColor || '#000000').color;

        switch(character.accessory) {
            case 'bow-tie':
                // Create bow tie using graphics for exact control
                const bowTie = this.add.graphics();

                // Left wing triangle - red
                bowTie.fillStyle(accessoryColor);
                bowTie.beginPath();
                bowTie.moveTo(-25, -8); // top left corner
                bowTie.lineTo(-4, 5);   // inner point (center)
                bowTie.lineTo(-25, 18); // bottom left corner
                bowTie.closePath();
                bowTie.fillPath();

                // Right wing triangle - red
                bowTie.fillStyle(accessoryColor);
                bowTie.beginPath();
                bowTie.moveTo(25, -8);  // top right corner
                bowTie.lineTo(4, 5);    // inner point (center)
                bowTie.lineTo(25, 18);  // bottom right corner
                bowTie.closePath();
                bowTie.fillPath();

                // Center knot - darker red oval
                bowTie.fillStyle(0x8B0000);
                bowTie.fillEllipse(0, 5, 16, 10);

                container.add(bowTie);
                break;

            case 'monocle-tophat':
                // Larger monocle and top hat for Duke
                const monocle = this.add.circle(9, -20, 8);
                monocle.setStrokeStyle(2, accessoryColor);
                const monocleChain = this.add.line(0, 0, 9, -20, 15, -12, accessoryColor);
                monocleChain.setLineWidth(1);
                const hatBrim = this.add.ellipse(0, -45, 35, 8, accessoryColor);
                const hatTop = this.add.rectangle(0, -54, 25, 18, accessoryColor);
                container.add([monocle, monocleChain, hatBrim, hatTop]);
                break;

            case 'tiara':
                // Larger tiara for Daisy
                const tiaraBase = this.add.arc(0, -42, 20, 180, 360, false);
                tiaraBase.setStrokeStyle(3, accessoryColor);
                const gem1 = this.add.circle(-7, -44, 3, 0xFF69B4);
                const gem2 = this.add.circle(0, -47, 4, 0xFF69B4);
                const gem3 = this.add.circle(7, -44, 3, 0xFF69B4);
                container.add([tiaraBase, gem1, gem2, gem3]);
                break;

            case 'goggles':
                // Racing goggles on forehead for Pip
                const goggleLeft = this.add.circle(-8, -38, 6);
                goggleLeft.setStrokeStyle(3, accessoryColor);
                goggleLeft.setFillStyle(0x333333, 0.3);
                const goggleRight = this.add.circle(8, -38, 6);
                goggleRight.setStrokeStyle(3, accessoryColor);
                goggleRight.setFillStyle(0x333333, 0.3);
                const goggleStrap = this.add.line(0, 0, -14, -38, -18, -40, accessoryColor);
                goggleStrap.setLineWidth(3);
                const goggleStrap2 = this.add.line(0, 0, 14, -38, 18, -40, accessoryColor);
                goggleStrap2.setLineWidth(3);
                const goggleBridge = this.add.line(0, 0, -2, -38, 2, -38, accessoryColor);
                goggleBridge.setLineWidth(2);
                container.add([goggleLeft, goggleRight, goggleStrap, goggleStrap2, goggleBridge]);
                break;

            case 'vest':
                // Leather vest at chest level for Biscuit
                const vestLeft = this.add.rectangle(-12, 8, 12, 25, accessoryColor);
                const vestRight = this.add.rectangle(12, 8, 12, 25, accessoryColor);
                const vestButton1 = this.add.circle(-12, 3, 2, 0x888888);
                const vestButton2 = this.add.circle(12, 3, 2, 0x888888);
                container.add([vestLeft, vestRight, vestButton1, vestButton2]);
                break;

            case 'sunglasses':
                // Cool bigger sunglasses for Slurp
                const lensLeft = this.add.ellipse(-9, -20, 14, 10, accessoryColor);
                const lensRight = this.add.ellipse(9, -20, 14, 10, accessoryColor);
                const bridge = this.add.rectangle(0, -20, 4, 2, accessoryColor);
                container.add([lensLeft, lensRight, bridge]);
                break;

            case 'sweatband':
                // Larger sweatband for Dippy
                const band = this.add.rectangle(0, -35, 28, 6, accessoryColor);
                const stripe1 = this.add.rectangle(0, -35, 28, 2, 0xFFFFFF);
                container.add([band, stripe1]);
                break;

            case 'scarf':
                // Blue scarf with darker outline for Marshmallow
                const scarfOutline = this.add.ellipse(0, 12, 38, 15, 0x2B5797);
                const scarfMain = this.add.ellipse(0, 12, 35, 12, accessoryColor);
                const scarfEndOutline = this.add.rectangle(-15, 15, 11, 24, 0x2B5797);
                const scarfEnd = this.add.rectangle(-15, 15, 9, 22, accessoryColor);
                const scarfStripe = this.add.rectangle(-15, 22, 9, 3, 0xFFFFFF);
                container.add([scarfOutline, scarfMain, scarfEndOutline, scarfEnd, scarfStripe]);
                break;
        }
    }

    selectCharacter(index) {
        // Update selection
        this.selectedIndex = index;
        
        // Update visual feedback
        this.characterCards.forEach((card, i) => {
            if (i === index) {
                card.highlight.setVisible(true);
                card.getAt(1).setFillStyle(0xFFFACD); // Highlight background
            } else {
                card.highlight.setVisible(false);
                card.getAt(1).setFillStyle(0xF0F0F0); // Normal grey background
            }
        });
        
        // Store selected character
        this.registry.set('selectedCharacter', Characters[index]);
        
        // Update start button
        this.updateStartButton();
    }
    
    createStartButton(x, y) {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 200, 50, 0x00FF00);
        bg.setStrokeStyle(3, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        
        const text = this.add.text(0, 0, 'NEXT', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        
        button.add([bg, text]);
        
        bg.on('pointerdown', () => {
            this.scene.start('CarColorSelectionScene');
        });
        
        bg.on('pointerover', () => {
            bg.setFillStyle(0x00DD00);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x00FF00);
        });
        
        return button;
    }
    
    createBackButton(x, y) {
        const button = this.add.container(x, y);
        
        const bg = this.add.circle(0, 0, 25, 0xFF4444);
        bg.setStrokeStyle(3, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        
        const arrow = this.add.text(0, 0, '←', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        arrow.setOrigin(0.5);
        
        button.add([bg, arrow]);
        
        bg.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        bg.on('pointerover', () => {
            bg.setFillStyle(0xFF6666);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0xFF4444);
        });
        
        return button;
    }
    
    updateStartButton() {
        // Visual feedback that a character is selected
        this.tweens.add({
            targets: this.startButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true
        });
    }
}