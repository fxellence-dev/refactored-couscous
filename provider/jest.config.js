module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/pact/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js'
  ],
  testTimeout: 30000,
  verbose: true
};
