// Shared procedural art helpers used by gameplay and menu scenes.
// Everything is drawn at runtime (no image assets), matching the rest of the game.
const GameArt = {
    // Darken (factor < 1) or lighten (factor > 1) a 0xRRGGBB color
    shade(color, factor) {
        const r = Math.min(255, Math.round(((color >> 16) & 0xFF) * factor));
        const g = Math.min(255, Math.round(((color >> 8) & 0xFF) * factor));
        const b = Math.min(255, Math.round((color & 0xFF) * factor));
        return (r << 16) | (g << 8) | b;
    },

    // Create (once) a linear-gradient canvas texture and return its key
    ensureGradient(scene, key, width, height, stops, horizontal = false) {
        if (scene.textures.exists(key)) return key;
        const tex = scene.textures.createCanvas(key, width, height);
        const ctx = tex.context;
        const grd = horizontal
            ? ctx.createLinearGradient(0, 0, width, 0)
            : ctx.createLinearGradient(0, 0, 0, height);
        stops.forEach(([offset, color]) => grd.addColorStop(offset, color));
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        tex.refresh();
        return key;
    },

    // A little open-top racing car, side view facing right.
    // Same footprint as the old rectangle car (~64x30, wheels at y=20)
    // so collision boxes and rat placement stay valid.
    createCar(scene, colors) {
        const main = colors.color !== undefined ? colors.color : 0x333333;
        const accent = colors.accent !== undefined ? colors.accent : 0x444444;
        const dark = this.shade(main, 0.55);

        const g = scene.add.graphics();

        // Rear spoiler
        g.fillStyle(dark, 1);
        g.fillRect(-36, -2, 11, 4);
        g.fillRect(-29, 0, 3, 6);

        // Underbody skirt
        g.fillStyle(dark, 1);
        g.fillRoundedRect(-29, 15, 58, 7, 3);

        // Main body
        g.fillStyle(main, 1);
        g.fillRoundedRect(-31, 1, 62, 18, { tl: 9, tr: 13, br: 5, bl: 5 });

        // Nose cone
        g.fillStyle(accent, 1);
        g.fillRoundedRect(15, 3, 16, 14, { tl: 7, tr: 11, br: 4, bl: 2 });

        // Rear engine cover
        g.fillStyle(accent, 1);
        g.fillRoundedRect(-31, 1, 11, 9, { tl: 9, tr: 3, br: 2, bl: 2 });

        // Cockpit opening (rat sits here)
        g.fillStyle(0x1C1C1C, 0.85);
        g.fillEllipse(0, 5, 30, 11);

        // Top highlight
        g.fillStyle(0xFFFFFF, 0.22);
        g.fillRoundedRect(-24, 2.5, 34, 3.5, 1.75);

        // Headlight + exhaust
        g.fillStyle(0xFFF3B0, 1);
        g.fillCircle(29, 8, 2.5);
        g.fillStyle(0x555555, 1);
        g.fillRoundedRect(-36, 13, 6, 4, 2);

        const container = scene.add.container(0, 0, [g]);

        // Wheels: tire, rim, hub
        [-17, 17].forEach(wx => {
            const tire = scene.add.circle(wx, 20, 8, 0x141414);
            tire.setStrokeStyle(1.5, 0x000000);
            const rim = scene.add.circle(wx, 20, 4.5, 0xB9B9B9);
            const hub = scene.add.circle(wx, 20, 1.8, 0xE8E8E8);
            container.add([tire, rim, hub]);
        });

        return container;
    },

    // Pulsing 'sonar' warning ring used around obstacles
    createWarningRing(scene) {
        const core = scene.add.graphics();
        core.lineStyle(3, 0xFF4444, 0.85);
        core.strokeCircle(0, 0, 30);
        core.fillStyle(0xFF0000, 0.08);
        core.fillCircle(0, 0, 30);

        const pulse = scene.add.graphics();
        pulse.lineStyle(3, 0xFF6666, 0.7);
        pulse.strokeCircle(0, 0, 30);

        const container = scene.add.container(0, 0, [pulse, core]);

        scene.tweens.add({
            targets: pulse,
            scaleX: 1.45,
            scaleY: 1.45,
            alpha: { from: 0.7, to: 0 },
            duration: 1100,
            ease: 'Sine.easeOut',
            repeat: -1
        });

        return container;
    },

    // Rounded translucent HUD panel
    createPanel(scene, x, y, width, height, opts = {}) {
        const radius = opts.radius !== undefined ? opts.radius : 12;
        const fillColor = opts.color !== undefined ? opts.color : 0x000000;
        const alpha = opts.alpha !== undefined ? opts.alpha : 0.35;
        const g = scene.add.graphics();
        g.fillStyle(fillColor, alpha);
        g.fillRoundedRect(x, y, width, height, radius);
        if (opts.strokeColor !== undefined) {
            g.lineStyle(opts.strokeWidth || 2, opts.strokeColor, opts.strokeAlpha !== undefined ? opts.strokeAlpha : 0.8);
            g.strokeRoundedRect(x, y, width, height, radius);
        }
        return g;
    },

    // Rounded menu button with drop shadow, gloss and hover/press states
    createButton(scene, x, y, width, height, label, opts, callback) {
        const base = opts.color !== undefined ? opts.color : 0x4444FF;
        const hover = opts.hoverColor !== undefined ? opts.hoverColor : this.shade(base, 1.25);
        const textColor = opts.textColor || '#FFFFFF';
        const fontSize = opts.fontSize || 26;
        const radius = Math.min(16, height / 2 - 2);

        const button = scene.add.container(x, y);

        const draw = (g, color) => {
            g.clear();
            // Drop shadow
            g.fillStyle(0x000000, 0.30);
            g.fillRoundedRect(-width / 2 + 3, -height / 2 + 5, width, height, radius);
            // Body
            g.fillStyle(color, 1);
            g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
            // Bottom shade
            g.fillStyle(this.shade(color, 0.7), 1);
            g.fillRoundedRect(-width / 2, height / 2 - 8, width, 8, { tl: 0, tr: 0, bl: radius, br: radius });
            // Top gloss
            g.fillStyle(0xFFFFFF, 0.25);
            g.fillRoundedRect(-width / 2 + 4, -height / 2 + 3, width - 8, height / 3, radius * 0.7);
            // Outline
            g.lineStyle(3, this.shade(color, 0.45), 1);
            g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        };

        const g = scene.add.graphics();
        draw(g, base);

        const text = scene.add.text(0, -1, label, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial Black',
            color: textColor,
            stroke: '#000000',
            strokeThickness: Math.max(2, fontSize * 0.1),
            resolution: 2
        });
        text.setOrigin(0.5);

        const hit = scene.add.rectangle(0, 0, width, height, 0xFFFFFF, 0);
        hit.setInteractive({ useHandCursor: true });

        button.add([g, text, hit]);

        hit.on('pointerover', () => { draw(g, hover); button.setScale(1.04); });
        hit.on('pointerout', () => { draw(g, base); button.setScale(1); });
        hit.on('pointerdown', () => {
            button.setScale(0.96);
            scene.time.delayedCall(90, () => {
                button.setScale(1);
                callback();
            });
        });

        return button;
    },

    // Full-screen vertical gradient backdrop for menu scenes
    createMenuBackdrop(scene, key, topColor, bottomColor) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        this.ensureGradient(scene, key, 32, 512, [[0, topColor], [1, bottomColor]]);
        const img = scene.add.image(0, 0, key);
        img.setOrigin(0, 0);
        img.setDisplaySize(width, height);
        img.setDepth(-100);
        return img;
    },

    // Soft puffy cloud
    createCloud(scene, x, y, scale = 1) {
        const cloud = scene.add.container(x, y);
        const puffs = [
            scene.add.ellipse(0, 6, 86, 28, 0xFFFFFF),
            scene.add.circle(-22, -2, 16, 0xFFFFFF),
            scene.add.circle(2, -8, 20, 0xFFFFFF),
            scene.add.circle(24, -2, 14, 0xFFFFFF)
        ];
        cloud.add(puffs);
        cloud.setScale(scale);
        cloud.setAlpha(0.9);
        return cloud;
    },

    // Tiny garden flower (petals + center)
    createFlower(scene, x, y, petalColor) {
        const flower = scene.add.container(x, y);
        const stem = scene.add.rectangle(0, 6, 1.5, 9, 0x4E7B2F);
        flower.add(stem);
        [[-3, 0], [3, 0], [0, -3], [0, 3]].forEach(([px, py]) => {
            flower.add(scene.add.circle(px, py, 2.6, petalColor));
        });
        flower.add(scene.add.circle(0, 0, 1.8, 0xFFD54F));
        return flower;
    },

    // Small grass tuft (three blades)
    createGrassTuft(scene, x, y, color) {
        const g = scene.add.graphics({ x, y });
        g.fillStyle(color, 1);
        g.fillTriangle(-4, 0, -2, 0, -3.5, -7);
        g.fillTriangle(-1, 0, 1, 0, 0, -9);
        g.fillTriangle(2, 0, 4, 0, 3.5, -6);
        return g;
    }
};
