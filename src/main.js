const config = {
    type: Phaser.AUTO,
    width: GameConfig.VIEWPORT.WIDTH,
    height: GameConfig.VIEWPORT.HEIGHT,
    parent: 'phaser-game',
    backgroundColor: '#87CEEB',
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
        GameScene,
        UIScene,
        RaceEndScene
    ],
    input: {
        activePointers: 3
    }
};

const game = new Phaser.Game(config);