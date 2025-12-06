const { v4: uuidv4 } = require('uuid');
const PaymentModel = require('../models/payment.model');

class SettlementController {
  static settlePayment(req, res) {
    const {
      transactionId,
      authorizationCode,
      amount,
      currency
    } = req.body;

    // Get the transaction
    const transaction = PaymentModel.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        error: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        transactionId
      });
    }

    // Validate authorization code
    if (transaction.authorizationCode !== authorizationCode) {
      return res.status(400).json({
        error: 'INVALID_AUTHORIZATION_CODE',
        message: 'Authorization code does not match',
        transactionId
      });
    }

    // Check if already settled
    if (transaction.status === 'SETTLED') {
      return res.status(409).json({
        error: 'ALREADY_SETTLED',
        message: 'Transaction has already been settled',
        transactionId
      });
    }

    // Check if transaction is authorized
    if (transaction.status !== 'AUTHORIZED') {
      return res.status(409).json({
        error: 'INVALID_STATUS',
        message: `Cannot settle transaction with status: ${transaction.status}`,
        transactionId
      });
    }

    // Validate amount
    if (amount !== transaction.amount) {
      return res.status(400).json({
        error: 'AMOUNT_MISMATCH',
        message: 'Settlement amount does not match authorized amount',
        transactionId
      });
    }

    // Process settlement
    // Generate simple alphanumeric ID (not UUID) to match consumer expectations
    const settlementId = `settle_${Math.random().toString(36).substring(2, 8)}`;
    
    const updated = PaymentModel.updateTransaction(transactionId, {
      status: 'SETTLED',
      settlementId
    });

    return res.status(200).json({
      transactionId: updated.transactionId,
      settlementId: updated.settlementId,
      status: updated.status,
      amount: updated.amount,
      currency: updated.currency,
      timestamp: updated.updatedAt,
      message: 'Payment settled successfully'
    });
  }

  static getPaymentStatus(req, res) {
    const { transactionId } = req.params;

    const transaction = PaymentModel.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        error: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        transactionId
      });
    }

    const response = {
      transactionId: transaction.transactionId,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };

    if (transaction.authorizationCode) {
      response.authorizationCode = transaction.authorizationCode;
    }

    if (transaction.settlementId) {
      response.settlementId = transaction.settlementId;
    }

    if (transaction.refundId) {
      response.refundId = transaction.refundId;
    }

    return res.status(200).json(response);
  }

  static refundPayment(req, res) {
    const { transactionId, amount, currency, reason } = req.body;

    const transaction = PaymentModel.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        error: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        transactionId
      });
    }

    // Check if transaction is settled
    if (transaction.status !== 'SETTLED') {
      return res.status(409).json({
        error: 'CANNOT_REFUND',
        message: 'Can only refund settled transactions',
        transactionId
      });
    }

    // Check if already refunded
    if (transaction.status === 'REFUNDED') {
      return res.status(409).json({
        error: 'ALREADY_REFUNDED',
        message: 'Transaction has already been refunded',
        transactionId
      });
    }

    // Validate refund amount
    if (amount > transaction.amount) {
      return res.status(400).json({
        error: 'INVALID_AMOUNT',
        message: 'Refund amount cannot exceed original transaction amount',
        transactionId
      });
    }

    // Process refund
    // Generate simple alphanumeric ID (not UUID) to match consumer expectations
    const refundId = `refund_${Math.random().toString(36).substring(2, 8)}`;
    
    const updated = PaymentModel.updateTransaction(transactionId, {
      status: 'REFUNDED',
      refundId
    });

    return res.status(200).json({
      transactionId: updated.transactionId,
      refundId: updated.refundId,
      status: updated.status,
      amount: amount,
      currency: currency,
      timestamp: updated.updatedAt,
      message: 'Refund processed successfully'
    });
  }
}

module.exports = SettlementController;
