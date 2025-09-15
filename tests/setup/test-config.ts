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
  process.env.NODE_ENV = 'test'
  process.env.OPENAI_API_KEY = 'test-key'
  process.env.UNSPLASH_ACCESS_KEY = 'test-key'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}
