# Quick Start - Demo Scenarios

## Prerequisites Check
```bash
# 1. Check provider is running
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Check Pact Broker is running
curl http://localhost:9292/
# Expected: HTML response

# 3. If not running, start them:
cd provider && npm start &
docker-compose up -d
```

## Run Demos

### Option 1: All Scenarios (Recommended)
```bash
cd demos
./run-all-scenarios.sh
```
**Duration**: ~30 minutes  
**Interactive**: Press Enter between scenarios

### Option 2: Individual Scenarios
```bash
cd demos/scenarios

# Scenario 1: Happy Path ✅
./01-happy-path.sh

# Scenario 2: Backward Compatible ✅
./02-backward-compatible.sh

# Scenario 3: Breaking Consumer ❌
./03-breaking-consumer.sh

# Scenario 4: Breaking Provider ❌
./04-breaking-provider.sh

# Scenario 5: Schema Mismatch ❌
./05-schema-mismatch.sh

# Scenario 6: CI/CD Gate ⛔
./06-cicd-gate.sh
```

## What to Expect

Each scenario shows:
```
════════════════════════════════════════════════════════════
  SCENARIO X: Description
════════════════════════════════════════════════════════════

📝 Step 1: Initial state
🔧 Step 2: Changes made
🧪 Step 3: Tests run
📤 Step 4: Contracts published
🔍 Step 5: Can-I-Deploy check
✅/❌ Step 6: Final result

════════════════════════════════════════════════════════════
  RESULT: Summary with key learnings
════════════════════════════════════════════════════════════
```

## Quick Results Reference

| Scenario | Deploy? | Reason |
|----------|---------|--------|
| 1. Happy Path | ✅ Yes | Fully compatible |
| 2. Backward Compatible | ✅ Yes | Optional field added |
| 3. Breaking Consumer | ⛔ No | Field expectation not met |
| 4. Breaking Provider | ⛔ No | Endpoint removed |
| 5. Schema Mismatch | ⛔ No | Type changed |
| 6. CI/CD Gate | ⛔ No | Pipeline blocked |

## After Running

### View Results in Pact Broker
```bash
open http://localhost:9292
```

Look for:
- **Published contracts** - Consumer expectations
- **Verification results** - Provider compatibility
- **Matrix** - Overall compatibility status
- **Tags** - Version tracking

### Cleanup
```bash
cd demos
./cleanup-demos.sh
```

This removes:
- Demo branches
- Uncommitted changes
- Returns to main branch
- Stops provider

## Troubleshooting

### Provider Not Responding
```bash
# Check if running
curl http://localhost:3000/health

# Start if needed
cd provider
npm start
```

### Broker Not Available
```bash
# Check status
docker-compose ps

# Restart if needed
docker-compose restart

# View logs
docker-compose logs -f
```

### Scripts Not Executable
```bash
cd demos
chmod +x run-all-scenarios.sh cleanup-demos.sh scenarios/*.sh
```

## Deep Dive

For detailed explanations:
- **Visual Guide**: [demos/DEMO_GUIDE.md](./DEMO_GUIDE.md)
- **Phase Summary**: [docs/PHASE6_SUMMARY.md](../docs/PHASE6_SUMMARY.md)
- **CI/CD Details**: [docs/CI_CD_PIPELINE.md](../docs/CI_CD_PIPELINE.md)

## Tips

### For Learning
- Run scenarios one at a time
- Read the output carefully
- Check Pact Broker between scenarios
- Experiment with modifications

### For Presentations
- Use `run-all-scenarios.sh` for continuous demo
- Focus on Scenario 6 for stakeholders
- Show Pact Broker UI for visibility
- Highlight automatic blocking

### For Testing
- Modify scenario scripts for your use cases
- Add your own scenarios
- Test different breaking changes
- Validate your own contracts

---

**Ready to see contract testing in action?** 🚀

```bash
cd demos && ./run-all-scenarios.sh
```
