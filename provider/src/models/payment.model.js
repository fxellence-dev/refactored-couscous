// In-memory storage for demo purposes
const transactions = new Map();

// Format timestamp without milliseconds to match Pact expectations
// Converts from: 2025-12-06T14:30:17.123Z
// To: 2025-12-06T14:30:17Z
function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

class PaymentModel {
  static createTransaction(data) {
    const transaction = {
      transactionId: data.transactionId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      authorizationCode: data.authorizationCode,
      settlementId: data.settlementId || null,
      refundId: data.refundId || null,
      merchantId: data.merchantId,
      createdAt: formatTimestamp(),
      updatedAt: formatTimestamp()
    };

    transactions.set(transaction.transactionId, transaction);
    return transaction;
  }

  static getTransaction(transactionId) {
    return transactions.get(transactionId);
  }

  static updateTransaction(transactionId, updates) {
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return null;
    }

    const updated = {
      ...transaction,
      ...updates,
      updatedAt: formatTimestamp()
    };

    transactions.set(transactionId, updated);
    return updated;
  }

  static getAllTransactions() {
    return Array.from(transactions.values());
  }

  static clearAll() {
    transactions.clear();
  }
}

module.exports = PaymentModel;
