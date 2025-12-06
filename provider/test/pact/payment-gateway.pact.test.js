const { Verifier } = require('@pact-foundation/pact');
const path = require('path');
const PaymentModel = require('../../src/models/payment.model');

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
      
      // Use state change URL to communicate with running provider
      // This allows the provider server to set up its own in-memory state
      providerStatesSetupUrl: `http://localhost:${PORT}/_pact/provider-states`,
      
      // Keep state handlers as fallback (though providerStatesSetupUrl takes precedence)
      stateHandlers: {
        // Card validation states
        'a valid payment card': async () => {
          console.log('Setting up state: a valid payment card');
          // No setup needed - provider validates any card not starting with 4000
          PaymentModel.clearAll();
          return Promise.resolve();
        },
        'an invalid payment card': async () => {
          console.log('Setting up state: an invalid payment card');
          // No setup needed - provider rejects cards starting with 4000
          PaymentModel.clearAll();
          return Promise.resolve();
        },
        
        // Transaction existence states
        'no transaction exists': async () => {
          console.log('Setting up state: no transaction exists');
          // Clean state - clear all transactions
          PaymentModel.clearAll();
          return Promise.resolve();
        },
        'no authorization exists': async () => {
          console.log('Setting up state: no authorization exists');
          // Clean state - clear all transactions
          PaymentModel.clearAll();
          return Promise.resolve();
        },
        
        // Authorized payment states
        'authorization exists': async () => {
          console.log('Setting up state: authorization exists');
          // Create an authorized transaction with specific ID for settlement/status tests
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_abc123def456',
            status: 'AUTHORIZED',
            amount: 99.99,
            currency: 'USD',
            authorizationCode: 'AUTH-789012',
            merchantId: 'merchant_123'
          });
          return Promise.resolve();
        },
        'an authorized payment exists': async () => {
          console.log('Setting up state: an authorized payment exists');
          // Create an authorized transaction with specific ID for settlement/status tests
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_abc123def456',
            status: 'AUTHORIZED',
            amount: 99.99,
            currency: 'USD',
            authorizationCode: 'AUTH-789012',
            merchantId: 'merchant_123'
          });
          return Promise.resolve();
        },
        'authorized payment exists': async () => {
          console.log('Setting up state: authorized payment exists');
          // Create an authorized transaction
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_abc123def456',
            status: 'AUTHORIZED',
            amount: 99.99,
            currency: 'USD',
            authorizationCode: 'AUTH-789012',
            merchantId: 'merchant_123'
          });
          return Promise.resolve();
        },
        
        // Settled payment states
        'a settled payment exists': async () => {
          console.log('Setting up state: a settled payment exists');
          // Create a settled transaction with specific ID for refund/status tests
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_settled123',
            status: 'SETTLED',
            amount: 99.99,  // Must match consumer refund amount
            currency: 'USD',
            authorizationCode: 'AUTH-123456',
            settlementId: 'settle_abc123',
            merchantId: 'merchant_123'
          });
          return Promise.resolve();
        },
        'settled payment exists': async () => {
          console.log('Setting up state: settled payment exists');
          // Create a settled transaction
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_settled123',
            status: 'SETTLED',
            amount: 99.99,  // Must match consumer refund amount
            currency: 'USD',
            authorizationCode: 'AUTH-123456',
            settlementId: 'settle_abc123',
            merchantId: 'merchant_123'
          });
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
