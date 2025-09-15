// Test configuration and setup
export const testConfig = {
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000,
    veryLong: 30000
  },
  performance: {
    classificationMaxTime: 3000,
    generationMaxTime: 8000,
    imageLoadMaxTime: 2000,
    navigationMaxTime: 500
  },
  retries: {
    maxRetries: 3,
    baseDelay: 100,
    maxDelay: 1000
  }
}

// Test environment setup
export function setupTestEnvironment() {
  // Set test environment variables
  Object.assign(process.env, {
    NODE_ENV: 'test',
    OPENAI_API_KEY: 'test-key',
    UNSPLASH_ACCESS_KEY: 'test-key',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000'
  });
}
