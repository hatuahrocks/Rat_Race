class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI container
        this.uiContainer = this.add.container(0, 0);
        
        // Responsive boost meter positioning
        const meterWidth = Math.min(200, width * 0.2); // Max 200px or 20% of screen width
        const meterX = width - (meterWidth / 2) - 20; // 20px margin from edge
        const meterY = height - 50;
        
        // Boost meter background
        const boostBg = this.add.rectangle(meterX, meterY, meterWidth, 30, 0x333333);
        boostBg.setOrigin(0.5);
        boostBg.setStrokeStyle(3, 0x000000);
        
        // Boost meter fill
        this.boostFill = this.add.rectangle(meterX, meterY, meterWidth - 4, 26, 0x00FF00);
        this.boostFill.setOrigin(0.5);
        this.boostMeterMaxWidth = meterWidth - 4;
        
        // Boost label
        const labelSize = Math.min(20, width * 0.025); // Responsive font size
        const boostLabel = this.add.text(meterX, meterY - 30, 'BOOST', {
            fontSize: `${labelSize}px`,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        boostLabel.setOrigin(0.5);
        
        // Create boost button for touch controls
        this.createBoostButton();
        
        // Responsive progress bar
        const progressWidth = Math.min(600, width * 0.8); // Max 600px or 80% of screen width
        const progressBg = this.add.rectangle(width / 2, 30, progressWidth, 20, 0x333333);
        progressBg.setStrokeStyle(2, 0x000000);
        
        this.progressFill = this.add.rectangle(width / 2 - (progressWidth / 2) + 1, 30, 2, 16, 0xFFD700);
        this.progressFill.setOrigin(0, 0.5);
        this.progressMaxWidth = progressWidth - 2;
        
        // Progress markers (responsive spacing)
        const markerCount = 10;
        for (let i = 0; i <= markerCount; i++) {
            const x = (width / 2 - (progressWidth / 2)) + (i * (progressWidth / markerCount));
            const marker = this.add.rectangle(x, 30, 2, 20, 0x666666);
        }
        
        // Responsive position indicator
        const positionSize = Math.min(48, width * 0.06); // Responsive font size
        this.positionText = this.add.text(30, 50, '1st', {
            fontSize: `${positionSize}px`,
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: Math.max(3, positionSize * 0.125)
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
        
        // Responsive touch-friendly boost button
        const buttonSize = Math.min(100, Math.max(60, width * 0.12)); // 60-100px based on screen size
        const margin = Math.max(20, width * 0.03); // Responsive margin from edge
        const button = this.add.container(width - margin - (buttonSize / 2), height - 150);
        
        // Button background
        const bg = this.add.circle(0, 0, buttonSize / 2, 0xFF0000);
        bg.setStrokeStyle(4, 0x000000);
        bg.setInteractive({ useHandCursor: true });
        bg.setAlpha(0.7);
        
        // Responsive button text
        const textSize = Math.min(24, buttonSize * 0.25);
        const text = this.add.text(0, 0, 'BOOST', {
            fontSize: `${textSize}px`,
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: Math.max(2, textSize * 0.1)
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
        this.boostFill.width = this.boostMeterMaxWidth * percentage;
        
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
        this.progressFill.width = this.progressMaxWidth * percentage;
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