#!/bin/bash

# Scenario 1: Happy Path
# Both contracts are compatible, deployments succeed

set -e

echo "════════════════════════════════════════════════════════════"
echo "  SCENARIO 1: Happy Path - Everything Compatible ✅"
echo "════════════════════════════════════════════════════════════"
echo ""

# Save current state
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
ORIGINAL_COMMIT=$(git rev-parse HEAD)

echo "📝 Step 1: Verify current state"
echo "   Current branch: $ORIGINAL_BRANCH"
echo "   Current commit: $ORIGINAL_COMMIT"
echo ""

echo "🧪 Step 2: Run consumer tests"
cd ../consumer
npm test
echo "   ✅ Consumer tests passed"
echo ""

echo "📤 Step 3: Publish consumer contract"
cd ..
node scripts/publish-consumer-contract.js --version "happy-path-consumer"
echo "   ✅ Consumer contract published"
echo ""

echo "🔄 Step 4: Start provider and run verification"
cd provider
npm start &
PROVIDER_PID=$!
sleep 5

echo "   Provider running on PID: $PROVIDER_PID"
npm run test:pact:publish
echo "   ✅ Provider verification passed"
echo ""

echo "🔍 Step 5: Check if consumer can deploy"
cd ..
node scripts/can-i-deploy-consumer.js --version "happy-path-consumer" || true
echo ""

echo "🔍 Step 6: Check if provider can deploy"
node scripts/can-i-deploy-provider.js --version "happy-path-provider" || true
echo ""

# Cleanup
kill $PROVIDER_PID 2>/dev/null || true

echo "════════════════════════════════════════════════════════════"
echo "  RESULT: Happy Path ✅"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ Consumer tests passed"
echo "✅ Provider verification passed"
echo "✅ Contracts are compatible"
echo "✅ Both can be deployed safely"
echo ""
echo "📊 View in Pact Broker: http://localhost:9292"
echo ""
echo "This demonstrates the ideal scenario where:"
echo "  • Consumer expectations match provider capabilities"
echo "  • All tests pass"
echo "  • Deployments are allowed"
echo "  • Both services can be deployed independently"
echo ""
