const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const PACT_BROKER_BASE_URL = process.env.PACT_BROKER_BASE_URL || 'http://localhost:9292';
const PACT_BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const PACT_BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact';

describe('Pact Verification - Payment Gateway API', () => {
  it('validates the expectations of payment-client', async () => {
    const opts = {
      // Provider details
      provider: 'payment-gateway-api',
      providerBaseUrl: `http://localhost:${PORT}`,
      
      // Provider version and branch for tagging
      providerVersion: process.env.GIT_COMMIT || require('child_process').execSync('git rev-parse HEAD').toString().trim(),
      providerVersionBranch: process.env.GIT_BRANCH || require('child_process').execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      
      // Publish verification results
      publishVerificationResult: process.env.CI === 'true' || process.env.PUBLISH_VERIFICATION === 'true',
      
      // Pact Broker configuration
      pactBrokerUrl: PACT_BROKER_BASE_URL,
      pactBrokerUsername: PACT_BROKER_USERNAME,
      pactBrokerPassword: PACT_BROKER_PASSWORD,
      
      // Fetch pacts from broker
      consumerVersionSelectors: [
        { tag: 'main', latest: true },          // Latest main branch
        { tag: 'latest', latest: true },        // Latest overall
        { deployed: true },                      // Currently deployed versions
        { deployedOrReleased: true }            // Currently deployed or released
      ],
      
      // Enable pending pacts feature
      enablePending: true,
      
      // Include WIP (Work In Progress) pacts since a specific date
      includeWipPactsSince: process.env.WIP_PACTS_SINCE || '2025-01-01',
      
      // Logging
      logLevel: 'info',
      
      // State handlers for provider states
      stateHandlers: {
        'no authorization exists': async () => {
          console.log('Setting up state: no authorization exists');
          // Clean state - no setup needed
          return Promise.resolve();
        },
        'authorization exists': async () => {
          console.log('Setting up state: authorization exists');
          // In a real scenario, you might seed test data here
          // For now, we use the in-memory store
          return Promise.resolve();
        },
        'authorized payment exists': async () => {
          console.log('Setting up state: authorized payment exists');
          return Promise.resolve();
        },
        'settled payment exists': async () => {
          console.log('Setting up state: settled payment exists');
          return Promise.resolve();
        }
      },
      
      // Request filters (can modify request before verification)
      requestFilter: (req, res, next) => {
        // Add any necessary headers or modifications
        next();
      },
      
      // Timeout for verification
      timeout: 30000
    };

    const output = await new Verifier(opts).verifyProvider();
    console.log('Pact Verification Complete!');
    console.log(output);
  }, 60000); // Increase Jest timeout for this test
});
