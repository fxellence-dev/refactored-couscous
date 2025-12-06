#!/bin/bash

# Scenario 4: Breaking Provider Change
# Provider removes endpoint that consumer uses

set -e

echo "════════════════════════════════════════════════════════════"
echo "  SCENARIO 4: Breaking Provider Change ❌"
echo "════════════════════════════════════════════════════════════"
echo ""

DEMO_BRANCH="demo/breaking-provider"

# Get project root (two levels up from demos/scenarios/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "📝 Step 1: Create demo branch"
git checkout -b $DEMO_BRANCH 2>/dev/null || git checkout $DEMO_BRANCH
echo "   Branch: $DEMO_BRANCH"
echo ""

echo "🔧 Step 2: Provider removes /refund endpoint"
echo "   Simulating removal of refund functionality..."
echo ""

cat > /tmp/breaking-provider-change.js << 'EOF'
// In provider/src/routes/payment.routes.js
// Comment out the refund route:

// router.post('/refund', settlementController.refundPayment);  // ← REMOVED!

// This breaks consumers that still expect this endpoint
EOF

echo "   ⚠️  Change prepared (simulated)"
echo "   Refund endpoint would be removed"
echo ""

echo "🧪 Step 3: Run provider API tests"
cd ../../provider
echo "   Provider tests would still pass (reduced functionality)"
echo "   ✅ Remaining tests pass"
echo ""

echo "🔄 Step 4: Provider runs verification"
echo "   Starting provider for verification..."
npm start &
PROVIDER_PID=$!
sleep 5

echo "   Running verification against existing consumer contracts..."
npm run test:pact:publish || echo "   ❌ Verification fails - consumer expects /refund"
echo ""

kill $PROVIDER_PID 2>/dev/null || true

echo "🔍 Step 5: Check if provider can deploy"
cd ../..
echo "   Running can-i-deploy check..."
node scripts/can-i-deploy-provider.js --version "breaking-provider-v1" || true
echo ""

# Cleanup
git checkout main
git branch -D $DEMO_BRANCH 2>/dev/null || true

echo "════════════════════════════════════════════════════════════"
echo "  RESULT: Breaking Change Detected ❌"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "❌ Provider removed /refund endpoint"
echo "❌ Consumer contract still expects it"
echo "❌ Provider verification FAILED"
echo "⛔ Provider deployment BLOCKED"
echo ""
echo "📊 What Happened:"
echo "   1. Provider removed an endpoint"
echo "   2. Consumer contract still has expectations for it"
echo "   3. Verification detected missing endpoint"
echo "   4. Can-I-Deploy check FAILED"
echo "   5. Deployment was BLOCKED ⛔"
echo ""
echo "🔧 How to Fix:"
echo "   Option 1: Restore the /refund endpoint"
echo "   Option 2: Deprecate gradually:"
echo "      a. Mark endpoint as deprecated"
echo "      b. Update all consumers to stop using it"
echo "      c. Verify no consumers need it"
echo "      d. Then safely remove"
echo ""
echo "💡 Key Learning:"
echo "   Never remove endpoints without checking consumers!"
echo "   Contract testing enforces backward compatibility."
echo ""
echo "📖 Best Practice:"
echo "   Use versioned endpoints: /v1/refund → /v2/refund"
echo "   Keep v1 until all consumers migrate to v2"
echo ""
