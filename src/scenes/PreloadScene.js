class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        // Initialize audio manager for preloading
        this.audioManager = new AudioManager(this);
        this.audioManager.preload();

        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        const assetText = this.add.text(width / 2, height / 2 + 50, '', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        assetText.setOrigin(0.5, 0.5);
        
        // Update progress bar
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading: ' + file.key);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
        
        // Load placeholder assets (in production, these would be actual files)
        // For now, we'll create them programmatically in the create phase
        this.createPlaceholderAssets();
    }
    
    createPlaceholderAssets() {
        // Create placeholder textures programmatically
        // In production, these would be loaded from files
    }
    
    create() {
        // Initialize audio manager and create sound objects
        this.audioManager.create();

        // Create placeholder graphics
        this.createRatTextures();
        this.createVehicleTextures();
        this.createObstacleTextures();
        this.createUITextures();

        // Initialize systems
        this.registry.set('selectedCharacter', Characters[0]);
        this.registry.set('currentTheme', 'living_room');

        // Store audio manager globally so other scenes can access it
        this.registry.set('audioManager', this.audioManager);

        // Move to main menu
        this.scene.start('MainMenuScene');
    }
    
    createRatTextures() {
        // Create a simple rat texture for each character
        Characters.forEach(character => {
            const graphics = this.add.graphics();
            const rt = this.add.renderTexture(0, 0, 64, 64);
            
            // Draw simple rat shape
            graphics.fillStyle(Phaser.Display.Color.HexStringToColor(character.primaryColor).color);
            graphics.fillCircle(32, 32, 20);
            graphics.fillStyle(Phaser.Display.Color.HexStringToColor(character.secondaryColor).color);
            graphics.fillCircle(32, 28, 12);
            
            rt.draw(graphics, 0, 0);
            rt.saveTexture('rat_' + character.id);
            
            graphics.destroy();
            rt.destroy();
        });
    }
    
    createVehicleTextures() {
        const graphics = this.add.graphics();
        const rt = this.add.renderTexture(0, 0, 80, 60);
        
        // Draw simple car
        graphics.fillStyle(0x444444);
        graphics.fillRect(10, 20, 60, 25);
        graphics.fillStyle(0x222222);
        graphics.fillCircle(25, 45, 8);
        graphics.fillCircle(55, 45, 8);
        
        rt.draw(graphics, 0, 0);
        rt.saveTexture('vehicle_base');
        
        graphics.destroy();
        rt.destroy();
    }
    
    createObstacleTextures() {
        const obstacleTypes = ['generic', 'crate', 'cone'];
        
        obstacleTypes.forEach(type => {
            const graphics = this.add.graphics();
            const rt = this.add.renderTexture(0, 0, 50, 50);
            
            switch(type) {
                case 'crate':
                    graphics.fillStyle(0x8B4513);
                    graphics.fillRect(5, 5, 40, 40);
                    break;
                case 'cone':
                    graphics.fillStyle(0xFF6600);
                    graphics.fillTriangle(25, 5, 10, 45, 40, 45);
                    break;
                default:
                    graphics.fillStyle(0x666666);
                    graphics.fillRect(10, 10, 30, 30);
            }
            
            rt.draw(graphics, 0, 0);
            rt.saveTexture('obstacle_' + type);
            
            graphics.destroy();
            rt.destroy();
        });
    }
    
    createUITextures() {
        // Create button texture
        const graphics = this.add.graphics();
        const rt = this.add.renderTexture(0, 0, 200, 60);
        
        graphics.fillStyle(0x4444FF);
        graphics.fillRoundedRect(0, 0, 200, 60, 10);
        
        rt.draw(graphics, 0, 0);
        rt.saveTexture('button_blue');
        
        graphics.destroy();
        rt.destroy();
    }
}