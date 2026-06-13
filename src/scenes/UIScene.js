class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset per-race state (scene instances are reused between races)
        this.racerMarkers = null;

        // Create UI container
        this.uiContainer = this.add.container(0, 0);
        
        // Responsive boost meter positioning
        const meterWidth = Math.min(200, width * 0.2); // Max 200px or 20% of screen width
        const meterX = width - (meterWidth / 2) - 20; // 20px margin from edge
        const meterY = height - 50;
        
        // Boost meter background (rounded)
        const boostBg = GameArt.createPanel(this, meterX - meterWidth / 2, meterY - 15, meterWidth, 30, {
            radius: 12, color: 0x000000, alpha: 0.5, strokeColor: 0x000000, strokeAlpha: 0.8, strokeWidth: 3
        });

        // Boost meter fill
        this.boostFill = this.add.rectangle(meterX, meterY, meterWidth - 8, 22, 0x00FF00);
        this.boostFill.setOrigin(0.5);
        this.boostMeterMaxWidth = meterWidth - 8;
        
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
        
        // Responsive progress bar (rounded track)
        const progressWidth = Math.min(600, width * 0.8); // Max 600px or 80% of screen width
        const progressBg = GameArt.createPanel(this, width / 2 - progressWidth / 2, 18, progressWidth, 24, {
            radius: 12, color: 0x000000, alpha: 0.5, strokeColor: 0x000000, strokeAlpha: 0.8, strokeWidth: 3
        });

        this.progressFill = this.add.rectangle(width / 2 - (progressWidth / 2) + 4, 30, 2, 16, 0xFFD700);
        this.progressFill.setOrigin(0, 0.5);
        this.progressMaxWidth = progressWidth - 8;

        // Progress markers (responsive spacing)
        const markerCount = 10;
        for (let i = 1; i < markerCount; i++) {
            const x = (width / 2 - (progressWidth / 2)) + (i * (progressWidth / markerCount));
            const marker = this.add.rectangle(x, 30, 2, 14, 0xFFFFFF, 0.25);
        }

        // Translucent panel behind position/speed/distance readouts
        const hudPanel = GameArt.createPanel(this, 18, 42, 235, 122, { radius: 14, alpha: 0.35 });

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
            hudPanel, this.positionText, this.speedText, this.distanceText
        ]);
    }
    
    createBoostButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Responsive touch-friendly boost button
        const buttonSize = Math.min(100, Math.max(60, width * 0.12)); // 60-100px based on screen size
        const margin = Math.max(20, width * 0.03); // Responsive margin from edge

        // Helper function to create a boost button
        const createButton = (x, y) => {
            const button = this.add.container(x, y);

            // Button background - start green since boost is full at race start
            const bg = this.add.circle(0, 0, buttonSize / 2, 0x00FF00);
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

            // Touch events - single tap to use full boost
            bg.on('pointerup', () => {
                bg.setScale(0.9);
                this.scene.get('GameScene').events.emit('boostTap');

                // Visual feedback
                this.tweens.add({
                    targets: bg,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });

            return button;
        };

        // Create RIGHT boost button (original position)
        this.boostButtonRight = createButton(
            width - margin - (buttonSize / 2),
            height - 150
        );
        this.boostButtonRight.pulsing = false;

        // Create LEFT boost button (for left-handed boost while right-hand steers)
        this.boostButtonLeft = createButton(
            margin + (buttonSize / 2),
            height - 150
        );
        this.boostButtonLeft.pulsing = false;

        // Start pulsing immediately since boost is full at race start
        this.time.delayedCall(100, () => {
            this.updateBoostButtons(true);
        });
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
    
    updateBoostMeter(percentage, isAvailable = true) {
        this.boostFill.width = this.boostMeterMaxWidth * percentage;

        // Color system: Green when full and usable, Red when empty/building
        if (percentage >= 1.0 && isAvailable) {
            this.boostFill.setFillStyle(0x00FF00); // Green - ready to use
        } else {
            this.boostFill.setFillStyle(0xFF0000); // Red - building up or in use
        }
    }

    updateBoostButtons(isAvailable) {
        // Update button colors to match boost availability
        const color = isAvailable ? 0x00FF00 : 0xFF0000; // Green when available, red when not

        if (this.boostButtonLeft && this.boostButtonLeft.list[0]) {
            this.boostButtonLeft.list[0].setFillStyle(color);

            // Add pulsing effect when available
            if (isAvailable && !this.boostButtonLeft.pulsing) {
                this.boostButtonLeft.pulsing = true;
                this.tweens.add({
                    targets: this.boostButtonLeft.list[0],
                    alpha: { from: 0.7, to: 1 },
                    scale: { from: 1, to: 1.05 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            } else if (!isAvailable && this.boostButtonLeft.pulsing) {
                this.boostButtonLeft.pulsing = false;
                this.tweens.killTweensOf(this.boostButtonLeft.list[0]);
                this.boostButtonLeft.list[0].setAlpha(0.7);
                this.boostButtonLeft.list[0].setScale(1);
            }
        }
        if (this.boostButtonRight && this.boostButtonRight.list[0]) {
            this.boostButtonRight.list[0].setFillStyle(color);

            // Add pulsing effect when available
            if (isAvailable && !this.boostButtonRight.pulsing) {
                this.boostButtonRight.pulsing = true;
                this.tweens.add({
                    targets: this.boostButtonRight.list[0],
                    alpha: { from: 0.7, to: 1 },
                    scale: { from: 1, to: 1.05 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            } else if (!isAvailable && this.boostButtonRight.pulsing) {
                this.boostButtonRight.pulsing = false;
                this.tweens.killTweensOf(this.boostButtonRight.list[0]);
                this.boostButtonRight.list[0].setAlpha(0.7);
                this.boostButtonRight.list[0].setScale(1);
            }
        }
    }
    
    updateProgress(percentage) {
        this.progressFill.width = this.progressMaxWidth * percentage;
    }

    // Colored dots on the progress bar showing where every racer is.
    // racers: [{ progress: 0..1, color: 0xRRGGBB, isPlayer: bool }, ...]
    updateRacerMarkers(racers) {
        if (!this.racerMarkers) {
            this.racerMarkers = racers.map(r => {
                const dot = this.add.circle(0, 30, r.isPlayer ? 8 : 5.5, r.color);
                dot.setStrokeStyle(2, r.isPlayer ? 0xFFFFFF : 0x222222);
                this.uiContainer.add(dot);
                return dot;
            });
            // Draw the player's dot on top of rivals
            this.uiContainer.bringToTop(this.racerMarkers[0]);
        }

        racers.forEach((r, i) => {
            const marker = this.racerMarkers[i];
            if (!marker) return;
            const clamped = Math.min(1, Math.max(0, r.progress));
            marker.x = this.progressFill.x + this.progressMaxWidth * clamped;
        });
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