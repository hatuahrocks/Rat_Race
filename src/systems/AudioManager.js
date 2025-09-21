class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.currentEngine = null;
        this.engineTransitionTween = null;
        this.soundCooldowns = {}; // Track when sounds are playing
    }
    
    preload() {
        // Sound Effects
        this.scene.load.audio('countdown', 'assets/audio/countdown.mp3');
        this.scene.load.audio('bump', 'assets/audio/bump.mp3');
        this.scene.load.audio('ramp', 'assets/audio/ramp.mp3');
        this.scene.load.audio('push', 'assets/audio/push.mp3');
        this.scene.load.audio('boost', 'assets/audio/boost.mp3');
        this.scene.load.audio('powerup', 'assets/audio/powerup.mp3');

        // Engine Sounds
        this.scene.load.audio('engine_idle', 'assets/audio/engine_idle.mp3');
        this.scene.load.audio('engine_mid', 'assets/audio/engine_mid.mp3');
        this.scene.load.audio('engine_high', 'assets/audio/engine_high.mp3');
        this.scene.load.audio('engine_drag', 'assets/audio/engine_drag.mp3');

        // Music (Optional)
        this.scene.load.audio('music_menu', 'assets/audio/music_menu.mp3');
        this.scene.load.audio('music_race', 'assets/audio/music_race.mp3');
    }
    
    create() {
        // Initialize sound objects
        const soundKeys = [
            'countdown', 'bump', 'ramp', 'push', 'boost', 'powerup',
            'engine_idle', 'engine_mid', 'engine_high', 'engine_drag',
            'music_menu', 'music_race'
        ];

        soundKeys.forEach(key => {
            if (this.scene.cache.audio.exists(key)) {
                this.sounds[key] = this.scene.sound.add(key);
            }
        });
    }
    
    playSound(key, volume = null) {
        if (this.sounds[key]) {
            const vol = volume || this.sfxVolume;
            this.sounds[key].play({ volume: vol });
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
    
    // Engine sound management
    playEngineSound(engineKey, loop = true, volume = null) {
        if (this.currentEngine) {
            this.currentEngine.stop();
        }

        if (this.sounds[engineKey]) {
            this.currentEngine = this.sounds[engineKey];
            const vol = volume || this.sfxVolume * 0.6; // Engine sounds slightly quieter
            this.currentEngine.play({
                volume: vol,
                loop: loop
            });
        }
    }

    transitionEngineSound(newEngineKey, duration = 0.3) {
        if (this.engineTransitionTween) {
            this.engineTransitionTween.stop();
        }

        const oldEngine = this.currentEngine;
        if (oldEngine && this.sounds[newEngineKey]) {
            // Fade out old engine
            this.engineTransitionTween = this.scene.tweens.add({
                targets: oldEngine,
                volume: 0,
                duration: duration * 1000,
                onComplete: () => {
                    oldEngine.stop();
                    this.playEngineSound(newEngineKey);

                    // Fade in new engine
                    if (this.currentEngine) {
                        this.currentEngine.setVolume(0);
                        this.scene.tweens.add({
                            targets: this.currentEngine,
                            volume: this.sfxVolume * 0.6,
                            duration: duration * 1000
                        });
                    }
                }
            });
        } else {
            this.playEngineSound(newEngineKey);
        }
    }

    stopEngineSound() {
        if (this.currentEngine) {
            this.currentEngine.stop();
            this.currentEngine = null;
        }
        if (this.engineTransitionTween) {
            this.engineTransitionTween.stop();
            this.engineTransitionTween = null;
        }
    }

    // Countdown sequence
    playCountdown(callback = null) {
        if (this.sounds['countdown']) {
            this.sounds['countdown'].play({ volume: this.sfxVolume });
            if (callback) {
                // Assuming countdown is about 4 seconds
                this.scene.time.delayedCall(4000, callback);
            }
        } else if (callback) {
            // Fallback if no countdown sound
            callback();
        }
    }

    destroy() {
        this.stopMusic();
        this.stopEngineSound();
        for (let key in this.sounds) {
            if (this.sounds[key]) {
                this.sounds[key].destroy();
            }
        }
        this.sounds = {};
    }
}