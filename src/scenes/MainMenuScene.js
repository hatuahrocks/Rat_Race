class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Get shared audio manager from registry
        this.audioManager = this.registry.get('audioManager');

        // Start menu music immediately
        if (this.audioManager) {
            this.audioManager.playMusic('music_menu', true);
        }
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Set background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Add decorative background elements
        this.createBackgroundElements();
        
        // Title
        const title = this.add.text(width / 2, height / 3, 'RAT RACER', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        
        // Add bounce animation to title
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3 + 80, 'Side-Scrolling Lane Racing Fun!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);
        
        // Play button
        const playButton = this.createButton(width / 2, height / 2 + 50, 'PLAY', () => {
            this.scene.start('SelectionScene');
        });
        
        // Settings button (placeholder)
        const settingsButton = this.createButton(width / 2, height / 2 + 130, 'SETTINGS', () => {
            console.log('Settings not implemented yet');
        });
        
        // Credits text
        const credits = this.add.text(width / 2, height - 30, 'Made with Phaser 3', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        credits.setOrigin(0.5);

        // Version number in bottom right
        const version = this.add.text(width - 10, height - 10, `v${GameConfig.VERSION}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        version.setOrigin(1, 1);
        
        // Initialize palette swap system for detailed rat
        this.paletteSwap = new PaletteSwap(this);
        
        // Add sample rat animation
        this.createSampleRat();
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.rectangle(0, 0, 250, 60, 0x4444FF);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(4, 0x000000);
        
        // Button text
        const label = this.add.text(0, 0, text, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        label.setOrigin(0.5);
        
        button.add([bg, label]);
        
        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x6666FF);
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x4444FF);
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
        
        bg.on('pointerdown', () => {
            // Execute callback immediately
            callback();
            
            // Add visual feedback animation
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true
            });
        });
        
        return button;
    }
    
    createBackgroundElements() {
        // Add some clouds
        for (let i = 0; i < 3; i++) {
            const cloud = this.add.container(
                Phaser.Math.Between(100, this.cameras.main.width - 100),
                Phaser.Math.Between(50, 150)
            );
            
            const c1 = this.add.circle(0, 0, 40, 0xFFFFFF);
            const c2 = this.add.circle(30, 0, 30, 0xFFFFFF);
            const c3 = this.add.circle(-30, 0, 30, 0xFFFFFF);
            
            cloud.add([c1, c2, c3]);
            cloud.setAlpha(0.7);
            
            // Slow drift
            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(10000, 15000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    createSampleRat() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a sample rat that runs across the screen
        const ratContainer = this.add.container(-100, height - 100);
        
        // Simple car
        const car = this.add.rectangle(0, 10, 50, 20, 0x333333);
        const wheel1 = this.add.circle(-12, 20, 6, 0x222222);
        const wheel2 = this.add.circle(12, 20, 6, 0x222222);
        
        // Create detailed rat with facial features
        const character = Characters[0]; // Use Butter as default
        const detailedRat = this.paletteSwap.createRatSprite(character);
        detailedRat.setScale(0.8);
        detailedRat.y = -8;
        
        ratContainer.add([car, wheel1, wheel2, detailedRat]);
        
        // Animate across screen
        this.tweens.add({
            targets: ratContainer,
            x: width + 100,
            duration: 8000,
            repeat: -1,
            onRepeat: () => {
                // Change rat character on each pass
                const character = Phaser.Math.RND.pick(Characters);
                ratContainer.removeAt(3); // Remove old rat
                const newRat = this.paletteSwap.createRatSprite(character);
                newRat.setScale(0.8);
                newRat.y = -8;
                ratContainer.add(newRat);
            }
        });
        
        // Add wheel rotation
        this.tweens.add({
            targets: [wheel1, wheel2],
            rotation: Math.PI * 2,
            duration: 500,
            repeat: -1
        });
    }
}