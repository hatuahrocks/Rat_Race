class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isSwiping = false;
        this.boostPressed = false;
        this.boostMode = 'hold'; // 'hold' or 'partial'

        // New control modes
        this.fingerTracing = false;
        this.currentPointerY = 0;
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
            this.fingerTracing = true;
            this.currentPointerY = pointer.y;

            // Check if boost button was pressed (right third of screen)
            if (pointer.x > this.scene.game.config.width * 0.66) {
                this.onBoostStart();
                this.fingerTracing = false; // Don't trace when boosting
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (!this.isSwiping) return;

            // Finger tracing mode - continuous lane control
            if (this.fingerTracing && pointer.x < this.scene.game.config.width * 0.66) {
                this.currentPointerY = pointer.y;
                this.handleFingerTracing();
                return;
            }

            const deltaY = pointer.y - this.touchStartY;
            const deltaX = pointer.x - this.touchStartX;

            // Check for vertical swipe (fallback for quick gestures)
            if (Math.abs(deltaY) > GameConfig.SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
                if (deltaY < 0) {
                    this.onSwipeUp();
                } else {
                    this.onSwipeDown();
                }
                this.isSwiping = false;
                this.fingerTracing = false;
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            this.isSwiping = false;
            this.fingerTracing = false;

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

    handleFingerTracing() {
        // Map finger Y position to target lane
        // Lane positions from GameConfig.EXTENDED_LANE_POSITIONS: [184, 264, 344, 424, 504, 584]
        const lanePositions = [184, 264, 344, 424, 504, 584];
        let targetLane = 1; // Default to lane 1 (second lane)

        // Find closest lane to finger position
        let minDistance = Infinity;
        for (let i = 0; i < lanePositions.length; i++) {
            const distance = Math.abs(this.currentPointerY - lanePositions[i]);
            if (distance < minDistance) {
                minDistance = distance;
                targetLane = i - 1; // Convert to extended lane (-1 to 4)
            }
        }

        // Emit lane change event with target lane
        this.scene.events.emit('laneChangeToTarget', targetLane);
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