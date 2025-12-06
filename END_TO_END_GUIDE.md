# Complete End-to-End Guide
## Bi-Directional Pact Testing - Payment Gateway Demo

**Last Updated**: 6 December 2025  
**Version**: 1.0  
**Estimated Time**: 60-90 minutes for full walkthrough

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Starting All Components](#starting-all-components)
4. [Testing Individual Components](#testing-individual-components)
5. [Running Demo Scenarios](#running-demo-scenarios)
6. [Verification & Validation](#verification--validation)
7. [Troubleshooting](#troubleshooting)
8. [Teardown](#teardown)
9. [Appendix](#appendix)

---

## Prerequisites

### System Requirements

#### Hardware
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Disk Space**: 2GB free space
- **CPU**: 2+ cores recommended

#### Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker**: v20.0.0 or higher
- **Docker Compose**: v2.0.0 or higher
- **Git**: v2.30.0 or higher
- **curl**: For testing endpoints

### Verify Prerequisites

Run these commands to verify your setup:

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: v9.0.0 or higher

# Check Docker version
docker --version
# Expected: Docker version 20.0.0 or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.0.0 or higher

# Check if Docker is running
docker ps
# Expected: Shows container list (may be empty)

# Check Git version
git --version
# Expected: git version 2.30.0 or higher
```

### Network Requirements

Ensure these ports are available:
- **3000**: Provider API
- **5434**: PostgreSQL (Pact Broker database)
- **9292**: Pact Broker web UI

Check port availability:
```bash
# Check if ports are free
lsof -i :3000
lsof -i :5434
lsof -i :9292

# If any ports are in use, stop those services first
```

---

## Initial Setup

### Step 1: Clone and Navigate to Project

```bash
# If not already cloned
git clone https://github.com/fxellence-dev/refactored-couscous.git
cd refactored-couscous

# Ensure you're on main branch
git checkout main
git pull origin main
```

### Step 2: Install Dependencies

Install dependencies for all components:

```bash
# Install root dependencies (for scripts)
npm install

# Install provider dependencies
cd provider
npm install
cd ..

# Install consumer dependencies
cd consumer
npm install
cd ..
```

**Expected Output**: No errors, all dependencies installed successfully.

**Time**: ~5 minutes depending on internet speed.

### Step 3: Verify Environment Configuration

```bash
# Check if .env file exists
cat .env

# Expected content:
# PACT_BROKER_BASE_URL=http://localhost:9292
# PACT_BROKER_USERNAME=pact_workshop
# PACT_BROKER_PASSWORD=pact_workshop
```

If `.env` file is missing, create it:
```bash
cat > .env << 'EOF'
PACT_BROKER_BASE_URL=http://localhost:9292
PACT_BROKER_USERNAME=pact_workshop
PACT_BROKER_PASSWORD=pact_workshop
EOF
```

---

## Starting All Components

### Step 1: Start Pact Broker

The Pact Broker is the central repository for contracts.

```bash
# Start Pact Broker and PostgreSQL
docker compose up -d

# Verify it's running
docker compose ps

# Expected output:
# NAME                           STATUS              PORTS
# pact-testing-postgres-1        running             0.0.0.0:5434->5432/tcp
# pact-testing-pact-broker-1     running             0.0.0.0:9292->9292/tcp
```

**Wait for Broker to Initialize**: ~30 seconds

```bash
# Check broker health
curl -u pact_workshop:pact_workshop http://localhost:9292/

# Expected: HTML response (Pact Broker UI)
```

**Verify in Browser**:
```bash
open http://localhost:9292
# Or manually open: http://localhost:9292
# Login: pact_workshop / pact_workshop
```

**Troubleshooting**:
- If ports are already in use, see [Port Conflicts](#port-conflicts)
- If broker doesn't start, check logs: `docker compose logs pact-broker`

### Step 2: Start Provider (Payment Gateway API)

The provider is the backend API that processes payments.

#### Option A: Foreground (Recommended for testing)
```bash
cd provider
npm start

# Expected output:
# Payment Gateway API started on port 3000
# Environment: development
```

**Keep this terminal open**. The provider will log all requests.

#### Option B: Background
```bash
cd provider
npm start &
PROVIDER_PID=$!
echo "Provider PID: $PROVIDER_PID"
cd ..
```

**Save the PID** to stop it later: `kill $PROVIDER_PID`

### Step 3: Verify Provider is Running

Open a **new terminal** and test:

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-06T..."}

# Test authorization endpoint
curl -X POST http://localhost:3000/api/payments/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "cardNumber": "4111111111111111",
    "cardholderName": "John Doe",
    "expiryMonth": "12",
    "expiryYear": "2026",
    "cvv": "123"
  }'

# Expected response (200 OK):
# {
#   "transactionId": "txn_...",
#   "authorizationCode": "AUTH...",
#   "status": "authorized",
#   "amount": 100.00,
#   "currency": "USD",
#   "timestamp": "2025-12-06T..."
# }
```

### Step 4: Summary - All Components Running

Verify all three components are running:

```bash
# Check Pact Broker
curl -s http://localhost:9292/ > /dev/null && echo "✅ Pact Broker: Running" || echo "❌ Pact Broker: Not Running"

# Check Provider
curl -s http://localhost:3000/health > /dev/null && echo "✅ Provider: Running" || echo "❌ Provider: Not Running"

# Check Docker containers
docker compose ps --format "table {{.Service}}\t{{.Status}}"
```

**All green checkmarks?** ✅ You're ready to proceed!

---

## Testing Individual Components

### Test 1: Provider API Tests

These tests verify the provider API functionality without contracts.

```bash
cd provider

# Run unit tests
npm test

# Expected output:
# PASS  test/controllers/authorization.controller.test.js
# PASS  test/controllers/settlement.controller.test.js
# PASS  test/middleware/validation.test.js
# Test Suites: X passed, X total
# Tests:       X passed, X total
```

### Test 2: Provider Newman (Postman) Tests

Newman runs Postman collections to test API endpoints.

```bash
cd provider

# Run Newman tests
npm run test:api

# Expected output:
# newman
# Payment Gateway API
# 
# → Authorization Endpoints
#   POST /api/payments/authorize [200 OK, 823B, 45ms]
#   ✓  Status code is 200
#   ✓  Response has transactionId
#   ✓  Response has authorizationCode
#   ... (27 assertions total)
# 
# ┌─────────────────────────┬────────────┬────────────┐
# │                         │   executed │     failed │
# ├─────────────────────────┼────────────┼────────────┤
# │              iterations │          1 │          0 │
# ├─────────────────────────┼────────────┼────────────┤
# │                requests │          4 │          0 │
# ├─────────────────────────┼────────────┼────────────┤
# │            test-scripts │          4 │          0 │
# ├─────────────────────────┼────────────┼────────────┤
# │      prerequest-scripts │          0 │          0 │
# ├─────────────────────────┼────────────┼────────────┤
# │              assertions │         27 │          0 │
# └─────────────────────────┴────────────┴────────────┘
```

**All assertions should pass** ✅

### Test 3: Consumer Pact Tests

These tests generate consumer contracts.

```bash
cd consumer

# Run consumer Pact tests
npm test

# Expected output:
# PASS  test/payment.pact.test.js
#   Payment Service Contract Tests
#     Authorization
#       ✓ Should authorize payment successfully (XXXms)
#       ✓ Should handle authorization with minimum amount (XXXms)
#       ✓ Should handle missing card CVV (XXXms)
#       ✓ Should handle invalid authorization (XXXms)
#     Settlement
#       ✓ Should settle payment successfully (XXXms)
#     Status Inquiry
#       ✓ Should get payment status (XXXms)
#       ✓ Should handle payment not found (XXXms)
#     Refund
#       ✓ Should refund payment successfully (XXXms)
#       ✓ Should handle refund failure (XXXms)
# 
# Test Suites: 1 passed, 1 total
# Tests:       9 passed, 9 total
```

**Check Generated Contract**:
```bash
ls -lh consumer/pacts/

# Expected file:
# payment-client-payment-gateway-api.json
```

**View Contract**:
```bash
cat consumer/pacts/payment-client-payment-gateway-api.json | head -30

# Should show JSON with interactions
```

### Test 4: Publish Consumer Contract

Publish the consumer contract to the Pact Broker.

```bash
# From project root
node scripts/publish-consumer-contract.js --version "test-$(date +%s)"

# Expected output:
# Publishing consumer contracts to Pact Broker...
# Broker URL: http://localhost:9292
# Consumer: payment-client
# Version: test-1733461200
# 
# Found pact files:
#   - /path/to/consumer/pacts/payment-client-payment-gateway-api.json
# 
# Publishing contracts...
# ✅ Successfully published consumer contracts!
# 
# View in Pact Broker:
# http://localhost:9292/pacts/provider/payment-gateway-api/consumer/payment-client/latest
```

**Verify in Broker**:
```bash
open http://localhost:9292
# Navigate to: payment-client → payment-gateway-api
# You should see the published contract
```

### Test 5: Provider Verification

Verify the provider against consumer contracts.

```bash
cd provider

# Ensure provider is running on port 3000
# If not: npm start (in another terminal)

# Run provider verification
npm run test:pact

# Expected output:
# RUNS  test/pact/payment-gateway.pact.test.js
# 
# Verifying provider contracts...
# 
# Pact Verification
#   Verifying a pact between payment-client and payment-gateway-api
#     a request to authorize a payment
#       ✓ returns a response which has status code 200 (XXXms)
#     a request with minimum amount
#       ✓ returns a response which has status code 200 (XXXms)
#     ... (more interactions)
# 
# Test Suites: 1 passed, 1 total
# Tests:       4 passed, 5 pending, 9 total
```

**Note**: Some tests may be **pending** (state handlers not implemented). This is expected.

### Test 6: Publish Verification Results

Publish verification results to broker.

```bash
cd provider

# Run verification with publishing
npm run test:pact:publish

# Expected output:
# ... (verification results)
# 
# Publishing verification results to Pact Broker...
# ✅ Verification results published successfully!
```

**Verify in Broker**:
```bash
open http://localhost:9292
# Check the Matrix view
# You should see verification results
```

### Test 7: Can-I-Deploy Checks

Check if services can be safely deployed.

```bash
# Check consumer
node scripts/can-i-deploy-consumer.js --version "test-$(date +%s)"

# Expected output (if compatible):
# Computer says yes \o/
# 
# CONSUMER       | C.VERSION | PROVIDER            | P.VERSION | SUCCESS?
# ---------------|-----------|---------------------|-----------|----------
# payment-client | test-...  | payment-gateway-api | ...       | true
# 
# All required verification results are published and successful

# Or (if incompatible):
# Computer says no ¯\_(ツ)_/¯
# (with details of failures)

# Check provider
node scripts/can-i-deploy-provider.js --version "test-$(date +%s)"

# Similar output for provider deployment check
```

---

## Running Demo Scenarios

Now that all components are verified, run the demo scenarios to see contract testing in action.

### Prerequisites for Demos

Ensure all components are running:
```bash
# Quick check
curl -s http://localhost:3000/health && echo "✅ Provider OK"
curl -s http://localhost:9292/ > /dev/null && echo "✅ Broker OK"
```

### Demo Scenario 1: Happy Path ✅

**Objective**: Show compatible contracts allowing deployment.

```bash
cd demos/scenarios
./01-happy-path.sh
```

**What Happens**:
1. Consumer tests run and pass
2. Consumer contract published
3. Provider verification runs and passes
4. Can-I-Deploy checks succeed for both
5. **Result**: ✅ Both services can deploy

**Expected Duration**: ~2 minutes

**Watch For**:
- All tests passing ✅
- Contracts published successfully
- Can-I-Deploy returning "yes"

**Verify**:
```bash
# Check Pact Broker
open http://localhost:9292
# You should see successful verification
```

### Demo Scenario 2: Backward Compatible Change ✅

**Objective**: Show that adding optional fields doesn't break consumers.

```bash
cd demos/scenarios
./02-backward-compatible.sh
```

**What Happens**:
1. Provider adds optional `processingTime` field (simulated)
2. Provider tests pass
3. Provider verification passes
4. Consumer tests still pass (ignores new field)
5. **Result**: ✅ Provider can deploy safely

**Expected Duration**: ~2 minutes

**Key Learning**: Adding optional fields is safe - consumers ignore fields they don't expect.

### Demo Scenario 3: Breaking Consumer Change ❌

**Objective**: Show consumer expecting field provider doesn't have.

```bash
cd demos/scenarios
./03-breaking-consumer.sh
```

**What Happens**:
1. Consumer adds expectation for `merchantName` field (simulated)
2. Consumer tests pass (using mock)
3. Consumer contract published
4. Provider verification **FAILS** (doesn't have merchantName)
5. Can-I-Deploy **BLOCKS** consumer deployment
6. **Result**: ⛔ Consumer deployment blocked

**Expected Duration**: ~2 minutes

**Key Learning**: Contract testing prevents consumers from expecting fields that don't exist.

**What to Fix**:
- Option 1: Provider adds `merchantName` field
- Option 2: Consumer removes requirement
- Option 3: Consumer uses optional matcher

### Demo Scenario 4: Breaking Provider Change ❌

**Objective**: Show provider removing endpoint consumer uses.

```bash
cd demos/scenarios
./04-breaking-provider.sh
```

**What Happens**:
1. Provider removes `/refund` endpoint (simulated)
2. Provider tests pass (reduced functionality)
3. Provider verification **FAILS** (consumer expects /refund)
4. Can-I-Deploy **BLOCKS** provider deployment
5. **Result**: ⛔ Provider deployment blocked

**Expected Duration**: ~2 minutes

**Key Learning**: Can't remove endpoints without updating consumers first.

**What to Fix**:
- Option 1: Restore endpoint
- Option 2: Deprecate gradually:
  - Mark as deprecated
  - Update all consumers
  - Verify no usage
  - Then remove

### Demo Scenario 5: Schema Type Mismatch ❌

**Objective**: Show provider changing field type breaks contract.

```bash
cd demos/scenarios
./05-schema-mismatch.sh
```

**What Happens**:
1. Provider changes `amount` from string to number (simulated)
2. Provider tests pass
3. Verification **FAILS** on type mismatch
4. Can-I-Deploy **BLOCKS** deployment
5. **Result**: ⛔ Provider deployment blocked

**Expected Duration**: ~2 minutes

**Key Learning**: Schema changes (especially types) are breaking changes.

**What to Fix**:
- Option 1: Revert to original type
- Option 2: Add new field with different type, deprecate old field

### Demo Scenario 6: CI/CD Gate in Action ⛔

**Objective**: Show how GitHub Actions pipeline blocks deployment.

```bash
cd demos/scenarios
./06-cicd-gate.sh
```

**What Happens**:
1. Simulates GitHub Actions workflow
2. Shows pipeline steps with gates
3. Demonstrates automated blocking
4. Shows PR notification workflow
5. **Result**: ⛔ Pipeline blocks incompatible deployment

**Expected Duration**: ~1 minute

**Key Learning**: Automated gates prevent manual errors and production incidents.

### Run All Scenarios

To run all scenarios sequentially:

```bash
cd demos
./run-all-scenarios.sh
```

**Expected Duration**: ~15 minutes (interactive - press Enter between scenarios)

**What Happens**:
- Checks prerequisites
- Runs all 6 scenarios in order
- Provides summary at end
- Shows overall learnings

**Output Summary**:
```
╔════════════════════════════════════════════════════════════╗
║  All Scenarios Complete! ✅                                ║
╚════════════════════════════════════════════════════════════╝

📊 Summary of Demonstrations:
   ✅ Scenario 1: Happy path (compatible contracts)
   ✅ Scenario 2: Backward compatible change
   ❌ Scenario 3: Breaking consumer change (blocked)
   ❌ Scenario 4: Breaking provider change (blocked)
   ❌ Scenario 5: Schema type mismatch (blocked)
   ⛔ Scenario 6: CI/CD gate in action
```

---

## Verification & Validation

### Verify Pact Broker State

After running demos, check the Pact Broker:

```bash
# Open Pact Broker UI
open http://localhost:9292
```

#### What to Check:

1. **Overview Page**
   - Should show `payment-client` and `payment-gateway-api`
   - Should show multiple versions

2. **Matrix View**
   - Click "Matrix" in navigation
   - Shows compatibility between consumer/provider versions
   - ✅ Green = Compatible
   - ❌ Red = Incompatible

3. **Pacts List**
   - Click on `payment-client → payment-gateway-api`
   - Should see published contracts
   - Can view interactions

4. **Verification Results**
   - Each pact should show verification status
   - Click to see detailed results
   - Shows which interactions passed/failed

### Verify Local Files

Check generated files:

```bash
# Consumer contracts
ls -lh consumer/pacts/
cat consumer/pacts/payment-client-payment-gateway-api.json | jq '.interactions | length'
# Expected: 9 interactions

# Provider OpenAPI spec
ls -lh provider/openapi/
wc -l provider/openapi/payment-gateway-api.yaml
# Expected: ~569 lines

# Scripts
ls -lh scripts/
# Should see 5 scripts:
# - can-i-deploy-consumer.js
# - can-i-deploy-provider.js
# - publish-consumer-contract.js
# - publish-provider-contract.js
# - record-deployment.js
```

### Verify Logs

Check logs for any errors:

```bash
# Pact Broker logs
docker compose logs pact-broker | tail -50

# Provider logs (if running in background)
# Check the terminal where provider is running

# No errors? ✅ Good!
```

### Health Check Summary

Run comprehensive health check:

```bash
echo "=== System Health Check ==="
echo ""

# Provider
echo -n "Provider API: "
curl -s http://localhost:3000/health > /dev/null && echo "✅ Running" || echo "❌ Down"

# Pact Broker
echo -n "Pact Broker: "
curl -s http://localhost:9292/ > /dev/null && echo "✅ Running" || echo "❌ Down"

# Docker Containers
echo ""
echo "Docker Containers:"
docker compose ps --format "  {{.Service}}: {{.Status}}"

# Port Status
echo ""
echo "Port Status:"
lsof -i :3000 > /dev/null && echo "  Port 3000: ✅ In Use (Provider)" || echo "  Port 3000: ⚠️  Free"
lsof -i :9292 > /dev/null && echo "  Port 9292: ✅ In Use (Broker)" || echo "  Port 9292: ⚠️  Free"
lsof -i :5434 > /dev/null && echo "  Port 5434: ✅ In Use (PostgreSQL)" || echo "  Port 5434: ⚠️  Free"

echo ""
echo "=== Health Check Complete ==="
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use

**Symptom**: Error like `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port (update .env and docker-compose.yml)
```

#### Issue 2: Provider Not Responding

**Symptom**: `curl: (7) Failed to connect to localhost port 3000`

**Solution**:
```bash
# Check if provider is running
ps aux | grep node

# Restart provider
cd provider
npm start
```

#### Issue 3: Pact Broker Not Accessible

**Symptom**: Can't access http://localhost:9292

**Solution**:
```bash
# Check Docker containers
docker compose ps

# If not running, start them
docker compose up -d

# Check logs
docker compose logs pact-broker

# Wait 30 seconds for initialization
sleep 30
curl http://localhost:9292/
```

#### Issue 4: Docker Compose Fails to Start

**Symptom**: PostgreSQL port conflict or container won't start

**Solution**:
```bash
# Check for existing containers
docker ps -a | grep pact

# Remove old containers
docker compose down -v

# Restart
docker compose up -d

# If port 5434 is in use, check docker-compose.yml
```

#### Issue 5: Consumer Tests Fail

**Symptom**: Consumer Pact tests failing

**Solution**:
```bash
cd consumer

# Clear cache
rm -rf node_modules pacts
npm install

# Run tests again
npm test

# Check for syntax errors in test file
cat test/payment.pact.test.js
```

#### Issue 6: Provider Verification Fails

**Symptom**: Provider can't verify consumer contracts

**Solution**:
```bash
# Ensure provider is running
curl http://localhost:3000/health

# Ensure contracts are published
open http://localhost:9292

# Run verification with debug
cd provider
DEBUG=pact* npm run test:pact
```

#### Issue 7: Can-I-Deploy Always Fails

**Symptom**: Can-I-Deploy check fails even with passing tests

**Solution**:
```bash
# Ensure verification results are published
cd provider
npm run test:pact:publish

# Check broker for results
open http://localhost:9292

# Verify version tags match
node scripts/can-i-deploy-consumer.js --version "your-version-here"
```

#### Issue 8: Demo Scripts Won't Run

**Symptom**: Permission denied when running demo scripts

**Solution**:
```bash
# Make scripts executable
cd demos
chmod +x run-all-scenarios.sh cleanup-demos.sh scenarios/*.sh

# Run again
./run-all-scenarios.sh
```

### Debug Mode

Enable debug logging for detailed output:

```bash
# Consumer tests with debug
cd consumer
DEBUG=pact* npm test

# Provider verification with debug
cd provider
DEBUG=pact* npm run test:pact

# Scripts with verbose output
node scripts/publish-consumer-contract.js --verbose
```

### Reset Everything

If things are really broken, reset completely:

```bash
# Stop all services
cd /path/to/project

# Stop provider (if running in background)
pkill -f "node.*provider"

# Stop Docker
docker compose down -v

# Clean node modules
rm -rf node_modules provider/node_modules consumer/node_modules

# Clean generated files
rm -rf consumer/pacts
rm -rf provider/test/pact/logs

# Reinstall
npm install
cd provider && npm install && cd ..
cd consumer && npm install && cd ..

# Start fresh
docker compose up -d
cd provider && npm start
```

---

## Teardown

### Complete Shutdown Procedure

Follow these steps to cleanly shut down all components.

#### Step 1: Stop Provider

If provider is running in **foreground**:
```bash
# In the terminal where provider is running
# Press Ctrl+C

# Expected output:
# ^C
# Gracefully shutting down...
```

If provider is running in **background**:
```bash
# Find the process
ps aux | grep "node.*provider"

# Kill it
pkill -f "node.*provider"

# Or if you saved the PID
kill $PROVIDER_PID
```

Verify provider is stopped:
```bash
curl http://localhost:3000/health
# Expected: Connection refused
```

#### Step 2: Stop Pact Broker

```bash
# Stop Docker Compose services
docker compose down

# Expected output:
# [+] Running 3/3
#  ✔ Container pact-testing-pact-broker-1  Removed
#  ✔ Container pact-testing-postgres-1     Removed
#  ✔ Network pact-testing_default          Removed
```

Verify broker is stopped:
```bash
curl http://localhost:9292/
# Expected: Connection refused

docker compose ps
# Expected: Empty list
```

#### Step 3: Clean Up Demo Artifacts

```bash
cd demos
./cleanup-demos.sh

# Expected output:
# 🧹 Cleaning up demo artifacts...
# 
# Removing demo branches...
#   ✅ Removed demo/backward-compatible
#   ✅ Removed demo/breaking-consumer
#   ... (etc)
# 
# Switching to main branch...
#   ✅ On main branch
# 
# Resetting any uncommitted changes...
#   ✅ Working directory clean
# 
# Stopping any running providers...
#   ✅ Provider stopped
# 
# ╔════════════════════════════════════════════════════════════╗
# ║  Cleanup Complete! ✅                                      ║
# ╚════════════════════════════════════════════════════════════╝
```

#### Step 4: Verify Clean State

Check that everything is stopped:

```bash
# Check ports are free
lsof -i :3000
lsof -i :9292
lsof -i :5434
# Expected: No output (ports are free)

# Check Docker containers
docker ps
# Expected: Empty or no pact-testing containers

# Check node processes
ps aux | grep node | grep -v grep
# Expected: No provider processes
```

#### Step 5: Optional - Remove Docker Volumes

To completely remove all broker data:

```bash
# Remove volumes (deletes all contracts and verification results)
docker compose down -v

# Expected output:
# [+] Running 4/4
#  ✔ Container pact-testing-pact-broker-1  Removed
#  ✔ Container pact-testing-postgres-1     Removed
#  ✔ Volume pact-testing_postgres-data     Removed
#  ✔ Network pact-testing_default          Removed
```

**⚠️ Warning**: This deletes all published contracts and verification results!

#### Step 6: Optional - Clean Node Modules

To reclaim disk space:

```bash
# Remove all node_modules
rm -rf node_modules
rm -rf provider/node_modules
rm -rf consumer/node_modules

# Remove generated files
rm -rf consumer/pacts
rm -rf provider/test/pact/logs

# Expected: ~500MB+ freed
```

### Partial Teardown

If you only need to restart specific components:

#### Restart Provider Only
```bash
# Stop
pkill -f "node.*provider"

# Start
cd provider && npm start
```

#### Restart Broker Only
```bash
# Stop
docker compose stop

# Start
docker compose start

# Or restart
docker compose restart
```

#### Reset Broker Data Only
```bash
# Stop broker
docker compose down

# Remove volumes
docker volume rm pact-testing_postgres-data

# Start fresh
docker compose up -d
```

### Teardown Checklist

Use this checklist to ensure complete teardown:

```
Teardown Checklist:
[ ] Provider stopped (port 3000 free)
[ ] Pact Broker stopped (port 9292 free)
[ ] PostgreSQL stopped (port 5434 free)
[ ] Docker containers removed
[ ] Demo branches cleaned
[ ] Working directory clean
[ ] No background node processes
[ ] (Optional) Docker volumes removed
[ ] (Optional) node_modules removed
```

---

## Appendix

### A. Quick Reference Commands

#### Start Everything
```bash
docker compose up -d
cd provider && npm start
```

#### Stop Everything
```bash
pkill -f "node.*provider"
docker compose down
```

#### Run All Tests
```bash
cd consumer && npm test
cd ../provider && npm test && npm run test:api
```

#### Publish Contracts
```bash
node scripts/publish-consumer-contract.js --version "v1.0.0"
```

#### Verify Contracts
```bash
cd provider && npm run test:pact:publish
```

#### Check Deployment
```bash
node scripts/can-i-deploy-consumer.js --version "v1.0.0"
node scripts/can-i-deploy-provider.js --version "v1.0.0"
```

#### Run Demos
```bash
cd demos && ./run-all-scenarios.sh
```

### B. File Locations

```
Project Structure:
├── provider/                      # Provider (Payment Gateway API)
│   ├── src/                      # Source code
│   ├── test/                     # Tests
│   │   ├── api/                  # Newman tests
│   │   └── pact/                 # Verification tests
│   └── openapi/                  # OpenAPI spec (provider contract)
├── consumer/                      # Consumer (Payment Client)
│   ├── src/                      # Source code
│   ├── test/                     # Pact tests
│   └── pacts/                    # Generated contracts
├── scripts/                       # Automation scripts
├── demos/                         # Demo scenarios
│   └── scenarios/                # Individual scenario scripts
├── docs/                          # Documentation
├── .github/workflows/            # CI/CD pipelines
├── docker-compose.yml            # Pact Broker setup
└── .env                          # Environment config
```

### C. Environment Variables

```bash
# .env file contents
PACT_BROKER_BASE_URL=http://localhost:9292
PACT_BROKER_USERNAME=pact_workshop
PACT_BROKER_PASSWORD=pact_workshop

# For PactFlow SaaS (optional)
# PACT_BROKER_BASE_URL=https://yourorg.pactflow.io
# PACT_BROKER_TOKEN=your-token-here
```

### D. Useful URLs

- **Pact Broker UI**: http://localhost:9292
- **Provider Health**: http://localhost:3000/health
- **Provider API Docs**: See `provider/openapi/payment-gateway-api.yaml`
- **Pact Documentation**: https://docs.pact.io
- **PactFlow**: https://pactflow.io

### E. Docker Compose Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose stop

# Restart services
docker compose restart

# View logs
docker compose logs -f

# View status
docker compose ps

# Remove everything
docker compose down -v

# Rebuild
docker compose build --no-cache
docker compose up -d
```

### F. Git Branches

```bash
# View all branches
git branch -a

# Demo branches (created/cleaned by scripts)
# - demo/backward-compatible
# - demo/breaking-consumer
# - demo/breaking-provider
# - demo/schema-mismatch

# Main development branch
git checkout main
```

### G. Testing Checklist

Complete testing checklist:

```
[ ] Prerequisites verified
[ ] Dependencies installed
[ ] Pact Broker started and accessible
[ ] Provider started and responding
[ ] Consumer tests pass
[ ] Provider API tests pass
[ ] Consumer contracts published
[ ] Provider verification passes
[ ] Verification results published
[ ] Can-I-Deploy checks work
[ ] Demo Scenario 1 passes
[ ] Demo Scenario 2 passes
[ ] Demo Scenario 3 blocks correctly
[ ] Demo Scenario 4 blocks correctly
[ ] Demo Scenario 5 blocks correctly
[ ] Demo Scenario 6 displays correctly
[ ] Pact Broker shows contracts
[ ] Matrix view shows results
```

### H. Time Estimates

| Task | Duration |
|------|----------|
| Prerequisites verification | 5 minutes |
| Initial setup | 10 minutes |
| Starting all components | 5 minutes |
| Testing individual components | 15 minutes |
| Running demo scenarios (all) | 15 minutes |
| Verification & validation | 10 minutes |
| Teardown | 5 minutes |
| **Total** | **60-90 minutes** |

### I. Support & Resources

- **Project README**: [README.md](../README.md)
- **Demo Guide**: [demos/DEMO_GUIDE.md](../demos/DEMO_GUIDE.md)
- **CI/CD Pipeline**: [docs/CI_CD_PIPELINE.md](../docs/CI_CD_PIPELINE.md)
- **Phase Summaries**: [docs/](../docs/)
- **Pact Documentation**: https://docs.pact.io
- **GitHub Issues**: Report issues on project repository

### J. Success Criteria

You've successfully completed the walkthrough if:

✅ All components start without errors  
✅ Provider API responds to health checks  
✅ Consumer tests generate contracts  
✅ Contracts are published to broker  
✅ Provider verification passes  
✅ Can-I-Deploy checks work correctly  
✅ At least 3 demo scenarios run successfully  
✅ Pact Broker UI shows contracts and verification results  
✅ Clean teardown completes without errors  

---

## Summary

This guide covered:

1. ✅ **Prerequisites** - System requirements and verification
2. ✅ **Initial Setup** - Clone, install, configure
3. ✅ **Starting Components** - Broker, provider, verification
4. ✅ **Testing** - Individual component tests
5. ✅ **Demo Scenarios** - 6 comprehensive examples
6. ✅ **Verification** - Checking results and state
7. ✅ **Troubleshooting** - Common issues and solutions
8. ✅ **Teardown** - Clean shutdown procedure

**Estimated Time**: 60-90 minutes for complete walkthrough

**Result**: Full understanding of bi-directional Pact testing with working examples!

---

**Document Version**: 1.0  
**Last Updated**: 6 December 2025  
**Maintained By**: Project Team  
**Feedback**: Please report issues or suggestions via GitHub Issues

---

🎉 **You're now ready to run and test the complete bi-directional Pact testing system!**
