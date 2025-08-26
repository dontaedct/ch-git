import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Start browser and perform any global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the app to be ready
    await page.goto(baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Global setup completed - app is ready for testing');
  } catch (error) {
    console.warn('⚠️  Global setup warning:', error.message);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
