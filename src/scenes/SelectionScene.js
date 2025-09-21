class SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectionScene' });
        this.selectedIndex = 0;
        this.characterCards = [];
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.cameras.main.setBackgroundColor('#2C3E50');
        
        // Title
        const title = this.add.text(width / 2, 50, 'SELECT YOUR RACER', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
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
        
        // Center the grid
        const startX = (width - gridWidth) / 2 + (cardWidth / 2);
        const startY = 120; // Fixed top margin
        
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
        
        // Card background (use dynamic dimensions)
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xFFFFFF);
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
        const name = this.add.text(0, 60, character.name, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        });
        name.setOrigin(0.5);
        
        // Character description
        const desc = this.add.text(0, 85, character.description, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#666666',
            align: 'center',
            wordWrap: { width: 140 }
        });
        desc.setOrigin(0.5);
        
        card.add([highlight, bg, portrait, name, desc]);
        card.character = character;
        card.index = index;
        
        // Click handler
        bg.on('pointerdown', () => {
            this.selectCharacter(index);
        });
        
        // Hover effects
        bg.on('pointerover', () => {
            if (index !== this.selectedIndex) {
                bg.setFillStyle(0xF0F0F0);
            }
        });
        
        bg.on('pointerout', () => {
            if (index !== this.selectedIndex) {
                bg.setFillStyle(0xFFFFFF);
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
        
        // Add patches if character has them
        if (character.hasPatches) {
            const patches = [];
            
            // Create specific patch patterns for each patched character
            if (character.id === 'pip') {
                // Black rat with white patches
                patches.push(this.add.ellipse(-15, -5, 18, 14, 0xFFFFFF));
                patches.push(this.add.circle(10, 15, 10, 0xFFFFFF));
                patches.push(this.add.ellipse(5, -25, 10, 8, 0xFFFFFF));
            } else if (character.id === 'biscuit') {
                // Brown rat with white patches
                patches.push(this.add.circle(-10, 0, 12, 0xFFFFFF));
                patches.push(this.add.ellipse(12, 10, 16, 12, 0xFFFFFF));
                patches.push(this.add.circle(-5, -30, 8, 0xFFFFFF));
            }
            
            patches.forEach(patch => {
                patch.setAlpha(0.9);
                container.add(patch);
            });
        }
        
        return container;
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
                card.getAt(1).setFillStyle(0xFFFFFF); // Normal background
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
        
        const text = this.add.text(0, 0, 'START RACE!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        
        button.add([bg, text]);
        
        bg.on('pointerdown', () => {
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
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