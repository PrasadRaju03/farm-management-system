export default {
    testEnvironment: 'node',
    transform: {},
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: [
      '**/*.{js}',
      '!**/node_modules/**',
      '!**/tests/**',
      '!**/coverage/**',
    ],
    extensionsToTreatAsEsm: ['.js'],
  };
  