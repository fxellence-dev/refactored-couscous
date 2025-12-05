require('dotenv').config();
const PaymentService = require('./services/payment.service');

async function main() {
  const paymentService = new PaymentService();

  console.log('🔷 Payment Client Demo\n');

  try {
    // Example 1: Authorize a payment
    console.log('1️⃣  Authorizing payment...');
    const authResult = await paymentService.authorizePayment({
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      amount: 150.00,
      currency: 'USD',
      merchantId: 'MERCH-12345'
    });
    console.log('   ✅ Authorization successful:', authResult.transactionId);
    console.log('   📋 Auth Code:', authResult.authorizationCode);

    // Example 2: Get payment status
    console.log('\n2️⃣  Getting payment status...');
    const status = await paymentService.getPaymentStatus(authResult.transactionId);
    console.log('   ✅ Status:', status.status);

    // Example 3: Settle the payment
    console.log('\n3️⃣  Settling payment...');
    const settlementResult = await paymentService.settlePayment({
      transactionId: authResult.transactionId,
      authorizationCode: authResult.authorizationCode,
      amount: authResult.amount,
      currency: authResult.currency
    });
    console.log('   ✅ Settlement successful:', settlementResult.settlementId);

    // Example 4: Refund the payment
    console.log('\n4️⃣  Processing refund...');
    const refundResult = await paymentService.refundPayment({
      transactionId: authResult.transactionId,
      amount: 150.00,
      currency: 'USD',
      reason: 'Customer requested refund'
    });
    console.log('   ✅ Refund successful:', refundResult.refundId);

    console.log('\n✨ All operations completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PaymentService };
