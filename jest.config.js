import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/hero-tasks/setup/test-setup.ts'],
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
    '<rootDir>/tests/hero-tasks/e2e/',
    '<rootDir>/tests/hero-tasks/performance/',
    '<rootDir>/tests/hero-tasks/uat/',
    '<rootDir>/tests/visual/',
    '<rootDir>/tests/security/',
    '<rootDir>/tests/design-system/visual-regression.test.ts',
    '<rootDir>/tests/audit/enhanced-audit-logging.test.ts',
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
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // HT-008 Phase 7: Testing Suite Implementation - 95%+ coverage target
    './lib/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './app/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
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
