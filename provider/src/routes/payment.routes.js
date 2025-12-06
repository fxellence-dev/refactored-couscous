const express = require('express');
const router = express.Router();
const AuthorizationController = require('../controllers/authorization.controller');
const SettlementController = require('../controllers/settlement.controller');
const PactStateController = require('../controllers/pact-state.controller');
const {
  validateAuthorization,
  validateSettlement,
  validateRefund
} = require('../middleware/validation.middleware');

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Pact provider state endpoints (for contract testing)
router.post('/_pact/provider-states', PactStateController.handleProviderState);
router.get('/_pact/provider-states', PactStateController.healthCheck);

// Payment authorization
router.post('/api/payments/authorize', validateAuthorization, AuthorizationController.authorizePayment);

// Payment settlement
router.post('/api/payments/settle', validateSettlement, SettlementController.settlePayment);

// Get payment status
router.get('/api/payments/:transactionId', SettlementController.getPaymentStatus);

// Process refund
router.post('/api/payments/refund', validateRefund, SettlementController.refundPayment);

module.exports = router;
