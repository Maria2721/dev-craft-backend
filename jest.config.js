/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {},
};
