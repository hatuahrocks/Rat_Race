const { chromium } = require('playwright');

async function testButtonFix() {
    let browser;
    try {
        console.log('🔧 Testing button fix...');
        
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1024, height: 768 });
        
        // Enable console logging
        page.on('console', msg => console.log(`🎮 Console: ${msg.text()}`));
        page.on('pageerror', err => console.error(`🚨 Error: ${err.message}`));
        
        console.log('📡 Loading game...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('📸 Taking main menu screenshot...');
        await page.screenshot({ path: 'screenshots/fixed-main-menu.png' });
        
        console.log('🖱️ Clicking PLAY button...');
        // Click on the PLAY button area
        await page.click({ x: 512, y: 434 });
        await page.waitForTimeout(2000);
        
        console.log('📸 Taking after-click screenshot...');
        await page.screenshot({ path: 'screenshots/after-play-click.png' });
        
        // Check what scene we're in by evaluating the page
        const currentScene = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const activeScenes = window.game.scene.scenes.filter(s => s.scene.isActive());
                return activeScenes.map(s => s.scene.key);
            }
            return ['unknown'];
        });
        
        console.log('🎯 Active scenes:', currentScene);
        
        if (currentScene.includes('SelectionScene')) {
            console.log('✅ SUCCESS: Button fix worked! Reached character selection.');
        } else {
            console.log('❌ Still stuck on main menu');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testButtonFix();