const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const path = require('path');
const PaymentService = require('../../src/services/payment.service');

const { like, eachLike, regex, datetime } = MatchersV3;

describe('Payment Gateway API - Consumer Contract Tests', () => {
  // Initialize Pact
  const provider = new PactV3({
    consumer: 'payment-client',
    provider: 'payment-gateway-api',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn'
  });

  describe('Authorization Endpoint', () => {
    test('successfully authorizes a payment', async () => {
      // Define the expected interaction
      await provider
        .given('a valid payment card')
        .uponReceiving('a request to authorize payment')
        .withRequest({
          method: 'POST',
          path: '/api/payments/authorize',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            cardNumber: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            amount: 99.99,
            currency: 'USD',
            merchantId: 'MERCH-12345'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            transactionId: like('txn_abc123def456'),
            status: 'AUTHORIZED',
            authorizationCode: regex('AUTH-\\d{6}', 'AUTH-789012'),
            amount: 99.99,
            currency: 'USD',
            timestamp: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:00:00Z'),
            message: like('Payment authorized successfully')
          }
        })
        .executeTest(async (mockServer) => {
          // Create service with mock server URL
          const paymentService = new PaymentService(mockServer.url);

          // Execute the request
          const result = await paymentService.authorizePayment({
            cardNumber: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            amount: 99.99,
            currency: 'USD',
            merchantId: 'MERCH-12345'
          });

          // Verify the response
          expect(result).toHaveProperty('transactionId');
          expect(result.status).toBe('AUTHORIZED');
          expect(result).toHaveProperty('authorizationCode');
          expect(result.amount).toBe(99.99);
          expect(result.currency).toBe('USD');
        });
    });

    test('handles declined payment', async () => {
      await provider
        .given('an invalid payment card')
        .uponReceiving('a request to authorize payment with invalid card')
        .withRequest({
          method: 'POST',
          path: '/api/payments/authorize',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            cardNumber: '4000000000000000',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            amount: 50.00,
            currency: 'USD',
            merchantId: 'MERCH-12345'
          }
        })
        .willRespondWith({
          status: 402,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            error: 'PAYMENT_DECLINED',
            message: like('Invalid card number'),
            transactionId: like('txn_xyz789')
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          await expect(
            paymentService.authorizePayment({
              cardNumber: '4000000000000000',
              expiryMonth: '12',
              expiryYear: '2025',
              cvv: '123',
              amount: 50.00,
              currency: 'USD',
              merchantId: 'MERCH-12345'
            })
          ).rejects.toThrow();
        });
    });
  });

  describe('Settlement Endpoint', () => {
    test('successfully settles a payment', async () => {
      await provider
        .given('an authorized payment exists')
        .uponReceiving('a request to settle payment')
        .withRequest({
          method: 'POST',
          path: '/api/payments/settle',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            transactionId: like('txn_abc123def456'),
            authorizationCode: like('AUTH-789012'),
            amount: 99.99,
            currency: 'USD'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            transactionId: like('txn_abc123def456'),
            settlementId: regex('settle_[a-z0-9]+', 'settle_xyz456'),
            status: 'SETTLED',
            amount: 99.99,
            currency: 'USD',
            timestamp: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:05:00Z'),
            message: like('Payment settled successfully')
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          const result = await paymentService.settlePayment({
            transactionId: 'txn_abc123def456',
            authorizationCode: 'AUTH-789012',
            amount: 99.99,
            currency: 'USD'
          });

          expect(result).toHaveProperty('transactionId');
          expect(result).toHaveProperty('settlementId');
          expect(result.status).toBe('SETTLED');
          expect(result.amount).toBe(99.99);
        });
    });

    test('handles transaction not found', async () => {
      await provider
        .given('no transaction exists')
        .uponReceiving('a request to settle non-existent payment')
        .withRequest({
          method: 'POST',
          path: '/api/payments/settle',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            transactionId: 'txn_nonexistent',
            authorizationCode: 'AUTH-000000',
            amount: 99.99,
            currency: 'USD'
          }
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            error: 'TRANSACTION_NOT_FOUND',
            message: like('Transaction not found'),
            transactionId: 'txn_nonexistent'
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          await expect(
            paymentService.settlePayment({
              transactionId: 'txn_nonexistent',
              authorizationCode: 'AUTH-000000',
              amount: 99.99,
              currency: 'USD'
            })
          ).rejects.toThrow();
        });
    });
  });

  describe('Payment Status Endpoint', () => {
    test('retrieves payment status for authorized payment', async () => {
      await provider
        .given('an authorized payment exists')
        .uponReceiving('a request to get payment status')
        .withRequest({
          method: 'GET',
          path: regex('/api/payments/txn_[a-z0-9\\-]+', '/api/payments/txn_abc123def456')
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            transactionId: like('txn_abc123def456'),
            status: 'AUTHORIZED',
            amount: 99.99,
            currency: 'USD',
            authorizationCode: like('AUTH-789012'),
            createdAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:00:00Z'),
            updatedAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:00:00Z')
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          const result = await paymentService.getPaymentStatus('txn_abc123def456');

          expect(result).toHaveProperty('transactionId');
          expect(result).toHaveProperty('status');
          expect(result).toHaveProperty('amount');
          expect(result).toHaveProperty('currency');
          expect(result).toHaveProperty('createdAt');
          expect(result).toHaveProperty('updatedAt');
        });
    });

    test('retrieves payment status for settled payment', async () => {
      await provider
        .given('a settled payment exists')
        .uponReceiving('a request to get settled payment status')
        .withRequest({
          method: 'GET',
          path: regex('/api/payments/txn_[a-z0-9\\-]+', '/api/payments/txn_settled123')
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            transactionId: like('txn_settled123'),
            status: 'SETTLED',
            amount: 150.00,
            currency: 'USD',
            authorizationCode: like('AUTH-123456'),
            settlementId: like('settle_abc123'),
            createdAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:00:00Z'),
            updatedAt: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:05:00Z')
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          const result = await paymentService.getPaymentStatus('txn_settled123');

          expect(result.status).toBe('SETTLED');
          expect(result).toHaveProperty('settlementId');
        });
    });

    test('handles payment not found', async () => {
      await provider
        .given('no transaction exists')
        .uponReceiving('a request to get non-existent payment status')
        .withRequest({
          method: 'GET',
          path: '/api/payments/txn_nonexistent'
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            error: 'TRANSACTION_NOT_FOUND',
            message: like('Transaction not found'),
            transactionId: 'txn_nonexistent'
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          await expect(
            paymentService.getPaymentStatus('txn_nonexistent')
          ).rejects.toThrow();
        });
    });
  });

  describe('Refund Endpoint', () => {
    test('successfully processes a refund', async () => {
      await provider
        .given('a settled payment exists')
        .uponReceiving('a request to refund payment')
        .withRequest({
          method: 'POST',
          path: '/api/payments/refund',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            transactionId: like('txn_settled123'),
            amount: 99.99,
            currency: 'USD',
            reason: like('Customer requested refund')
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            transactionId: like('txn_settled123'),
            refundId: regex('refund_[a-z0-9]+', 'refund_123abc'),
            status: 'REFUNDED',
            amount: 99.99,
            currency: 'USD',
            timestamp: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T11:00:00Z'),
            message: like('Refund processed successfully')
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          const result = await paymentService.refundPayment({
            transactionId: 'txn_settled123',
            amount: 99.99,
            currency: 'USD',
            reason: 'Customer requested refund'
          });

          expect(result).toHaveProperty('transactionId');
          expect(result).toHaveProperty('refundId');
          expect(result.status).toBe('REFUNDED');
          expect(result.amount).toBe(99.99);
        });
    });

    test('handles refund for non-existent transaction', async () => {
      await provider
        .given('no transaction exists')
        .uponReceiving('a request to refund non-existent payment')
        .withRequest({
          method: 'POST',
          path: '/api/payments/refund',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            transactionId: 'txn_nonexistent',
            amount: 50.00,
            currency: 'USD',
            reason: 'Test refund'
          }
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            error: 'TRANSACTION_NOT_FOUND',
            message: like('Transaction not found'),
            transactionId: 'txn_nonexistent'
          }
        })
        .executeTest(async (mockServer) => {
          const paymentService = new PaymentService(mockServer.url);

          await expect(
            paymentService.refundPayment({
              transactionId: 'txn_nonexistent',
              amount: 50.00,
              currency: 'USD',
              reason: 'Test refund'
            })
          ).rejects.toThrow();
        });
    });
  });
});
