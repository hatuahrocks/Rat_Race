// Wait for GameConfig to be available
if (typeof GameConfig === 'undefined') {
    console.error('GameConfig not loaded yet! Waiting...');
    // Wait a bit and try again
    setTimeout(() => {
        if (typeof GameConfig === 'undefined') {
            console.error('GameConfig still not available after wait');
            return;
        }
        initializeGame();
    }, 100);
} else {
    initializeGame();
}

function initializeGame() {
    const config = {
        type: Phaser.AUTO,
        width: GameConfig.VIEWPORT.WIDTH,
        height: GameConfig.VIEWPORT.HEIGHT,
        parent: 'phaser-game',
        backgroundColor: '#87CEEB',
        antialias: true,
        antialiasGL: true,
        render: {
            antialias: true,
            antialiasGL: true,
            mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
            roundPixels: false
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        PreloadScene,
        MainMenuScene,
        SelectionScene,
        CarColorSelectionScene,
        GameScene,
        UIScene,
        RaceEndScene
    ],
    input: {
        activePointers: 3
    }
};

const game = new Phaser.Game(config);
}