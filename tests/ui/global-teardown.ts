import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Perform any global cleanup
  console.log('🧹 Global teardown completed');
  
  // Clean up any temporary files, databases, etc.
  // This is where you'd clean up test data, screenshots, etc.
}

export default globalTeardown;
