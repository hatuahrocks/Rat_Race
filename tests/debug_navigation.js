const { chromium } = require('playwright');

async function debugNavigation() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Loading game...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('📸 Taking initial screenshot...');
        await page.screenshot({ path: 'screenshots/debug-main-menu.png' });
        
        // Debug: Check what elements are actually clickable
        console.log('🔍 Analyzing clickable elements...');
        
        const clickableElements = await page.evaluate(() => {
            // Find all interactive elements
            const elements = document.querySelectorAll('*');
            const interactive = [];
            
            elements.forEach((el, index) => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                if (style.cursor === 'pointer' || 
                    el.onclick || 
                    el.style.cursor === 'pointer' ||
                    el.tagName === 'BUTTON') {
                    
                    interactive.push({
                        index,
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        textContent: el.textContent?.trim().substring(0, 50),
                        rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        cursor: style.cursor
                    });
                }
            });
            
            return interactive;
        });
        
        console.log('🎯 Found clickable elements:');
        clickableElements.forEach((el, i) => {
            console.log(`${i + 1}. ${el.tagName} - "${el.textContent}" at (${Math.round(el.rect.x)}, ${Math.round(el.rect.y)})`);
        });
        
        // Try to find the canvas element (Phaser renders to canvas)
        const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                return {
                    exists: true,
                    rect: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    }
                };
            }
            return { exists: false };
        });
        
        console.log('🎨 Canvas info:', canvasInfo);
        
        if (canvasInfo.exists) {
            console.log('🖱️ Attempting to click on canvas at PLAY button area...');
            
            // Calculate center position for PLAY button
            const playButtonX = canvasInfo.rect.x + (canvasInfo.rect.width / 2);
            const playButtonY = canvasInfo.rect.y + (canvasInfo.rect.height / 2) + 50; // Slightly below center
            
            console.log(`Clicking at: (${Math.round(playButtonX)}, ${Math.round(playButtonY)})`);
            
            await page.mouse.click(playButtonX, playButtonY);
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'screenshots/debug-after-click.png' });
            console.log('📸 Post-click screenshot saved');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await page.waitForTimeout(5000); // Keep browser open for manual inspection
        await browser.close();
    }
}

debugNavigation();