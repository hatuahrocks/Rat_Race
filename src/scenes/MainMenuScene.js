class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    init() {
        window.debugLogger.log('SCENE', 'MainMenuScene init called');

        // Reset the scene completely
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.input.enabled = true;

        window.debugLogger.log('SCENE', 'MainMenuScene init complete', {
            inputEnabled: this.input.enabled,
            sceneKey: this.scene.key
        });
    }

    shutdown() {
        window.debugLogger.log('SCENE', 'MainMenuScene shutdown called');

        // Clean up when leaving the scene
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();

        window.debugLogger.log('SCENE', 'MainMenuScene shutdown complete');
    }

    create() {
        window.debugLogger.log('SCENE', 'MainMenuScene create called');

        // Get shared audio manager from registry
        this.audioManager = this.registry.get('audioManager');

        // Start menu music immediately
        if (this.audioManager) {
            this.audioManager.playMusic('music_menu', true);
        }
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Sky gradient backdrop with rolling grass hills
        GameArt.createMenuBackdrop(this, 'menu-sky', '#4FACE9', '#C9EDFF');
        this.createGardenScenery();

        // Add decorative background elements
        this.createBackgroundElements();

        // Title with soft drop shadow
        const titleShadow = this.add.text(width / 2 + 4, height / 3 + 5, 'RAT RACE', {
            fontSize: '76px',
            fontFamily: 'Arial Black',
            color: '#000000',
            resolution: 2
        });
        titleShadow.setOrigin(0.5);
        titleShadow.setAlpha(0.25);

        const title = this.add.text(width / 2, height / 3, 'RAT RACE', {
            fontSize: '76px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#7A4A00',
            strokeThickness: 8,
            resolution: 2 // Higher resolution for crisp text
        });
        title.setOrigin(0.5);
        
        // Add bounce animation to title
        this.tweens.add({
            targets: [title, titleShadow],
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
            window.debugLogger.log('INPUT', 'Play button callback triggered');
            window.debugLogger.log('SCENE', 'Attempting to start SelectionScene');

            try {
                this.scene.start('SelectionScene');
                window.debugLogger.log('SCENE', 'SelectionScene start command sent');
            } catch (error) {
                window.debugLogger.log('ERROR', 'Failed to start SelectionScene', error.message);
            }
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

        window.debugLogger.log('SCENE', 'MainMenuScene create complete');
    }
    
    createButton(x, y, text, callback) {
        return GameArt.createButton(this, x, y, 250, 62, text, { color: 0x3D6DEB, fontSize: 28 }, () => {
            window.debugLogger.log('INPUT', `Button "${text}" pressed`);
            callback();
        });
    }

    createGardenScenery() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Rolling hills along the bottom
        const hillBack = this.add.ellipse(width * 0.25, height + 60, width * 1.2, 320, 0x7CB342);
        const hillFront = this.add.ellipse(width * 0.8, height + 90, width * 1.3, 340, 0x66A03A);

        // Scattered flowers on the front hill
        const petals = [0xF06292, 0xFFFFFF, 0xFFB74D, 0xE57373];
        for (let i = 0; i < 9; i++) {
            const fx = 60 + i * (width - 120) / 8;
            const fy = height - 52 + ((i * 37) % 28);
            GameArt.createFlower(this, fx, fy, petals[i % petals.length]);
        }

        // Sun with glow
        this.add.circle(width - 110, 92, 52, 0xFFF59D, 0.35);
        this.add.circle(width - 110, 92, 34, 0xFFEE58);
    }
    
    createBackgroundElements() {
        // Add some drifting clouds
        for (let i = 0; i < 3; i++) {
            const cloud = GameArt.createCloud(
                this,
                Phaser.Math.Between(100, this.cameras.main.width - 100),
                Phaser.Math.Between(40, 150),
                Phaser.Math.FloatBetween(0.8, 1.4)
            );

            // Slow drift
            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-60, 60),
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
        
        // Create a sample rat that drives across the screen
        const ratContainer = this.add.container(-100, height - 95);

        // Ground shadow + detailed car
        const shadow = this.add.ellipse(2, 27, 58, 12, 0x000000, 0.25);
        const car = GameArt.createCar(this, { color: 0xCC0000, accent: 0xFF3333 });

        // Create detailed rat with facial features
        const character = Characters[0]; // Use Butter as default
        const detailedRat = this.paletteSwap.createRatSprite(character);
        detailedRat.setScale(0.8);
        detailedRat.y = -8;

        ratContainer.add([shadow, car, detailedRat]);

        // Animate across screen
        this.tweens.add({
            targets: ratContainer,
            x: width + 100,
            duration: 8000,
            repeat: -1,
            onRepeat: () => {
                // Change rat character on each pass
                const character = Phaser.Math.RND.pick(Characters);
                ratContainer.removeAt(2); // Remove old rat
                const newRat = this.paletteSwap.createRatSprite(character);
                newRat.setScale(0.8);
                newRat.y = -8;
                ratContainer.add(newRat);
            }
        });

        // Gentle bobbing as it drives
        this.tweens.add({
            targets: detailedRat,
            y: detailedRat.y - 3,
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}