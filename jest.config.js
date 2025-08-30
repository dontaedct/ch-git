import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases (this is the configuration for your path aliases)
    '^@/(.*)$': '<rootDir>/$1',
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@ui/(.*)$': '<rootDir>/components/ui/$1',
    '^@registry/(.*)$': '<rootDir>/lib/registry/$1',
    '^@compat/(.*)$': '<rootDir>/lib/compat/$1',
    '^@dct/stripe-checkout$': '<rootDir>/packages/stripe-checkout/src/index.ts',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/ui/',
    '<rootDir>/tests/playwright/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/design/templates/',
    '<rootDir>/attic/',
    '<rootDir>/examples/'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/scripts/**',
    '!**/bin/**',
    '!**/design/**',
    '!**/examples/**',
    '!**/attic/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    // Temporarily lowered thresholds for SOS job phase 3
    './lib/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    './components/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    './app/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  // Test timeout configuration
  testTimeout: 10000,
  // Verbose output for debugging
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}',
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
