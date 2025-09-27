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
        console.log('Creating obstacle of type:', this.type);

        // Create warning background circle
        const warningCircle = this.createWarningCircle();

        switch(this.type) {
            // New garden obstacles
            case 'gnome_foot':
                obstacle = this.createGnomeFoot();
                break;
            case 'flower_pot':
                obstacle = this.createFlowerPot();
                break;
            case 'mushroom':
                obstacle = this.createMushroom();
                break;
            case 'rock':
                obstacle = this.createRock();
                break;
            case 'acorn':
                obstacle = this.createAcorn();
                break;
            case 'ant_hill':
                obstacle = this.createAntHill();
                break;
            // Old obstacles for compatibility
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
                console.warn('Unknown obstacle type, using generic:', this.type);
                obstacle = this.createGenericObstacle();
        }

        // Add warning circle behind the obstacle, then the obstacle on top
        this.add([warningCircle, obstacle]);
        this.setSize(40, 30);
    }

    createWarningCircle() {
        // Create pulsing red warning circle that stays transparent
        const outerCircle = this.scene.add.circle(0, 0, 35, 0xFF0000);
        outerCircle.setAlpha(0.25);
        const innerCircle = this.scene.add.circle(0, 0, 30, 0xFF3333);
        innerCircle.setAlpha(0.3);

        const warningContainer = this.scene.add.container(0, 0, [outerCircle, innerCircle]);

        // Add subtle pulsing animation - stays transparent
        this.scene.tweens.add({
            targets: [outerCircle, innerCircle],
            scaleX: { from: 1, to: 1.15 },
            scaleY: { from: 1, to: 1.15 },
            alpha: { from: 0.3, to: 0.1 },
            duration: 1200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        return warningContainer;
    }
    
    createGnomeFoot() {
        const sole = this.scene.add.rectangle(0, 15, 48, 8, 0x3E2723);
        const boot = this.scene.add.ellipse(0, 5, 45, 30, 0x4169E1);
        const toe = this.scene.add.ellipse(12, 8, 20, 18, 0x3658C7);
        const laces = this.scene.add.rectangle(0, -2, 4, 20, 0xFFFFFF);
        const laceHole1 = this.scene.add.circle(-8, -2, 3, 0x2A4494);
        const laceHole2 = this.scene.add.circle(8, -2, 3, 0x2A4494);
        const buckle = this.scene.add.rectangle(0, 2, 12, 6, 0xFFD700);
        return this.scene.add.container(0, 0, [sole, boot, toe, buckle, laces, laceHole1, laceHole2]);
    }

    createFlowerPot() {
        const potBottom = this.scene.add.rectangle(0, 10, 30, 15, 0xC65D00);
        const potTop = this.scene.add.rectangle(0, 0, 40, 10, 0xD2691E);
        const rim = this.scene.add.rectangle(0, -5, 44, 10, 0xA0522D);
        const soil = this.scene.add.ellipse(0, -2, 38, 14, 0x3E2723);
        const stem = this.scene.add.rectangle(0, -8, 3, 12, 0x228B22);
        // Multiple flower petals
        const petal1 = this.scene.add.circle(-5, -18, 6, 0xFF1493);
        const petal2 = this.scene.add.circle(5, -18, 6, 0xFF1493);
        const petal3 = this.scene.add.circle(0, -23, 6, 0xFF1493);
        const petal4 = this.scene.add.circle(0, -13, 6, 0xFF1493);
        const center = this.scene.add.circle(0, -18, 4, 0xFFD700);
        return this.scene.add.container(0, 0, [potBottom, potTop, rim, soil, stem, petal1, petal2, petal3, petal4, center]);
    }

    createMushroom() {
        const stem = this.scene.add.ellipse(0, 10, 20, 25, 0xF5F5DC);
        const cap = this.scene.add.ellipse(0, -5, 40, 30, 0xDC143C);
        const spot1 = this.scene.add.circle(-10, -5, 4, 0xFFFFFF);
        const spot2 = this.scene.add.circle(8, -3, 3, 0xFFFFFF);
        const spot3 = this.scene.add.circle(-2, -10, 3, 0xFFFFFF);
        const container = this.scene.add.container(0, 0, [stem, cap, spot1, spot2, spot3]);

        this.scene.tweens.add({
            targets: container,
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 0.95 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        return container;
    }

    createRock() {
        const rockBody = this.scene.add.ellipse(0, 5, 45, 35, 0x696969);
        const shadow = this.scene.add.ellipse(5, 10, 25, 18, 0x4A4A4A);
        const highlight1 = this.scene.add.ellipse(-10, -5, 12, 10, 0x8B8B8B);
        const highlight2 = this.scene.add.ellipse(8, -2, 8, 6, 0x7D7D7D);
        const crack1 = this.scene.add.rectangle(2, 0, 2, 22, 0x3C3C3C);
        crack1.rotation = 0.3;
        const crack2 = this.scene.add.rectangle(-5, 5, 1, 15, 0x3C3C3C);
        crack2.rotation = -0.2;
        const moss = this.scene.add.ellipse(-8, 12, 15, 8, 0x556B2F);
        moss.setAlpha(0.6);
        return this.scene.add.container(0, 0, [rockBody, shadow, moss, highlight1, highlight2, crack1, crack2]);
    }

    createAcorn() {
        const nut = this.scene.add.ellipse(0, 8, 32, 38, 0xA0522D);
        const nutHighlight = this.scene.add.ellipse(-5, 5, 12, 15, 0xB8732F);
        nutHighlight.setAlpha(0.6);
        const cap = this.scene.add.ellipse(0, -8, 38, 22, 0x6F4E37);
        const stem = this.scene.add.rectangle(0, -16, 4, 10, 0x4A2C2A);
        // Cross-hatch texture on cap
        const texture1 = this.scene.add.rectangle(-8, -8, 10, 2, 0x5D3A1A);
        const texture2 = this.scene.add.rectangle(6, -6, 10, 2, 0x5D3A1A);
        const texture3 = this.scene.add.rectangle(-2, -10, 2, 10, 0x5D3A1A);
        const texture4 = this.scene.add.rectangle(4, -9, 2, 8, 0x5D3A1A);
        return this.scene.add.container(0, 0, [nut, nutHighlight, cap, texture1, texture2, texture3, texture4, stem]);
    }

    createAntHill() {
        const mound = this.scene.add.ellipse(0, 10, 50, 25, 0x8B7355);
        const moundShade = this.scene.add.ellipse(5, 12, 40, 20, 0x7A6449);
        moundShade.setAlpha(0.5);
        const peak = this.scene.add.triangle(0, -5, -15, 15, 15, 15, 0, -10, 0x9B8469);
        const hole = this.scene.add.ellipse(0, -8, 10, 8, 0x1A0F08);
        const holeInner = this.scene.add.ellipse(0, -8, 6, 5, 0x000000);

        // Bigger, more visible ants
        const ant1Body = this.scene.add.ellipse(-15, 5, 6, 4, 0x000000);
        const ant1Head = this.scene.add.circle(-18, 5, 2, 0x000000);
        const ant2Body = this.scene.add.ellipse(12, 8, 6, 4, 0x000000);
        const ant2Head = this.scene.add.circle(15, 8, 2, 0x000000);
        const ant3Body = this.scene.add.ellipse(-5, -2, 6, 4, 0x000000);
        const ant3Head = this.scene.add.circle(-8, -2, 2, 0x000000);

        const container = this.scene.add.container(0, 0, [mound, moundShade, peak, hole, holeInner,
            ant1Body, ant1Head, ant2Body, ant2Head, ant3Body, ant3Head]);

        this.scene.tweens.add({
            targets: [ant1Body, ant1Head],
            x: '+=5',
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.scene.tweens.add({
            targets: [ant2Body, ant2Head],
            x: '-=4',
            y: '-=2',
            duration: 1200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 400
        });

        this.scene.tweens.add({
            targets: [ant3Body, ant3Head],
            y: '+=3',
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 800
        });

        return container;
    }
    
    createGenericObstacle() {
        const obstacle = this.scene.add.rectangle(0, 0, 40, 30, 0x888888);
        const warning = this.scene.add.triangle(0, 0, -8, -8, 8, -8, 0, 8, 0xFFFF00);
        return this.scene.add.container(0, 0, [obstacle, warning]);
    }

    // Old obstacle types for backward compatibility
    createSofa() {
        const base = this.scene.add.rectangle(0, 5, 60, 25, 0x8B4513);
        const back = this.scene.add.rectangle(0, -8, 60, 15, 0x654321);
        return this.scene.add.container(0, 0, [base, back]);
    }

    createTV() {
        const screen = this.scene.add.rectangle(0, 0, 45, 35, 0x222222);
        const frame = this.scene.add.rectangle(0, 0, 50, 40, 0x444444);
        const stand = this.scene.add.rectangle(0, 22, 20, 8, 0x333333);
        return this.scene.add.container(0, 0, [stand, frame, screen]);
    }

    createChair() {
        const seat = this.scene.add.rectangle(0, 5, 30, 20, 0x8B4513);
        const back = this.scene.add.rectangle(0, -10, 30, 25, 0x654321);
        return this.scene.add.container(0, 0, [seat, back]);
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
        return this.scene.add.container(0, 0, [wheelFront, wheelBack, body, engine]);
    }

    createCrab() {
        const body = this.scene.add.ellipse(0, 0, 35, 25, 0xFF6B35);
        const clawLeft = this.scene.add.circle(-20, 0, 8, 0xFF8C55);
        const clawRight = this.scene.add.circle(20, 0, 8, 0xFF8C55);
        return this.scene.add.container(0, 0, [body, clawLeft, clawRight]);
    }

    createSandcastle() {
        const base = this.scene.add.rectangle(0, 10, 45, 20, 0xF4E4C1);
        const tower1 = this.scene.add.rectangle(-10, -5, 15, 25, 0xF4E4C1);
        const tower2 = this.scene.add.rectangle(10, -5, 15, 25, 0xF4E4C1);
        return this.scene.add.container(0, 0, [base, tower1, tower2]);
    }

    createFloat() {
        const float = this.scene.add.ellipse(0, 0, 50, 35, 0xFF69B4);
        const innerRing = this.scene.add.ellipse(0, 0, 30, 20, 0xFFFFFF);
        innerRing.setAlpha(0.3);
        return this.scene.add.container(0, 0, [float, innerRing]);
    }
    
    update(scrollSpeed) {
        this.x -= scrollSpeed; // Move at same speed as all other elements
        
        // Deactivate if off screen (give much more buffer to avoid early disappearing)
        if (this.x < -400) {
            this.isActive = false;
            this.destroy();
        }
    }
}