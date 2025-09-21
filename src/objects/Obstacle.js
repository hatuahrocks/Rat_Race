class Obstacle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, lane) {
        super(scene, x, y);
        
        this.scene = scene;
        this.type = type;
        this.lane = lane;
        this.isActive = true;
        
        this.createObstacle();
        scene.add.existing(this);
    }
    
    createObstacle() {
        let obstacle;
        
        switch(this.type) {
            case 'sofa':
                obstacle = this.createSofa();
                break;
            case 'tv':
                obstacle = this.createTV();
                break;
            case 'chair':
                obstacle = this.createChair();
                break;
            case 'table':
                obstacle = this.createTable();
                break;
            case 'lawnmower':
                obstacle = this.createLawnmower();
                break;
            case 'crab':
                obstacle = this.createCrab();
                break;
            case 'sandcastle':
                obstacle = this.createSandcastle();
                break;
            case 'float':
                obstacle = this.createFloat();
                break;
            default:
                obstacle = this.createGenericObstacle();
        }
        
        this.add(obstacle);
        this.setSize(40, 30);
    }
    
    createSofa() {
        const base = this.scene.add.rectangle(0, 5, 60, 25, 0x8B4513);
        const back = this.scene.add.rectangle(0, -8, 60, 15, 0x654321);
        const cushionLeft = this.scene.add.rectangle(-15, 2, 20, 18, 0x9B5523);
        const cushionRight = this.scene.add.rectangle(15, 2, 20, 18, 0x9B5523);
        return this.scene.add.container(0, 0, [base, back, cushionLeft, cushionRight]);
    }
    
    createTV() {
        const screen = this.scene.add.rectangle(0, 0, 45, 35, 0x222222);
        const frame = this.scene.add.rectangle(0, 0, 50, 40, 0x444444);
        const stand = this.scene.add.rectangle(0, 22, 20, 8, 0x333333);
        const screenGlare = this.scene.add.rectangle(-8, -8, 15, 15, 0x4444AA);
        screenGlare.setAlpha(0.3);
        return this.scene.add.container(0, 0, [stand, frame, screen, screenGlare]);
    }
    
    createChair() {
        const seat = this.scene.add.rectangle(0, 5, 30, 20, 0x8B4513);
        const back = this.scene.add.rectangle(0, -10, 30, 25, 0x654321);
        const legFL = this.scene.add.rectangle(-10, 15, 4, 15, 0x4A2C17);
        const legFR = this.scene.add.rectangle(10, 15, 4, 15, 0x4A2C17);
        const legBL = this.scene.add.rectangle(-10, -5, 4, 10, 0x4A2C17);
        const legBR = this.scene.add.rectangle(10, -5, 4, 10, 0x4A2C17);
        return this.scene.add.container(0, 0, [legBL, legBR, legFL, legFR, seat, back]);
    }
    
    createTable() {
        const top = this.scene.add.rectangle(0, 0, 50, 35, 0x8B6914);
        const legLeft = this.scene.add.rectangle(-20, 15, 6, 20, 0x654321);
        const legRight = this.scene.add.rectangle(20, 15, 6, 20, 0x654321);
        return this.scene.add.container(0, 0, [legLeft, legRight, top]);
    }
    
    createLawnmower() {
        const body = this.scene.add.rectangle(0, 0, 40, 30, 0xFF4444);
        const engine = this.scene.add.rectangle(0, -5, 25, 15, 0x333333);
        const wheelFront = this.scene.add.circle(-12, 15, 8, 0x222222);
        const wheelBack = this.scene.add.circle(12, 15, 8, 0x222222);
        const handle = this.scene.add.rectangle(-20, -10, 4, 25, 0x666666);
        return this.scene.add.container(0, 0, [handle, wheelFront, wheelBack, body, engine]);
    }
    
    createCrab() {
        const body = this.scene.add.ellipse(0, 0, 35, 25, 0xFF6B35);
        const clawLeft = this.scene.add.circle(-20, 0, 8, 0xFF8C55);
        const clawRight = this.scene.add.circle(20, 0, 8, 0xFF8C55);
        const eyeLeft = this.scene.add.circle(-5, -8, 4, 0x000000);
        const eyeRight = this.scene.add.circle(5, -8, 4, 0x000000);
        const container = this.scene.add.container(0, 0, [body, clawLeft, clawRight, eyeLeft, eyeRight]);
        
        // Add sideways movement for crabs
        this.scene.tweens.add({
            targets: container,
            x: { from: -10, to: 10 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        return container;
    }
    
    createSandcastle() {
        const base = this.scene.add.rectangle(0, 10, 45, 20, 0xF4E4C1);
        const tower1 = this.scene.add.rectangle(-10, -5, 15, 25, 0xF4E4C1);
        const tower2 = this.scene.add.rectangle(10, -5, 15, 25, 0xF4E4C1);
        const flag = this.scene.add.triangle(10, -20, 0, 0, 8, 4, 0, 8, 0xFF0000);
        return this.scene.add.container(0, 0, [base, tower1, tower2, flag]);
    }
    
    createFloat() {
        const float = this.scene.add.ellipse(0, 0, 50, 35, 0xFF69B4);
        const innerRing = this.scene.add.ellipse(0, 0, 30, 20, 0xFFFFFF);
        innerRing.setAlpha(0.3);
        const container = this.scene.add.container(0, 0, [float, innerRing]);
        
        // Add bobbing motion
        this.scene.tweens.add({
            targets: container,
            y: { from: -3, to: 3 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        return container;
    }
    
    createGenericObstacle() {
        const obstacle = this.scene.add.rectangle(0, 0, 40, 30, 0x888888);
        const warning = this.scene.add.triangle(0, 0, -8, -8, 8, -8, 0, 8, 0xFFFF00);
        return this.scene.add.container(0, 0, [obstacle, warning]);
    }
    
    update(scrollSpeed) {
        this.x -= scrollSpeed;
        
        // Deactivate if off screen
        if (this.x < -100) {
            this.isActive = false;
            this.destroy();
        }
    }
}