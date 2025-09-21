class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
    }
    
    preload() {
        // Placeholder audio loading
        // this.scene.load.audio('engine', 'assets/audio/engine.mp3');
        // this.scene.load.audio('boost', 'assets/audio/boost.mp3');
        // this.scene.load.audio('crash', 'assets/audio/crash.mp3');
        // this.scene.load.audio('ramp', 'assets/audio/ramp.mp3');
        // this.scene.load.audio('music_menu', 'assets/audio/music_menu.mp3');
        // this.scene.load.audio('music_race', 'assets/audio/music_race.mp3');
    }
    
    create() {
        // Initialize sound objects when audio files are available
    }
    
    playSound(key, volume = null) {
        if (this.sounds[key]) {
            const vol = volume || this.sfxVolume;
            this.sounds[key].play({ volume: vol });
        }
    }
    
    playMusic(key, loop = true) {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        
        if (this.sounds[key]) {
            this.currentMusic = this.sounds[key];
            this.currentMusic.play({ 
                volume: this.musicVolume, 
                loop: loop 
            });
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    }
    
    destroy() {
        this.stopMusic();
        for (let key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].destroy();
            }
        }
        this.sounds = {};
    }
}