// In-memory storage for demo purposes
const transactions = new Map();

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
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
