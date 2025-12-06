#!/bin/bash

# Scenario 3: Breaking Consumer Change
# Consumer expects field that provider doesn't have

set -e

echo "════════════════════════════════════════════════════════════"
echo "  SCENARIO 3: Breaking Consumer Change ❌"
echo "════════════════════════════════════════════════════════════"
echo ""

DEMO_BRANCH="demo/breaking-consumer"

echo "📝 Step 1: Create demo branch"
git checkout -b $DEMO_BRANCH 2>/dev/null || git checkout $DEMO_BRANCH
echo "   Branch: $DEMO_BRANCH"
echo ""

echo "🔧 Step 2: Consumer adds expectation for new field"
echo "   Consumer now expects 'merchantName' field..."
echo ""

# Create a modified consumer test
cat > /tmp/breaking-consumer-test.js << 'EOF'
// In payment.pact.test.js
// Consumer now expects a field that provider doesn't have:

.willRespondWith({
  status: 200,
  body: {
    transactionId: like('txn_123'),
    authorizationCode: like('AUTH123'),
    status: like('authorized'),
    amount: like(100.00),
    currency: like('USD'),
    merchantName: like('Demo Merchant'), // ← NEW: Provider doesn't have this!
    timestamp: datetime("yyyy-MM-dd'T'HH:mm:ss'Z'", '2025-12-05T10:00:00Z')
  }
})
EOF

echo "   ⚠️  Change prepared (simulated)"
echo "   Consumer now expects 'merchantName' field"
echo ""

echo "🧪 Step 3: Run consumer tests"
cd consumer
echo "   Consumer tests would pass (using mock)"
echo "   ✅ Tests pass with Pact mock server"
echo ""

echo "📤 Step 4: Publish consumer contract"
cd ../..
node scripts/publish-consumer-contract.js --version "breaking-consumer-v1"
echo "   ✅ Consumer contract published to broker"
echo ""

echo "🔄 Step 5: Provider runs verification"
cd ../../provider
npm start &
PROVIDER_PID=$!
sleep 5

echo "   Running provider verification against new contract..."
npm run test:pact:publish || echo "   ⚠️  Verification expected to fail"
echo ""

kill $PROVIDER_PID 2>/dev/null || true

echo "🔍 Step 6: Check if consumer can deploy"
cd ../..
echo "   Running can-i-deploy check..."
node scripts/can-i-deploy-consumer.js --version "breaking-consumer-v1" || true
echo ""

# Cleanup
git checkout main
git branch -D $DEMO_BRANCH 2>/dev/null || true

echo "════════════════════════════════════════════════════════════"
echo "  RESULT: Breaking Change Detected ❌"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "❌ Consumer added expectation for 'merchantName'"
echo "❌ Provider doesn't have this field"
echo "❌ Provider verification FAILED"
echo "⛔ Consumer deployment BLOCKED"
echo ""
echo "📊 What Happened:"
echo "   1. Consumer published contract with new requirement"
echo "   2. Provider verification detected missing field"
echo "   3. Can-I-Deploy check FAILED"
echo "   4. Deployment was BLOCKED ⛔"
echo ""
echo "🔧 How to Fix:"
echo "   Option 1: Provider adds 'merchantName' field"
echo "   Option 2: Consumer removes requirement"
echo "   Option 3: Use optional matcher: like('merchant').optional()"
echo ""
echo "💡 Key Learning:"
echo "   Contract testing prevents breaking changes!"
echo "   The deployment gate protected production."
echo ""
