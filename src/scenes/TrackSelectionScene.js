// Final pre-race screen: pick a track theme and a difficulty.
// Selections are stored in the registry (read by GameScene) and persisted
// to localStorage so they become the defaults next session.
class TrackSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TrackSelectionScene' });
    }

    init() {
        this.themeCards = [];
        this.difficultyButtons = [];
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.input.enabled = true;
    }

    shutdown() {
        this.input.removeAllListeners();
        this.tweens.killAll();
        this.time.removeAllEvents();
    }

    create() {
        this.audioManager = this.registry.get('audioManager');
        if (this.audioManager && !this.audioManager.currentMusic) {
            this.audioManager.playMusic('music_menu', true);
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.setBackgroundColor('#2C3E50');
        GameArt.createMenuBackdrop(this, 'menu-slate', '#243B55', '#3E6B73');

        const title = this.add.text(width / 2, 38, 'CHOOSE YOUR TRACK', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Restore last-used selections as defaults
        const prefs = this.loadPrefs();
        this.selectedThemeId = prefs.theme || 'garden';
        this.selectedDifficulty = prefs.difficulty || 'medium';

        this.createThemeCards();
        this.createDifficultyPicker();

        // Start button
        GameArt.createButton(this, width / 2, height - 50, 220, 52, 'START RACE!', { color: 0x2EB94E, fontSize: 22 }, () => {
            this.registry.set('currentTheme', this.selectedThemeId);
            this.registry.set('difficulty', this.selectedDifficulty);
            this.savePrefs();
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });

        // Back button
        this.createBackButton(50, 50);
    }

    createThemeCards() {
        const width = this.cameras.main.width;
        const themes = Object.values(LevelThemes);
        const cardWidth = 230;
        const cardHeight = 230;
        const spacing = 30;
        const gridWidth = themes.length * cardWidth + (themes.length - 1) * spacing;
        const startX = (width - gridWidth) / 2 + cardWidth / 2;
        const y = 220;

        themes.forEach((theme, index) => {
            const x = startX + index * (cardWidth + spacing);
            const card = this.add.container(x, y);

            const cardShadow = this.add.rectangle(5, 7, cardWidth, cardHeight, 0x000000, 0.3);

            const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xF0F0F0);
            bg.setStrokeStyle(4, 0x000000);
            bg.setInteractive({ useHandCursor: true });

            const highlight = this.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xFFD700);
            highlight.setStrokeStyle(6, 0xFFD700);
            highlight.setVisible(false);
            highlight.setAlpha(0.3);

            // Mini track preview: sky / horizon band / shoulders / road with dashes
            const preview = this.add.container(0, -55);
            const pv = theme.preview;
            const pw = cardWidth - 30;
            const sky = this.add.rectangle(0, -28, pw, 44, Phaser.Display.Color.HexStringToColor(pv.sky).color);
            const band = this.add.rectangle(0, -1, pw, 10, Phaser.Display.Color.HexStringToColor(pv.band).color);
            const shoulderTop = this.add.rectangle(0, 7, pw, 6, Phaser.Display.Color.HexStringToColor(pv.shoulder).color);
            const road = this.add.rectangle(0, 26, pw, 32, Phaser.Display.Color.HexStringToColor(pv.road).color);
            const shoulderBottom = this.add.rectangle(0, 45, pw, 6, Phaser.Display.Color.HexStringToColor(pv.shoulder).color);
            preview.add([sky, band, shoulderTop, road, shoulderBottom]);
            // Lane dashes + a little car on the preview road
            for (let dx = -pw / 2 + 12; dx < pw / 2 - 6; dx += 28) {
                preview.add(this.add.rectangle(dx, 26, 14, 2, 0xFFFFFF, 0.7));
            }
            const miniCar = GameArt.createCar(this, { color: 0xCC0000, accent: 0xFF3333 });
            miniCar.setScale(0.45);
            miniCar.y = 32;
            miniCar.x = -pw / 4;
            preview.add(miniCar);

            const name = this.add.text(0, 38, theme.name, {
                fontSize: '20px',
                fontFamily: 'Arial Black',
                color: '#000000'
            });
            name.setOrigin(0.5);

            const description = this.add.text(0, 70, theme.description, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#555555',
                align: 'center'
            });
            description.setOrigin(0.5);

            card.add([cardShadow, highlight, bg, preview, name, description]);
            card.bg = bg;
            card.highlight = highlight;
            card.themeId = theme.id;

            bg.on('pointerdown', () => this.selectTheme(theme.id));
            bg.on('pointerover', () => {
                if (this.selectedThemeId !== theme.id) bg.setFillStyle(0xE0E0E0);
            });
            bg.on('pointerout', () => {
                if (this.selectedThemeId !== theme.id) bg.setFillStyle(0xF0F0F0);
            });

            this.themeCards.push(card);
        });

        this.selectTheme(this.selectedThemeId);
    }

    selectTheme(themeId) {
        this.selectedThemeId = themeId;
        this.themeCards.forEach(card => {
            const selected = card.themeId === themeId;
            card.highlight.setVisible(selected);
            card.bg.setFillStyle(selected ? 0xFFFACD : 0xF0F0F0);
        });
    }

    createDifficultyPicker() {
        const width = this.cameras.main.width;
        const y = 460;

        const label = this.add.text(width / 2, y - 42, 'DIFFICULTY', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        label.setOrigin(0.5);

        const keys = Object.keys(GameConfig.DIFFICULTY);
        const btnWidth = 150;
        const spacing = 24;
        const totalWidth = keys.length * btnWidth + (keys.length - 1) * spacing;
        const startX = (width - totalWidth) / 2 + btnWidth / 2;

        keys.forEach((key, index) => {
            const diff = GameConfig.DIFFICULTY[key];
            const x = startX + index * (btnWidth + spacing);
            const button = this.add.container(x, y);

            const bg = this.add.rectangle(0, 0, btnWidth, 48, 0x3A4A5C);
            bg.setStrokeStyle(3, 0x000000);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(0, -7, diff.label, {
                fontSize: '18px',
                fontFamily: 'Arial Black',
                color: '#FFFFFF'
            });
            text.setOrigin(0.5);

            const detail = this.add.text(0, 13, `${diff.aiCount + 1} racers`, {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#C9D4E0'
            });
            detail.setOrigin(0.5);

            button.add([bg, text, detail]);
            button.bg = bg;
            button.diffKey = key;

            bg.on('pointerdown', () => this.selectDifficulty(key));
            bg.on('pointerover', () => {
                if (this.selectedDifficulty !== key) bg.setFillStyle(0x4D617A);
            });
            bg.on('pointerout', () => {
                if (this.selectedDifficulty !== key) bg.setFillStyle(0x3A4A5C);
            });

            this.difficultyButtons.push(button);
        });

        this.selectDifficulty(this.selectedDifficulty);
    }

    selectDifficulty(key) {
        // Guard against stale stored values
        if (!GameConfig.DIFFICULTY[key]) key = 'medium';
        this.selectedDifficulty = key;
        this.difficultyButtons.forEach(button => {
            const selected = button.diffKey === key;
            button.bg.setFillStyle(selected ? 0xD99A1B : 0x3A4A5C);
            button.bg.setStrokeStyle(3, selected ? 0xFFD700 : 0x000000);
        });
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

        bg.on('pointerdown', () => this.scene.start('CarColorSelectionScene'));
        bg.on('pointerover', () => bg.setFillStyle(0xFF6666));
        bg.on('pointerout', () => bg.setFillStyle(0xFF4444));

        return button;
    }

    loadPrefs() {
        try {
            return JSON.parse(localStorage.getItem('ratrace_prefs')) || {};
        } catch (e) {
            return {};
        }
    }

    savePrefs() {
        try {
            localStorage.setItem('ratrace_prefs', JSON.stringify({
                theme: this.selectedThemeId,
                difficulty: this.selectedDifficulty
            }));
        } catch (e) {
            // Storage unavailable - prefs just aren't remembered
        }
    }
}
