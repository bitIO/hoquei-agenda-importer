module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['./lambdas/*.ts', './lambdas/*/*.ts', './lib/*.ts'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  roots: ['<rootDir>/test', '<rootDir>/lambdas'],
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
