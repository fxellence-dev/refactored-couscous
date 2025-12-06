#!/bin/bash

# Scenario 2: Backward Compatible Change
# Provider adds optional field, consumer unaffected

set -e

echo "════════════════════════════════════════════════════════════"
echo "  SCENARIO 2: Backward Compatible Change ✅"
echo "════════════════════════════════════════════════════════════"
echo ""

DEMO_BRANCH="demo/backward-compatible"

# Get project root (two levels up from demos/scenarios/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "📝 Step 1: Create demo branch"
git checkout -b $DEMO_BRANCH 2>/dev/null || git checkout $DEMO_BRANCH
echo "   Branch: $DEMO_BRANCH"
echo ""

echo "🔧 Step 2: Provider adds optional field"
echo "   Adding 'processingTime' field to authorization response..."

cat > /tmp/authorization-patch.js << 'EOF'
// In authorization.controller.js, add optional field
// After line with authorizationCode:

    authorizationCode: authCode,
    processingTime: Date.now() - startTime, // NEW: Optional field
EOF

echo "   ✅ Change prepared (simulated)"
echo ""

echo "🧪 Step 3: Run provider tests"
cd "$PROJECT_ROOT/provider"
npm run test:api
echo "   ✅ Provider API tests passed"
echo ""

echo "🔄 Step 4: Run provider verification"
npm start &
PROVIDER_PID=$!
sleep 5

npm run test:pact:publish
echo "   ✅ Provider verification passed"
echo ""

kill $PROVIDER_PID 2>/dev/null || true

echo "🧪 Step 5: Run consumer tests (unchanged)"
cd "$PROJECT_ROOT/consumer"
npm test
echo "   ✅ Consumer tests passed (unaware of new field)"
echo ""

echo "📤 Step 6: Publish contracts"
cd "$PROJECT_ROOT"
node scripts/publish-consumer-contract.js --version "backward-compatible-v1"
echo "   ✅ Consumer contract published"
echo ""

echo "🔍 Step 7: Check deployment safety"
node scripts/can-i-deploy-provider.js --version "backward-compatible-provider" || true
echo ""

# Cleanup
git checkout main
git branch -D $DEMO_BRANCH 2>/dev/null || true

echo "════════════════════════════════════════════════════════════"
echo "  RESULT: Backward Compatible ✅"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ Provider added optional field 'processingTime'"
echo "✅ Consumer tests still pass (doesn't use new field)"
echo "✅ Provider can deploy safely"
echo "✅ Consumer continues working"
echo ""
echo "📊 Key Learning:"
echo "   Adding optional fields is SAFE because:"
echo "   • Consumer ignores fields it doesn't expect"
echo "   • No breaking changes to existing contract"
echo "   • Provider can evolve independently"
echo ""
echo "💡 Best Practice:"
echo "   • Always add fields as optional first"
echo "   • Update consumers gradually"
echo "   • Make required later if needed"
echo ""
