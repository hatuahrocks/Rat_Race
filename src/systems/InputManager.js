class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isSwiping = false;
        this.boostPressed = false;
        this.boostMode = 'hold'; // 'hold' or 'partial'

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

            // Check if boost button was pressed (right third of screen)
            if (pointer.x > this.scene.game.config.width * 0.66) {
                this.onBoostStart();
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (!this.isSwiping) return;

            const deltaY = pointer.y - this.touchStartY;
            const deltaX = pointer.x - this.touchStartX;

            // Check for vertical swipe
            if (Math.abs(deltaY) > GameConfig.SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
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

            // Release boost if in hold mode
            if (this.boostMode === 'hold' && pointer.x > this.scene.game.config.width * 0.66) {
                this.onBoostEnd();
            }
        });
    }
    
    onSwipeUp() {
        this.scene.events.emit('laneChangeUp');
    }
    
    onSwipeDown() {
        this.scene.events.emit('laneChangeDown');
    }
    
    onBoostStart() {
        if (this.boostMode === 'hold') {
            this.boostPressed = true;
            this.scene.events.emit('boostStart');
        } else {
            this.scene.events.emit('boostPartial');
        }
    }
    
    onBoostEnd() {
        this.boostPressed = false;
        this.scene.events.emit('boostEnd');
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

        // Boost controls
        if (this.boostMode === 'hold') {
            if (this.spacebar.isDown || this.cursors.right.isDown) {
                if (!this.boostPressed) {
                    this.boostPressed = true;
                    this.scene.events.emit('boostStart');
                }
            } else if (this.boostPressed) {
                this.boostPressed = false;
                this.scene.events.emit('boostEnd');
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.spacebar) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.scene.events.emit('boostPartial');
            }
        }
    }
    
    destroy() {
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
    }
}