const axios = require('axios');

class PaymentService {
  constructor(baseUrl = process.env.PAYMENT_API_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.timeout = parseInt(process.env.PAYMENT_API_TIMEOUT) || 5000;
  }

  /**
   * Authorize a payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Authorization response
   */
  async authorizePayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/payments/authorize`,
        paymentData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Authorization failed');
      }
      throw error;
    }
  }

  /**
   * Settle a payment
   * @param {Object} settlementData - Settlement details
   * @returns {Promise<Object>} Settlement response
   */
  async settlePayment(settlementData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/payments/settle`,
        settlementData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Settlement failed');
      }
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/payments/${transactionId}`,
        {
          timeout: this.timeout
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get payment status');
      }
      throw error;
    }
  }

  /**
   * Refund a payment
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund response
   */
  async refundPayment(refundData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/payments/refund`,
        refundData,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Refund failed');
      }
      throw error;
    }
  }

  /**
   * Process a complete payment flow (authorize + settle)
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Complete payment result
   */
  async processPayment(paymentData) {
    // Step 1: Authorize
    const authResult = await this.authorizePayment(paymentData);
    
    // Step 2: Settle
    const settlementResult = await this.settlePayment({
      transactionId: authResult.transactionId,
      authorizationCode: authResult.authorizationCode,
      amount: authResult.amount,
      currency: authResult.currency
    });

    return {
      authorization: authResult,
      settlement: settlementResult
    };
  }
}

module.exports = PaymentService;
