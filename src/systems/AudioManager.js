class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.25;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.soundCooldowns = {}; // Track when sounds are playing
    }
    
    preload() {
        // Set up error handler for missing audio
        this.scene.load.on('loaderror', (file) => {
            console.log(`Audio file not found: ${file.src} - continuing without audio`);
        });

        // Load existing audio files
        this.scene.load.audio('bump', 'assets/audio/bump.mp3');
        this.scene.load.audio('ramp', 'assets/audio/ramp.mp3');
        this.scene.load.audio('push', 'assets/audio/push.mp3');
        this.scene.load.audio('powerup', 'assets/audio/powerup.mp3');
        this.scene.load.audio('music_menu', 'assets/audio/music_menu.mp3');
        this.scene.load.audio('brake', 'assets/audio/brake.mp3');
        this.scene.load.audio('manualboost', 'assets/audio/manualboost.mp3');
        this.scene.load.audio('bump2', 'assets/audio/bump2.mp3');

        this.scene.load.audio('boost', 'assets/audio/boost.mp3');
        this.scene.load.audio('music_race', 'assets/audio/music_race.wav');
    }
    
    create() {
        // Initialize sound objects
        const soundKeys = [
            'bump', 'ramp', 'push', 'boost', 'powerup',
            'music_menu', 'music_race', 'brake', 'manualboost', 'bump2'
        ];

        soundKeys.forEach(key => {
            if (this.scene.cache.audio.exists(key)) {
                this.sounds[key] = this.scene.sound.add(key);
            }
        });
    }
    
    playSound(key, volume = null) {
        console.log(`AudioManager: Attempting to play sound "${key}"`);
        if (this.sounds[key]) {
            const vol = volume || this.sfxVolume;
            this.sounds[key].play({ volume: vol });
            console.log(`AudioManager: Playing "${key}" at volume ${vol}`);
        } else {
            console.warn(`AudioManager: Sound "${key}" not found!`);
        }
    }

    playSoundWithCooldown(key, cooldownMs = 500, volume = null) {
        const now = Date.now();

        // Check if sound is on cooldown
        if (this.soundCooldowns[key] && now < this.soundCooldowns[key]) {
            return false; // Sound blocked by cooldown
        }

        // Play the sound
        if (this.sounds[key]) {
            const vol = volume || this.sfxVolume;
            this.sounds[key].play({ volume: vol });

            // Set cooldown
            this.soundCooldowns[key] = now + cooldownMs;
            return true; // Sound played successfully
        }

        return false; // Sound not found
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