const { v4: uuidv4 } = require('uuid');
const PaymentModel = require('../models/payment.model');

class AuthorizationController {
  static authorizePayment(req, res) {
    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      amount,
      currency,
      merchantId
    } = req.body;

    // Simulate card validation
    const isValidCard = AuthorizationController.validateCard(cardNumber);
    
    if (!isValidCard) {
      return res.status(402).json({
        error: 'PAYMENT_DECLINED',
        message: 'Invalid card number',
        transactionId: `txn_${uuidv4()}`
      });
    }

    // Simulate authorization
    const transactionId = `txn_${uuidv4()}`;
    const authorizationCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    const transaction = PaymentModel.createTransaction({
      transactionId,
      status: 'AUTHORIZED',
      amount,
      currency,
      authorizationCode,
      merchantId
    });

    return res.status(200).json({
      transactionId: transaction.transactionId,
      status: transaction.status,
      authorizationCode: transaction.authorizationCode,
      amount: transaction.amount,
      currency: transaction.currency,
      timestamp: transaction.createdAt,
      message: 'Payment authorized successfully'
    });
  }

  static validateCard(cardNumber) {
    // Simple Luhn algorithm check for demo
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      return false;
    }

    // Simulate declined cards for demo
    if (cardNumber.startsWith('4000')) {
      return false; // Declined cards
    }

    return true;
  }
}

module.exports = AuthorizationController;
