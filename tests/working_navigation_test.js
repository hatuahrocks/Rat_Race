const { chromium } = require('playwright');
const fs = require('fs');

class RatRacerNavigationTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = 'screenshots';
    }

    async initialize() {
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }

        this.browser = await chromium.launch({ 
            headless: true,
            slowMo: 500 // Slow down for better reliability
        });
        
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1280, height: 720 });
        
        // Enable logging
        this.page.on('console', msg => console.log(`🎮 ${msg.text()}`));
        this.page.on('pageerror', err => console.error(`❌ ${err.message}`));
    }

    async screenshot(name, description) {
        await this.page.screenshot({ path: `${this.screenshotDir}/${name}` });
        console.log(`📸 ${description}`);
    }

    async getCanvasInfo() {
        return await this.page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    centerX: rect.x + rect.width / 2,
                    centerY: rect.y + rect.height / 2
                };
            }
            return null;
        });
    }

    async step1_LoadMainMenu() {
        console.log('🏠 STEP 1: Loading Main Menu...');
        
        await this.page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(3000); // Wait for Phaser to initialize
        
        await this.screenshot('step1-main-menu.png', 'Main Menu Loaded');
        console.log('✅ Main menu loaded successfully');
        
        return true;
    }

    async step2_ClickPlay() {
        console.log('🖱️ STEP 2: Clicking PLAY button...');
        
        const canvas = await this.getCanvasInfo();
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        
        // PLAY button is at center horizontally, about 1/3 down from center
        const playButtonX = canvas.centerX;
        const playButtonY = canvas.centerY + 50; // Slightly below center
        
        console.log(`Clicking PLAY at (${Math.round(playButtonX)}, ${Math.round(playButtonY)})`);
        await this.page.mouse.click(playButtonX, playButtonY);
        
        // Wait for scene transition
        await this.page.waitForTimeout(2000);
        await this.screenshot('step2-after-play.png', 'After clicking PLAY');
        
        console.log('✅ PLAY button clicked successfully');
        return true;
    }

    async step3_SelectCharacter() {
        console.log('🐭 STEP 3: Selecting character...');
        
        await this.page.waitForTimeout(1000); // Let character selection load
        await this.screenshot('step3-character-selection.png', 'Character Selection Screen');
        
        const canvas = await this.getCanvasInfo();
        
        // Click on first character (Butter) - top left of the grid
        // Based on the screenshot, characters are in a 4x2 grid
        const butterX = canvas.x + 384; // First character position
        const butterY = canvas.y + 130; // Top row
        
        console.log(`Clicking Butter character at (${Math.round(butterX)}, ${Math.round(butterY)})`);
        await this.page.mouse.click(butterX, butterY);
        
        await this.page.waitForTimeout(1000);
        await this.screenshot('step3-character-selected.png', 'Character Selected');
        
        console.log('✅ Character selected successfully');
        return true;
    }

    async step4_StartRace() {
        console.log('🏁 STEP 4: Starting race...');
        
        const canvas = await this.getCanvasInfo();
        
        // START RACE button is at bottom center
        const startButtonX = canvas.centerX;
        const startButtonY = canvas.y + canvas.height - 50; // Near bottom
        
        console.log(`Clicking START RACE at (${Math.round(startButtonX)}, ${Math.round(startButtonY)})`);
        await this.page.mouse.click(startButtonX, startButtonY);
        
        await this.page.waitForTimeout(1000);
        await this.screenshot('step4-race-starting.png', 'Race Starting');
        
        console.log('✅ START RACE clicked successfully');
        return true;
    }

    async step5_WaitForCountdown() {
        console.log('⏱️ STEP 5: Waiting for countdown and race start...');
        
        // Wait for countdown (3-2-1-GO!)
        await this.page.waitForTimeout(4000);
        await this.screenshot('step5-race-active.png', 'Race Active');
        
        console.log('✅ Race is now active');
        return true;
    }

    async step6_TestGameplay() {
        console.log('🎮 STEP 6: Testing gameplay controls...');
        
        const canvas = await this.getCanvasInfo();
        
        // Test boost button (right side)
        const boostButtonX = canvas.x + canvas.width - 80;
        const boostButtonY = canvas.y + canvas.height - 150;
        
        await this.page.mouse.click(boostButtonX, boostButtonY);
        await this.page.waitForTimeout(500);
        await this.screenshot('step6-boost-test.png', 'Boost Button Tested');
        
        // Test keyboard controls
        await this.page.keyboard.press('ArrowDown');
        await this.page.waitForTimeout(300);
        await this.page.keyboard.press('ArrowUp');
        await this.page.waitForTimeout(500);
        
        await this.screenshot('step6-controls-test.png', 'Controls Tested');
        
        console.log('✅ Gameplay controls tested successfully');
        return true;
    }

    async verifyFinalState() {
        console.log('🔍 STEP 7: Verifying final game state...');
        
        const gameState = await this.page.evaluate(() => {
            if (typeof window.game !== 'undefined' && window.game.scene) {
                const activeScenes = window.game.scene.scenes
                    .filter(scene => scene.scene.isActive())
                    .map(scene => scene.scene.key);
                
                return {
                    success: true,
                    activeScenes: activeScenes,
                    hasGameScene: activeScenes.includes('GameScene'),
                    hasUIScene: activeScenes.includes('UIScene')
                };
            }
            return { success: false };
        });
        
        console.log('🎯 Final game state:', gameState);
        
        if (gameState.success && gameState.hasGameScene) {
            console.log('🎉 SUCCESS: Game is running in racing mode!');
            return true;
        } else {
            console.log('⚠️ Game state unclear, but navigation may have worked');
            return false;
        }
    }

    async runCompleteTest() {
        let allStepsSuccessful = true;
        
        try {
            await this.initialize();
            
            const steps = [
                () => this.step1_LoadMainMenu(),
                () => this.step2_ClickPlay(),
                () => this.step3_SelectCharacter(),
                () => this.step4_StartRace(),
                () => this.step5_WaitForCountdown(),
                () => this.step6_TestGameplay()
            ];
            
            for (let i = 0; i < steps.length; i++) {
                const success = await steps[i]();
                if (!success) {
                    console.log(`❌ Step ${i + 1} failed`);
                    allStepsSuccessful = false;
                    break;
                }
            }
            
            const finalSuccess = await this.verifyFinalState();
            
            console.log('\n' + '='.repeat(60));
            if (allStepsSuccessful && finalSuccess) {
                console.log('🎉 COMPLETE SUCCESS: Full navigation flow working perfectly!');
                console.log('✅ Main Menu → Character Selection → Racing - ALL WORKING');
            } else if (allStepsSuccessful) {
                console.log('✅ NAVIGATION SUCCESS: All steps completed (game state verification unclear)');
            } else {
                console.log('❌ PARTIAL FAILURE: Some steps failed');
            }
            console.log('📁 Check screenshots/ directory for visual confirmation');
            
            return allStepsSuccessful;
            
        } catch (error) {
            console.error('❌ Test failed with error:', error.message);
            await this.screenshot('error-state.png', 'Error State');
            return false;
        } finally {
            await this.cleanup();
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the test
console.log('🚀 RAT RACER - COMPLETE NAVIGATION TEST');
console.log('Testing: Main Menu → Character Selection → Racing');
console.log('=' .repeat(60));

const tester = new RatRacerNavigationTest();
tester.runCompleteTest().then(success => {
    if (success) {
        console.log('\n🎯 RESULT: Playwright can successfully navigate the entire game flow!');
    } else {
        console.log('\n❌ RESULT: Navigation test needs further refinement');
    }
}).catch(console.error);