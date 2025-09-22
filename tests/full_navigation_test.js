const { chromium } = require('playwright');
const fs = require('fs');

class RatRaceNavigationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = 'screenshots';
    }

    async initialize() {
        // Ensure screenshots directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }

        this.browser = await chromium.launch({ 
            headless: true,
            slowMo: 100 // Add delay between actions to allow animations
        });
        
        const context = await this.browser.newContext({
            viewport: { width: 1024, height: 768 }
        });
        
        this.page = await context.newPage();
        
        // Enable console logging for debugging
        this.page.on('console', msg => {
            console.log(`🎮 Console: ${msg.text()}`);
        });
        
        this.page.on('pageerror', err => {
            console.error(`🚨 Page Error: ${err.message}`);
        });
    }

    async takeScreenshot(filename, description) {
        try {
            await this.page.screenshot({ 
                path: `${this.screenshotDir}/${filename}`, 
                fullPage: false 
            });
            console.log(`📸 ${description} - saved as ${filename}`);
        } catch (error) {
            console.error(`❌ Screenshot failed: ${error.message}`);
        }
    }

    async waitForPhaser() {
        // Wait for Phaser to be loaded and initialized
        try {
            await this.page.waitForFunction(() => {
                return typeof window.Phaser !== 'undefined' && 
                       typeof window.game !== 'undefined' && 
                       window.game !== null;
            }, { timeout: 10000 });
            console.log('✅ Phaser game loaded successfully');
            return true;
        } catch (error) {
            console.log('⚠️ Phaser may not be fully loaded, continuing anyway');
            return false;
        }
    }

    async navigateToMainMenu() {
        console.log('🏠 Step 1: Loading Main Menu...');
        
        await this.page.goto('http://localhost:8080', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to stabilize
        await this.page.waitForTimeout(3000);
        
        await this.waitForPhaser();
        await this.takeScreenshot('01-main-menu.png', 'Main Menu Loaded');
        
        console.log('✅ Main menu loaded successfully');
    }

    async clickPlayButton() {
        console.log('🖱️ Step 2: Clicking PLAY button...');
        
        // Try multiple strategies to click the PLAY button
        
        // Strategy 1: Look for text "PLAY"
        try {
            await this.page.click('text=PLAY', { timeout: 5000 });
            console.log('✅ Clicked PLAY button using text selector');
        } catch (error) {
            console.log('⚠️ Text selector failed, trying coordinate click...');
            
            // Strategy 2: Click at the expected button coordinates
            await this.page.click({ x: 512, y: 434 });
            console.log('✅ Clicked PLAY button using coordinates');
        }
        
        // Wait for scene transition
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('02-after-play-click.png', 'After Play Click');
    }

    async selectCharacter() {
        console.log('🐭 Step 3: Selecting character...');
        
        // Wait a bit for character selection to load
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('03-character-selection.png', 'Character Selection Screen');
        
        // Try to click on the first character card
        // Characters should be in a grid starting around x=230, y=260
        const characterPositions = [
            { x: 230, y: 260 }, // First character (Butter)
            { x: 410, y: 260 }, // Second character (Duke)
            { x: 590, y: 260 }, // Third character (Daisy)
            { x: 770, y: 260 }, // Fourth character (Pip)
        ];
        
        // Try clicking on the first character
        await this.page.click({ x: characterPositions[0].x, y: characterPositions[0].y });
        console.log('🖱️ Clicked on first character card');
        
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot('04-character-selected.png', 'Character Selected');
    }

    async startRace() {
        console.log('🏁 Step 4: Starting race...');
        
        // Look for START RACE button
        try {
            await this.page.click('text=START RACE!', { timeout: 5000 });
            console.log('✅ Clicked START RACE button using text selector');
        } catch (error) {
            console.log('⚠️ Text selector failed, trying coordinates...');
            // START RACE button should be at bottom center
            await this.page.click({ x: 512, y: 718 });
            console.log('✅ Clicked START RACE button using coordinates');
        }
        
        // Wait for game to start
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot('05-race-starting.png', 'Race Starting');
    }

    async waitForCountdown() {
        console.log('⏱️ Step 5: Waiting for countdown...');
        
        // Wait for countdown to complete (usually 3 seconds)
        await this.page.waitForTimeout(4000);
        await this.takeScreenshot('06-race-active.png', 'Race Active');
        
        console.log('✅ Race is now active');
    }

    async testGameplay() {
        console.log('🎮 Step 6: Testing gameplay controls...');
        
        // Test boost button (right side of screen)
        await this.page.click({ x: 900, y: 600 });
        await this.page.waitForTimeout(500);
        await this.takeScreenshot('07-boost-active.png', 'Boost Button Pressed');
        
        // Test keyboard controls
        await this.page.keyboard.press('ArrowDown');
        await this.page.waitForTimeout(300);
        await this.page.keyboard.press('ArrowUp');
        await this.page.waitForTimeout(500);
        await this.takeScreenshot('08-lane-changes.png', 'Lane Changes Tested');
        
        console.log('✅ Gameplay controls tested');
    }

    async verifyGameState() {
        console.log('🔍 Step 7: Verifying game state...');
        
        // Check what scenes are currently active
        const gameState = await this.page.evaluate(() => {
            if (typeof window.game !== 'undefined' && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const activeScenes = scenes.filter(scene => scene.scene.isActive());
                return {
                    totalScenes: scenes.length,
                    activeScenes: activeScenes.map(scene => scene.scene.key),
                    gameExists: true
                };
            }
            return { gameExists: false };
        });
        
        console.log('🎯 Game State:', JSON.stringify(gameState, null, 2));
        return gameState;
    }

    async runFullNavigationTest() {
        let success = false;
        
        try {
            await this.initialize();
            
            // Complete navigation flow
            await this.navigateToMainMenu();
            await this.clickPlayButton();
            await this.selectCharacter();
            await this.startRace();
            await this.waitForCountdown();
            await this.testGameplay();
            
            const finalState = await this.verifyGameState();
            
            if (finalState.gameExists && finalState.activeScenes.includes('GameScene')) {
                console.log('🎉 SUCCESS! Complete navigation flow works perfectly!');
                console.log('✅ Successfully navigated: Main Menu → Character Selection → Racing');
                success = true;
            } else if (finalState.gameExists) {
                console.log('⚠️ PARTIAL SUCCESS: Game loaded but may not be in racing state');
                console.log('Active scenes:', finalState.activeScenes);
            } else {
                console.log('❌ FAILURE: Game not properly loaded');
            }
            
        } catch (error) {
            console.error('❌ Navigation test failed:', error.message);
            await this.takeScreenshot('error-final.png', 'Final Error State');
        } finally {
            await this.cleanup();
        }
        
        return success;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the test
async function main() {
    console.log('🚀 Starting Full Navigation Test for Rat Race...');
    console.log('Target: Main Menu → Character Selection → Racing');
    console.log('=' .repeat(50));
    
    const tester = new RatRaceNavigationTester();
    const success = await tester.runFullNavigationTest();
    
    if (success) {
        console.log('\n🎯 RESULT: Navigation automation successful!');
    } else {
        console.log('\n❌ RESULT: Navigation automation needs improvement');
        console.log('📁 Check screenshots/ directory for visual debugging');
    }
}

main().catch(console.error);