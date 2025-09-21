class CarColorSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CarColorSelectionScene' });
        this.selectedIndex = 0;
        this.colorCards = [];
        this.carColors = [
            { name: 'Classic Black', color: 0x333333, accent: 0x444444 },
            { name: 'Racing Red', color: 0xCC0000, accent: 0xFF3333 },
            { name: 'Electric Blue', color: 0x0066CC, accent: 0x3399FF },
            { name: 'Forest Green', color: 0x228B22, accent: 0x32CD32 },
            { name: 'Sunset Orange', color: 0xFF6600, accent: 0xFF9933 },
            { name: 'Royal Purple', color: 0x663399, accent: 0x9966CC },
            { name: 'Bright Yellow', color: 0xFFCC00, accent: 0xFFDD33 },
            { name: 'Hot Pink', color: 0xFF1493, accent: 0xFF69B4 }
        ];
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.cameras.main.setBackgroundColor('#2C3E50');
        
        // Get selected character from previous scene
        this.selectedCharacter = this.registry.get('selectedCharacter') || Characters[0];
        
        // Title
        const title = this.add.text(width / 2, 80, 'SELECT YOUR CAR COLOR', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setDepth(1000);
        
        // Show selected character info
        const charInfo = this.add.text(width / 2, 120, `Driver: ${this.selectedCharacter.name}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        charInfo.setOrigin(0.5);
        
        // Create color selection grid
        this.createColorGrid();
        
        // Instructions
        const instructions = this.add.text(width / 2, height - 100, 'Click a color to select your car', {
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
    }
    
    createColorGrid() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Grid configuration
        const cols = 4;
        const cardWidth = 160;
        const cardHeight = 120;
        const spacing = 20;
        
        // Calculate grid dimensions
        const gridWidth = (cols * cardWidth) + ((cols - 1) * spacing);
        
        // Center the grid
        const startX = (width - gridWidth) / 2 + (cardWidth / 2);
        const startY = 180;
        
        this.carColors.forEach((colorData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + (col * (cardWidth + spacing));
            const y = startY + (row * (cardHeight + spacing));
            
            const card = this.createColorCard(x, y, colorData, index, cardWidth, cardHeight);
            this.colorCards.push(card);
        });
        
        // Select first color by default
        this.selectColor(0);
    }
    
    createColorCard(x, y, colorData, index, cardWidth = 160, cardHeight = 120) {
        const card = this.add.container(x, y);
        
        // Card background
        const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xFFFFFF);
        bg.setStrokeStyle(4, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        
        // Selection highlight
        const highlight = this.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xFFD700);
        highlight.setStrokeStyle(6, 0xFFD700);
        highlight.setVisible(false);
        highlight.setAlpha(0.3);
        card.highlight = highlight;
        
        // Preview car
        const carPreview = this.add.container(0, -10);
        
        // Car body
        const carBody = this.add.rectangle(0, 0, 70, 25, colorData.color);
        const carFront = this.add.rectangle(25, -2, 20, 20, colorData.accent);
        const carBack = this.add.rectangle(-25, -2, 15, 20, colorData.accent);
        
        // Wheels
        const wheelFront = this.add.circle(20, 15, 8, 0x222222);
        const wheelBack = this.add.circle(-20, 15, 8, 0x222222);
        
        // Character in car
        const ratSprite = this.createMiniRat(this.selectedCharacter);
        ratSprite.setScale(0.4);
        ratSprite.y = -8;
        
        carPreview.add([carBack, carBody, carFront, wheelFront, wheelBack, ratSprite]);
        
        // Color name
        const name = this.add.text(0, 35, colorData.name, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold',
            align: 'center'
        });
        name.setOrigin(0.5);
        
        card.add([highlight, bg, carPreview, name]);
        card.colorData = colorData;
        card.index = index;
        
        // Click handler
        bg.on('pointerdown', () => {
            this.selectColor(index);
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
    
    createMiniRat(character) {
        const container = this.add.container(0, 0);
        
        // Simple rat for car preview
        const body = this.add.ellipse(0, 0, 20, 25, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        const head = this.add.circle(0, -10, 10, 
            Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
        const face = this.add.ellipse(0, -9, 8, 9, 
            Phaser.Display.Color.HexStringToColor(character.secondaryColor).color);
        
        // Eyes
        const eyeLeft = this.add.circle(-3, -10, 1.5, 0x000000);
        const eyeRight = this.add.circle(3, -10, 1.5, 0x000000);
        
        container.add([body, head, face, eyeLeft, eyeRight]);
        
        return container;
    }
    
    selectColor(index) {
        // Update selection
        this.selectedIndex = index;
        
        // Update visual feedback
        this.colorCards.forEach((card, i) => {
            if (i === index) {
                card.highlight.setVisible(true);
                card.getAt(1).setFillStyle(0xFFFACD); // Highlight background
            } else {
                card.highlight.setVisible(false);
                card.getAt(1).setFillStyle(0xFFFFFF); // Normal background
            }
        });
        
        // Store selected car color
        this.registry.set('selectedCarColor', this.carColors[index]);
        
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
            this.scene.start('SelectionScene');
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
        // Visual feedback that a color is selected
        this.tweens.add({
            targets: this.startButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true
        });
    }
}