#!/bin/bash

# Run all demo scenarios sequentially

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Bi-Directional Pact Testing - Complete Demo Suite        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCENARIOS_DIR="$SCRIPT_DIR/scenarios"

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo ""

# Check if provider is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Provider not running. Starting..."
    cd "$SCRIPT_DIR/../provider"
    npm start &
    PROVIDER_PID=$!
    sleep 5
    echo "✅ Provider started (PID: $PROVIDER_PID)"
else
    echo "✅ Provider is running"
fi

# Check if Pact Broker is running
if ! curl -s http://localhost:9292/ > /dev/null 2>&1; then
    echo "❌ Pact Broker not running!"
    echo "   Start it with: docker-compose up -d"
    exit 1
else
    echo "✅ Pact Broker is running"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run scenarios
SCENARIOS=(
    "01-happy-path.sh"
    "02-backward-compatible.sh"
    "03-breaking-consumer.sh"
    "04-breaking-provider.sh"
    "05-schema-mismatch.sh"
    "06-cicd-gate.sh"
)

for scenario in "${SCENARIOS[@]}"; do
    if [ -f "$SCENARIOS_DIR/$scenario" ]; then
        echo "Running: $scenario"
        bash "$SCENARIOS_DIR/$scenario"
        echo ""
        echo "Press Enter to continue to next scenario..."
        read
        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo ""
    else
        echo "⚠️  Scenario not found: $scenario"
    fi
done

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  All Scenarios Complete! ✅                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary of Demonstrations:"
echo "   ✅ Scenario 1: Happy path (compatible contracts)"
echo "   ✅ Scenario 2: Backward compatible change"
echo "   ❌ Scenario 3: Breaking consumer change (blocked)"
echo "   ❌ Scenario 4: Breaking provider change (blocked)"
echo "   ❌ Scenario 5: Schema type mismatch (blocked)"
echo "   ⛔ Scenario 6: CI/CD gate in action"
echo ""
echo "🎓 Key Learnings:"
echo "   • Contract testing prevents breaking changes"
echo "   • Deployment gates protect production"
echo "   • Early detection saves debugging time"
echo "   • Independent service deployment is safe"
echo ""
echo "📖 Next Steps:"
echo "   • Review Pact Broker: http://localhost:9292"
echo "   • Check verification results"
echo "   • View contract matrix"
echo "   • Test in GitHub Actions"
echo ""
