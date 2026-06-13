class RaceEndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RaceEndScene' });
    }
    
    init(data) {
        this.position = data.position || 1;
        this.totalRacers = data.totalRacers || 4;
        this.character = data.character || Characters[0];
        this.stats = data.stats || null;
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Set background
        this.cameras.main.setBackgroundColor('#2C3E50');
        GameArt.createMenuBackdrop(this, 'menu-night', '#1B2735', '#3E5871');
        
        // Add confetti effect if winner
        if (this.position === 1) {
            this.createConfetti();
        }
        
        // Results title
        const titleText = this.position === 1 ? 'WINNER!' : 'RACE COMPLETE!';
        const title = this.add.text(width / 2, 100, titleText, {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            color: this.position === 1 ? '#FFD700' : '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        
        // Add bounce animation for winner
        if (this.position === 1) {
            this.tweens.add({
                targets: title,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
        
        // Position display
        const positionText = this.getPositionText();
        const position = this.add.text(width / 2, 200, positionText, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        position.setOrigin(0.5);
        
        // Initialize palette swap system for detailed character display
        this.paletteSwap = new PaletteSwap(this);
        
        // Character display
        this.createCharacterDisplay();
        
        // Trophy or medal
        this.createAward();
        
        // Buttons
        this.createButtons();
        
        // Stats display
        this.createStats();
    }
    
    getPositionText() {
        const suffix = this.getPositionSuffix(this.position);
        return `You finished ${this.position}${suffix} out of ${this.totalRacers}!`;
    }
    
    getPositionSuffix(position) {
        if (position === 1) return 'st';
        if (position === 2) return 'nd';
        if (position === 3) return 'rd';
        return 'th';
    }
    
    createCharacterDisplay() {
        const width = this.cameras.main.width;
        const container = this.add.container(width / 2, 350);

        // Get the selected car color from registry
        const selectedCarColor = this.registry.get('selectedCarColor') || { color: 0x333333, accent: 0x444444 };

        // Ground shadow + the real in-game car art, enlarged
        const shadow = this.add.ellipse(3, 42, 90, 18, 0x000000, 0.3);
        const car = GameArt.createCar(this, selectedCarColor);
        car.setScale(1.55);

        // Create detailed rat using the same system as in-game
        const detailedRat = this.paletteSwap.createRatSprite(this.character);
        detailedRat.setScale(1.5); // Make it larger for the finish screen
        detailedRat.y = -10; // Position it in the car

        container.add([shadow, car, detailedRat]);
        
        // Add animation
        this.tweens.add({
            targets: container,
            y: container.y + 10,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Character name
        const name = this.add.text(width / 2, 420, this.character.name, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        name.setOrigin(0.5);
    }
    
    createAward() {
        const width = this.cameras.main.width;
        const awardContainer = this.add.container(width / 2 - 200, 300);
        
        if (this.position === 1) {
            // Gold trophy
            const base = this.add.rectangle(0, 40, 40, 20, 0x654321);
            const stem = this.add.rectangle(0, 20, 20, 30, 0xFFD700);
            const cup = this.add.ellipse(0, 0, 60, 40, 0xFFD700);
            const handle1 = this.add.arc(-30, 0, 15, 0, 180, false, 0xFFD700);
            const handle2 = this.add.arc(30, 0, 15, 0, 180, true, 0xFFD700);
            
            awardContainer.add([base, stem, cup, handle1, handle2]);
            
            // Add sparkle effect
            this.createSparkle(awardContainer);
        } else if (this.position === 2) {
            // Silver medal
            const medal = this.add.circle(0, 0, 35, 0xC0C0C0);
            medal.setStrokeStyle(4, 0x808080);
            const text = this.add.text(0, 0, '2', {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF'
            });
            text.setOrigin(0.5);
            awardContainer.add([medal, text]);
        } else if (this.position === 3) {
            // Bronze medal
            const medal = this.add.circle(0, 0, 35, 0xCD7F32);
            medal.setStrokeStyle(4, 0x8B4513);
            const text = this.add.text(0, 0, '3', {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF'
            });
            text.setOrigin(0.5);
            awardContainer.add([medal, text]);
        } else {
            // Participation ribbon
            const ribbon = this.add.rectangle(0, 0, 50, 70, 0xFF69B4);
            const stripe = this.add.rectangle(0, 0, 10, 70, 0xFFFFFF);
            awardContainer.add([ribbon, stripe]);
        }
    }
    
    createSparkle(container) {
        for (let i = 0; i < 4; i++) {
            const sparkle = this.add.star(
                Phaser.Math.Between(-40, 40),
                Phaser.Math.Between(-40, 40),
                4, 2, 8,
                0xFFFFFF
            );
            sparkle.setAlpha(0);
            container.add(sparkle);
            
            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0, to: 1 },
                scaleX: { from: 0, to: 1 },
                scaleY: { from: 0, to: 1 },
                duration: 500,
                delay: i * 200,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    createButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Play Again button
        const playAgainBtn = this.createButton(width / 2 - 130, height - 70, 'PLAY AGAIN', () => {
            console.log('Play Again clicked');
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });

        // Menu button
        const menuBtn = this.createButton(width / 2 + 130, height - 70, 'MAIN MENU', () => {
            console.log('Main Menu clicked from RaceEndScene');
            // Stop UI scene if it's running
            this.scene.stop('UIScene');
            // Start fresh main menu
            this.scene.start('MainMenuScene');
        });
    }

    createButton(x, y, text, callback) {
        return GameArt.createButton(this, x, y, 220, 54, text, { color: 0x3D6DEB, fontSize: 20 }, callback);
    }
    
    createStats() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Simple stats display (kept above the buttons)
        const statsContainer = this.add.container(width / 2, height - 270);
        
        const statsText = this.add.text(0, 0, 'Race Statistics', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        statsText.setOrigin(0.5);
        
        // Real values tracked during the race (px/s scaled to a fun mph-style number)
        const s = this.stats;
        let stats = [];
        let isNewRecord = false;

        if (s) {
            // Personal best per character, persisted in localStorage
            const bestTimes = this.loadBestTimes();
            const previousBest = bestTimes[this.character.name];
            if (previousBest === undefined || s.time < previousBest) {
                isNewRecord = true;
                bestTimes[this.character.name] = Math.round(s.time * 10) / 10;
                this.saveBestTimes(bestTimes);
            }

            const timeLine = 'Time: ' + s.time.toFixed(1) + 's' +
                (isNewRecord ? '' : '   (best: ' + previousBest.toFixed(1) + 's)');

            stats = [
                timeLine,
                'Top Speed: ' + Math.round(s.topSpeed / 3.5) + ' mph',
                'Boosts Used: ' + s.boostsUsed,
                'Strawberries: ' + s.strawberries,
                'Obstacles Hit: ' + s.obstaclesHit
            ];
        }

        // Celebrate a new personal best
        if (isNewRecord) {
            const record = this.add.text(0, -32, 'NEW RECORD!', {
                fontSize: '22px',
                fontFamily: 'Arial Black',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 4
            });
            record.setOrigin(0.5);
            statsContainer.add(record);

            this.tweens.add({
                targets: record,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 400,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
        
        stats.forEach((stat, index) => {
            const statText = this.add.text(0, 30 + (index * 25), stat, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FFFFFF'
            });
            statText.setOrigin(0.5);
            statsContainer.add(statText);
        });

        statsContainer.add(statsText);
    }

    loadBestTimes() {
        try {
            return JSON.parse(localStorage.getItem('ratrace_best_times')) || {};
        } catch (e) {
            return {};
        }
    }

    saveBestTimes(times) {
        try {
            localStorage.setItem('ratrace_best_times', JSON.stringify(times));
        } catch (e) {
            // Private browsing / storage disabled - records just aren't kept
        }
    }
    
    createConfetti() {
        // Create falling confetti for winners
        for (let i = 0; i < 50; i++) {
            const confetti = this.add.rectangle(
                Phaser.Math.Between(0, this.cameras.main.width),
                Phaser.Math.Between(-200, 0),
                Phaser.Math.Between(5, 15),
                Phaser.Math.Between(5, 15),
                Phaser.Math.RND.pick([0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF])
            );
            
            confetti.setRotation(Phaser.Math.Between(0, 360));
            
            this.tweens.add({
                targets: confetti,
                y: this.cameras.main.height + 100,
                rotation: confetti.rotation + Phaser.Math.Between(-5, 5),
                duration: Phaser.Math.Between(3000, 6000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1
            });
        }
    }
}