const { chromium } = require('playwright');

async function quickTest() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Loading game...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Test 1: Main menu
        await page.screenshot({ path: 'screenshots/quick-main-menu.png' });
        console.log('📸 Main menu captured');
        
        // Get canvas and click PLAY
        const canvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2 + 50
                };
            }
            return null;
        });
        
        if (canvas) {
            await page.mouse.click(canvas.x, canvas.y);
            await page.waitForTimeout(2000);
            
            // Test 2: Character selection
            await page.screenshot({ path: 'screenshots/quick-character-selection.png' });
            console.log('📸 Character selection captured');
            
            // Click first character
            await page.mouse.click(canvas.x - 96, 200); // Approximate first character position
            await page.waitForTimeout(1000);
            
            // Click START RACE
            await page.mouse.click(canvas.x, canvas.y + 260);
            await page.waitForTimeout(4000); // Wait for countdown
            
            // Test 3: Racing
            await page.screenshot({ path: 'screenshots/quick-racing.png' });
            console.log('📸 Racing scene captured');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

quickTest();