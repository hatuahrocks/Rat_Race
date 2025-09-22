class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isSwiping = false;
        this.boostPressed = false;
        this.boostMode = 'tap'; // Changed to 'tap' for single-tap full boost

        this.keyboardHoldTimer = 0;
        this.keyboardHoldDelay = 300; // ms between continuous lane changes

        this.setupKeyboard();
        this.setupTouch();
    }
    
    setupKeyboard() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spacebar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    setupTouch() {
        this.scene.input.on('pointerdown', (pointer) => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
            this.isSwiping = true;
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (!this.isSwiping) return;

            const deltaY = pointer.y - this.touchStartY;
            const deltaX = pointer.x - this.touchStartX;

            // Check for horizontal swipe (forward for boost, backward for brake)
            if (Math.abs(deltaX) > GameConfig.SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    this.onSwipeForward();
                } else {
                    this.onSwipeBackward();
                }
                this.isSwiping = false;
            }
            // Check for vertical swipe (lane changes)
            else if (Math.abs(deltaY) > GameConfig.SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
                if (deltaY < 0) {
                    this.onSwipeUp();
                } else {
                    this.onSwipeDown();
                }
                this.isSwiping = false;
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            this.isSwiping = false;
        });
    }
    
    onSwipeUp() {
        this.scene.events.emit('laneChangeUp');
    }
    
    onSwipeDown() {
        this.scene.events.emit('laneChangeDown');
    }

    onSwipeForward() {
        this.scene.events.emit('boostTap');
    }

    onSwipeBackward() {
        this.scene.events.emit('brake');
    }

    onBoostTap() {
        this.scene.events.emit('boostTap');
    }

    
    update() {
        // Keyboard controls with continuous lane changing
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.onSwipeUp();
            this.keyboardHoldTimer = this.scene.time.now + this.keyboardHoldDelay;
        } else if (this.cursors.up.isDown && this.scene.time.now > this.keyboardHoldTimer) {
            this.onSwipeUp();
            this.keyboardHoldTimer = this.scene.time.now + this.keyboardHoldDelay;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.onSwipeDown();
            this.keyboardHoldTimer = this.scene.time.now + this.keyboardHoldDelay;
        } else if (this.cursors.down.isDown && this.scene.time.now > this.keyboardHoldTimer) {
            this.onSwipeDown();
            this.keyboardHoldTimer = this.scene.time.now + this.keyboardHoldDelay;
        }

        // Boost controls - tap to use full boost when available
        if (Phaser.Input.Keyboard.JustDown(this.spacebar) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.scene.events.emit('boostTap');
        }

        // Brake controls - left arrow to brake
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.scene.events.emit('brake');
        }
    }
    
    destroy() {
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
    }
}