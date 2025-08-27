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
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/ui/',
    '<rootDir>/tests/playwright/',
    '<rootDir>/design/templates/',
    '<rootDir>/packages/mit-hero-core/dist/',
    '<rootDir>/attic/'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
