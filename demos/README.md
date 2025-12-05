# Demo Scenarios - Bi-Directional Pact Testing

This directory contains scripts and examples to demonstrate various contract testing scenarios in the CI/CD pipeline.

## Scenarios

### 1. Happy Path (✅ Success)
Both contracts are compatible, all deployments succeed.

**Demo**: `./scenarios/01-happy-path.sh`

### 2. Backward Compatible Change (✅ Success)
Provider adds an optional field that consumer doesn't need.

**Demo**: `./scenarios/02-backward-compatible.sh`

### 3. Breaking Consumer Change (❌ Blocked)
Consumer expects a field that provider doesn't have.

**Demo**: `./scenarios/03-breaking-consumer.sh`

### 4. Breaking Provider Change (❌ Blocked)
Provider removes an endpoint that consumer still uses.

**Demo**: `./scenarios/04-breaking-provider.sh`

### 5. Schema Type Mismatch (❌ Blocked)
Provider changes a field type (string → number).

**Demo**: `./scenarios/05-schema-mismatch.sh`

### 6. CI/CD Gate in Action (⛔ Blocked)
Show the pipeline blocking a deployment due to incompatibility.

**Demo**: `./scenarios/06-cicd-gate.sh`

## Running Scenarios

### Prerequisites
```bash
# Ensure provider is running
cd provider && npm start

# Ensure Pact Broker is running
docker-compose ps
```

### Run All Scenarios
```bash
cd demos
./run-all-scenarios.sh
```

### Run Individual Scenario
```bash
cd demos/scenarios
./01-happy-path.sh
```

## What Each Scenario Demonstrates

| Scenario | Consumer | Provider | Can-I-Deploy | Result |
|----------|----------|----------|--------------|--------|
| 1. Happy Path | No change | No change | ✅ Pass | Deploy both |
| 2. Backward Compatible | No change | Add optional | ✅ Pass | Deploy provider |
| 3. Breaking Consumer | Add required field | No change | ❌ Fail | Block consumer |
| 4. Breaking Provider | No change | Remove endpoint | ❌ Fail | Block provider |
| 5. Schema Mismatch | No change | Change type | ❌ Fail | Block provider |
| 6. CI/CD Gate | Add requirement | No change | ⛔ Block | See in Actions |

## Expected Outputs

Each scenario will show:
1. 📝 Initial state
2. 🔄 Changes made
3. 🧪 Tests run
4. 📤 Contracts published
5. 🔍 Can-I-Deploy check
6. ✅/❌ Final result
7. 📊 Pact Broker state

## Cleanup

After running scenarios:
```bash
./cleanup-demos.sh
```

This resets all changes and restores the original working state.
