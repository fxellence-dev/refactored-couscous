# Phase 6 Demo Scenarios - Visual Guide

## 🎯 Objective
Demonstrate bi-directional Pact testing and CI/CD deployment gates through 6 comprehensive scenarios showing both successful and blocked deployments.

## 📊 Demo Flow Diagram

```
                    ┌─────────────────────────┐
                    │   Consumer Changes      │
                    └───────────┬─────────────┘
                                │
                                ↓
                    ┌─────────────────────────┐
                    │   Run Pact Tests        │
                    │   Generate Contract     │
                    └───────────┬─────────────┘
                                │
                                ↓
                    ┌─────────────────────────┐
                    │   Publish to Broker     │
                    └───────────┬─────────────┘
                                │
                                ↓
                    ┌─────────────────────────┐
                    │   Provider Verification │
                    └───────────┬─────────────┘
                                │
                                ↓
                    ┌─────────────────────────┐
                    │   Publish Results       │
                    └───────────┬─────────────┘
                                │
                                ↓
                    ┌─────────────────────────┐
                    │   Can-I-Deploy Check    │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
         ✅ Compatible                  ❌ Incompatible
                │                               │
                ↓                               ↓
    ┌─────────────────────┐       ┌─────────────────────┐
    │  Deploy to Prod ✅   │       │  Block Deploy ⛔     │
    └─────────────────────┘       └─────────────────────┘
```

## 🎬 Scenarios Overview

### Scenario 1: Happy Path ✅
**What**: Both services work perfectly together
**Expected**: All deployments succeed

```
Consumer ──[expects]──> Provider
    ✅                      ✅
[compatible contract]
         ↓
    Deploy Both ✅
```

**Key Points**:
- Consumer tests pass with Pact mock
- Provider verification passes
- Can-i-deploy succeeds for both
- Safe to deploy independently

---

### Scenario 2: Backward Compatible Change ✅
**What**: Provider adds optional field
**Expected**: Provider can deploy, consumer unaffected

```
Provider adds:
{ processingTime: 123 }  ← New optional field

Consumer ignores: ✅
Still expects old fields only

Result: Deploy Provider ✅
```

**Key Points**:
- Adding optional fields is SAFE
- Consumer doesn't break
- Provider can evolve independently
- Best practice: optional → required transition

---

### Scenario 3: Breaking Consumer Change ❌
**What**: Consumer expects field provider doesn't have
**Expected**: Consumer deployment blocked

```
Consumer expects:
{ merchantName: "Demo" }  ← Provider doesn't have this!
                  ↓
           Verification FAILS ❌
                  ↓
         Block Consumer Deploy ⛔
```

**Key Points**:
- Contract mismatch detected
- Provider verification fails
- Can-i-deploy blocks consumer
- Must fix before deploying

---

### Scenario 4: Breaking Provider Change ❌
**What**: Provider removes endpoint consumer uses
**Expected**: Provider deployment blocked

```
Provider removes:
POST /api/payments/refund  ← Consumer still calls this!
                  ↓
         Verification FAILS ❌
                  ↓
        Block Provider Deploy ⛔
```

**Key Points**:
- Endpoint removal is breaking
- Consumer expects removed functionality
- Verification fails
- Must deprecate gradually, not remove

---

### Scenario 5: Schema Type Mismatch ❌
**What**: Provider changes field type
**Expected**: Provider deployment blocked

```
Before:  { amount: "100.00" }  // string
After:   { amount: 100.00 }    // number
              ↓
      Type Mismatch FAILS ❌
              ↓
    Block Provider Deploy ⛔
```

**Key Points**:
- Schema changes are breaking
- Type safety enforced
- Verification catches mismatch
- Coordinate breaking changes

---

### Scenario 6: CI/CD Gate in Action ⛔
**What**: GitHub Actions blocks incompatible deployment
**Expected**: Pipeline stops at can-i-deploy step

```
GitHub Actions Pipeline:
┌──────────────────────────────────┐
│ 1. Run Tests          ✅         │
│ 2. Publish Contract   ✅         │
│ 3. Can-I-Deploy       ❌         │ ← STOPS HERE
│ 4. Deploy             ⊘ Skipped │
└──────────────────────────────────┘

Result: PR Comment with error ⚠️
```

**Key Points**:
- Automated deployment gate
- No manual checks needed
- PR gets failure notification
- Production protected

---

## 🚀 Running the Demos

### Quick Start
```bash
cd demos
./run-all-scenarios.sh
```

### Individual Scenario
```bash
cd demos/scenarios
./01-happy-path.sh
```

### Prerequisites
1. **Provider Running**: `cd provider && npm start`
2. **Pact Broker Running**: `docker-compose up -d`
3. **Dependencies Installed**: `npm install` in root, consumer, provider

### What You'll See

Each scenario outputs:
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
  RESULT: Summary
════════════════════════════════════════════════════════════
```

---

## 📊 Expected Outcomes Matrix

| Scenario | Consumer Tests | Provider Verification | Can-I-Deploy | Deployment |
|----------|---------------|----------------------|--------------|------------|
| 1. Happy Path | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Success |
| 2. Backward Compatible | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Success |
| 3. Breaking Consumer | ✅ Pass | ❌ Fail | ❌ Fail | ⛔ Blocked |
| 4. Breaking Provider | ✅ Pass | ❌ Fail | ❌ Fail | ⛔ Blocked |
| 5. Schema Mismatch | ✅ Pass | ❌ Fail | ❌ Fail | ⛔ Blocked |
| 6. CI/CD Gate | ✅ Pass | ❌ Fail | ❌ Fail | ⛔ Blocked |

---

## 🎓 Learning Outcomes

### What These Demos Prove

1. **Contract Testing Works**
   - Detects incompatibilities before production
   - Validates both structure and types
   - Works with independent deployments

2. **Deployment Gates Protect Production**
   - Automated safety checks
   - No manual verification needed
   - Clear failure reasons

3. **Safe Evolution Patterns**
   - Add optional fields first
   - Deprecate before removing
   - Coordinate breaking changes

4. **Fast Feedback Loop**
   - Fails fast in CI
   - Clear error messages
   - Guides developers to fix

### Common Patterns Demonstrated

✅ **Safe Changes**:
- Adding optional fields
- Adding new endpoints
- Making required fields optional

❌ **Breaking Changes**:
- Removing endpoints
- Removing fields
- Changing field types
- Making optional fields required

---

## 🔧 Troubleshooting

### Provider Not Starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Start provider
cd provider && npm start
```

### Pact Broker Not Running
```bash
# Check broker status
docker-compose ps

# Start broker
docker-compose up -d

# View logs
docker-compose logs -f
```

### Tests Failing
```bash
# Clean and reinstall
npm run clean
npm install

# Reset broker (nuclear option)
docker-compose down -v
docker-compose up -d
```

---

## 🎯 Success Criteria

After running all scenarios, you should see:

✅ Scenario 1: Both services deploy successfully  
✅ Scenario 2: Provider deploys, consumer unaffected  
❌ Scenario 3: Consumer deployment blocked  
❌ Scenario 4: Provider deployment blocked  
❌ Scenario 5: Type mismatch caught  
⛔ Scenario 6: CI/CD gate activated  

### Pact Broker State
- Multiple consumer versions published
- Provider verification results visible
- Matrix showing compatibility
- Tags showing deployment state

---

## 🧹 Cleanup

After demos:
```bash
./cleanup-demos.sh
```

This will:
- Remove demo branches
- Reset to main branch
- Clean uncommitted changes
- Stop running providers

---

## 📚 Related Documentation

- [CI/CD Pipeline Guide](../docs/CI_CD_PIPELINE.md)
- [GitHub Actions Setup](../docs/GITHUB_ACTIONS_SETUP.md)
- [Phase 5 Summary](../docs/PHASE5_SUMMARY.md)
- [Main README](../README.md)

---

## 🎬 Next Steps

1. **Run All Scenarios**: `./run-all-scenarios.sh`
2. **Review Broker**: http://localhost:9292
3. **Check Matrix**: View consumer-provider compatibility
4. **Test in GitHub**: Push changes to see Actions
5. **Customize**: Adapt scenarios for your use case

---

## 💡 Tips for Demonstrations

### For Teams
1. Run scenarios in team meeting
2. Discuss each outcome
3. Identify similar cases in your codebase
4. Plan contract testing adoption

### For Stakeholders
1. Focus on Scenario 6 (CI/CD Gate)
2. Show cost of production incidents prevented
3. Demonstrate fast feedback
4. Highlight independent deployment capability

### For Developers
1. Study the test code
2. Experiment with breaking changes
3. Practice fixing incompatibilities
4. Learn matcher patterns

---

**Demo Duration**: ~30 minutes for all scenarios  
**Skill Level**: Intermediate  
**Prerequisites**: Basic understanding of APIs and testing  

🎉 **Ready to demonstrate the power of contract testing!**
