import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after DataPrism App Template E2E tests...');
  
  // Any global cleanup needed after tests
  // For example, you might want to:
  // - Clean up test data
  // - Close database connections
  // - Stop additional services
  
  return Promise.resolve();
}

export default globalTeardown;