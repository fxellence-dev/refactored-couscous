const PaymentModel = require('../models/payment.model');

/**
 * Pact State Handler Controller
 * This controller handles state setup requests from Pact verifier
 * to prepare the provider for specific test scenarios
 */
class PactStateController {
  /**
   * Handle provider state changes for Pact verification
   * POST /_pact/provider-states
   */
  static handleProviderState(req, res) {
    const { state, params } = req.body;
    
    console.log(`[Pact State] Setting up state: "${state}"`, params || '');

    try {
      // Execute the appropriate state setup
      switch (state) {
        // Card validation states
        case 'a valid payment card':
        case 'an invalid payment card':
          PaymentModel.clearAll();
          break;

        // Transaction existence states  
        case 'no transaction exists':
        case 'no authorization exists':
          PaymentModel.clearAll();
          break;

        // Authorized payment states
        case 'authorization exists':
        case 'an authorized payment exists':
        case 'authorized payment exists':
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_abc123def456',
            status: 'AUTHORIZED',
            amount: 99.99,
            currency: 'USD',
            authorizationCode: 'AUTH-789012',
            merchantId: 'merchant_123'
          });
          break;

        // Settled payment states
        case 'a settled payment exists':
        case 'settled payment exists':
          PaymentModel.clearAll();
          PaymentModel.createTransaction({
            transactionId: 'txn_settled123',
            status: 'SETTLED',
            amount: 150,
            currency: 'USD',
            authorizationCode: 'AUTH-123456',
            settlementId: 'settle_abc123',
            merchantId: 'merchant_123'
          });
          break;

        default:
          console.log(`[Pact State] Unknown state: "${state}"`);
      }

      return res.status(200).json({ 
        result: 'State setup complete',
        state: state 
      });
    } catch (error) {
      console.error(`[Pact State] Error setting up state "${state}":`, error);
      return res.status(500).json({ 
        error: 'State setup failed',
        message: error.message 
      });
    }
  }

  /**
   * Health check for Pact state endpoint
   * GET /_pact/provider-states
   */
  static healthCheck(req, res) {
    return res.status(200).json({
      status: 'ready',
      message: 'Pact provider state handler is available'
    });
  }
}

module.exports = PactStateController;
