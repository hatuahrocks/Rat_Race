class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI container
        this.uiContainer = this.add.container(0, 0);
        
        // Boost meter background
        const boostBg = this.add.rectangle(width - 150, height - 50, 200, 30, 0x333333);
        boostBg.setOrigin(0.5);
        boostBg.setStrokeStyle(3, 0x000000);
        
        // Boost meter fill
        this.boostFill = this.add.rectangle(width - 150, height - 50, 196, 26, 0x00FF00);
        this.boostFill.setOrigin(0.5);
        
        // Boost label
        const boostLabel = this.add.text(width - 150, height - 80, 'BOOST', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        boostLabel.setOrigin(0.5);
        
        // Create boost button for touch controls
        this.createBoostButton();
        
        // Progress bar
        const progressBg = this.add.rectangle(width / 2, 30, 600, 20, 0x333333);
        progressBg.setStrokeStyle(2, 0x000000);
        
        this.progressFill = this.add.rectangle(width / 2 - 299, 30, 2, 16, 0xFFD700);
        this.progressFill.setOrigin(0, 0.5);
        
        // Progress markers
        for (let i = 0; i <= 10; i++) {
            const x = (width / 2 - 300) + (i * 60);
            const marker = this.add.rectangle(x, 30, 2, 20, 0x666666);
        }
        
        // Position indicator
        this.positionText = this.add.text(50, 50, '1st', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6
        });
        
        // Speed indicator
        this.speedText = this.add.text(50, 110, 'SPEED: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Distance indicator
        this.distanceText = this.add.text(50, 145, 'DISTANCE: 0m', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        // Lane indicator arrows (helper for new players)
        this.createLaneIndicators();
        
        this.uiContainer.add([
            boostBg, this.boostFill, boostLabel,
            progressBg, this.progressFill,
            this.positionText, this.speedText, this.distanceText
        ]);
    }
    
    createBoostButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Large touch-friendly boost button
        const buttonSize = 100;
        const button = this.add.container(width - 80, height - 150);
        
        // Button background
        const bg = this.add.circle(0, 0, buttonSize / 2, 0xFF0000);
        bg.setStrokeStyle(4, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        bg.setAlpha(0.7);
        
        // Button text
        const text = this.add.text(0, 0, 'BOOST', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        text.setOrigin(0.5);
        
        button.add([bg, text]);
        
        // Touch events
        bg.on('pointerdown', () => {
            bg.setScale(0.9);
            bg.setFillStyle(0xFF6600);
            this.scene.get('GameScene').events.emit('boostStart');
        });
        
        bg.on('pointerup', () => {
            bg.setScale(1);
            bg.setFillStyle(0xFF0000);
            this.scene.get('GameScene').events.emit('boostEnd');
        });
        
        bg.on('pointerout', () => {
            bg.setScale(1);
            bg.setFillStyle(0xFF0000);
            this.scene.get('GameScene').events.emit('boostEnd');
        });
        
        this.boostButton = button;
    }
    
    createLaneIndicators() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Up arrow
        const upArrow = this.add.container(100, height / 2 - 80);
        const upBg = this.add.circle(0, 0, 30, 0x4444FF);
        upBg.setAlpha(0.3);
        const upText = this.add.text(0, 0, '↑', {
            fontSize: '36px',
            color: '#FFFFFF'
        });
        upText.setOrigin(0.5);
        upArrow.add([upBg, upText]);
        
        // Down arrow
        const downArrow = this.add.container(100, height / 2 + 80);
        const downBg = this.add.circle(0, 0, 30, 0x4444FF);
        downBg.setAlpha(0.3);
        const downText = this.add.text(0, 0, '↓', {
            fontSize: '36px',
            color: '#FFFFFF'
        });
        downText.setOrigin(0.5);
        downArrow.add([downBg, downText]);
        
        // Add swipe hint text
        const swipeHint = this.add.text(100, height / 2, 'SWIPE', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        swipeHint.setOrigin(0.5);
        swipeHint.setAlpha(0.5);
        
        // Fade out after a few seconds
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: [upArrow, downArrow, swipeHint],
                alpha: 0,
                duration: 1000
            });
        });
    }
    
    updateBoostMeter(percentage) {
        const maxWidth = 196;
        this.boostFill.width = maxWidth * percentage;
        
        // Change color based on boost level
        if (percentage > 0.6) {
            this.boostFill.setFillStyle(0x00FF00); // Green
        } else if (percentage > 0.3) {
            this.boostFill.setFillStyle(0xFFFF00); // Yellow
        } else {
            this.boostFill.setFillStyle(0xFF0000); // Red
        }
    }
    
    updateProgress(percentage) {
        const maxWidth = 598;
        this.progressFill.width = maxWidth * percentage;
    }
    
    updatePosition(position) {
        const suffix = this.getPositionSuffix(position);
        this.positionText.setText(position + suffix);
        
        // Change color based on position
        if (position === 1) {
            this.positionText.setColor('#FFD700'); // Gold
        } else if (position === 2) {
            this.positionText.setColor('#C0C0C0'); // Silver
        } else if (position === 3) {
            this.positionText.setColor('#CD7F32'); // Bronze
        } else {
            this.positionText.setColor('#FFFFFF'); // White
        }
    }
    
    updateSpeed(speed) {
        this.speedText.setText('SPEED: ' + Math.round(speed));
    }
    
    updateDistance(distance) {
        this.distanceText.setText('DISTANCE: ' + Math.round(distance) + 'm');
    }
    
    getPositionSuffix(position) {
        if (position === 1) return 'st';
        if (position === 2) return 'nd';
        if (position === 3) return 'rd';
        return 'th';
    }
}