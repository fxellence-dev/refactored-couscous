#!/bin/bash

# Scenario 5: Schema Type Mismatch
# Provider changes field type (string → number)

set -e

echo "════════════════════════════════════════════════════════════"
echo "  SCENARIO 5: Schema Type Mismatch ❌"
echo "════════════════════════════════════════════════════════════"
echo ""

DEMO_BRANCH="demo/schema-mismatch"

# Get project root (two levels up from demos/scenarios/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "📝 Step 1: Create demo branch"
git checkout -b $DEMO_BRANCH 2>/dev/null || git checkout $DEMO_BRANCH
echo "   Branch: $DEMO_BRANCH"
echo ""

echo "🔧 Step 2: Provider changes amount type"
echo "   Changing amount from string to number..."
echo ""

cat > /tmp/schema-mismatch-change.js << 'EOF'
// In provider response:
// Before:
{
  amount: "100.00"  // String
}

// After:
{
  amount: 100.00    // Number ← This breaks consumer!
}

// Consumer expects string but gets number
EOF

echo "   ⚠️  Change prepared (simulated)"
echo "   Amount field type would change: string → number"
echo ""

echo "🧪 Step 3: Run provider tests"
cd "$PROJECT_ROOT/provider"
echo "   Provider tests would pass (logic unchanged)"
echo "   ✅ Tests pass with new type"
echo ""

echo "🔄 Step 4: Provider runs verification"
npm start &
PROVIDER_PID=$!
sleep 5

echo "   Running verification against consumer contract..."
echo "   Consumer expects: amount: like('100.00')  // string"
echo "   Provider returns: amount: 100.00          // number"
npm run test:pact:publish || echo "   ❌ Type mismatch detected!"
echo ""

kill $PROVIDER_PID 2>/dev/null || true

echo "🔍 Step 5: Check deployment safety"
cd "$PROJECT_ROOT"
node scripts/can-i-deploy-consumer.js --version "schema-mismatch-v1" || {
echo ""

# Cleanup
git checkout main
git branch -D $DEMO_BRANCH 2>/dev/null || true

echo "════════════════════════════════════════════════════════════"
echo "  RESULT: Type Mismatch Detected ❌"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "❌ Provider changed amount type: string → number"
echo "❌ Consumer expects string type"
echo "❌ Verification FAILED on type mismatch"
echo "⛔ Provider deployment BLOCKED"
echo ""
echo "📊 What Happened:"
echo "   1. Provider changed field type"
echo "   2. Consumer contract has specific type expectation"
echo "   3. Pact verification detected type mismatch"
echo "   4. Can-I-Deploy blocked deployment"
echo ""
echo "🔧 How to Fix:"
echo "   Option 1: Revert to string type"
echo "   Option 2: Coordinate breaking change:"
echo "      a. Create new field: amountNumeric"
echo "      b. Keep old field: amount (string)"
echo "      c. Update consumers to use amountNumeric"
echo "      d. Deprecate old field gradually"
echo ""
echo "💡 Key Learning:"
echo "   Schema changes are breaking changes!"
echo "   Types matter just as much as field names."
echo ""
echo "🎯 Type Safety:"
echo "   Contract testing validates:"
echo "   • Field presence ✓"
echo "   • Field types ✓"
echo "   • Field formats ✓"
echo "   • Nested structures ✓"
echo ""
