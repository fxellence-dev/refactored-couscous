# CI/CD Pipeline Documentation

## Overview

This project implements a complete CI/CD pipeline with contract testing gates to ensure safe deployments. The pipeline prevents breaking changes from reaching production by validating contracts at every stage.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONSUMER PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘
    │
    ├─► 1. Test
    │      ├─ Run consumer Pact tests
    │      ├─ Generate contract files
    │      └─ Upload artifacts
    │
    ├─► 2. Publish Contract
    │      ├─ Download Pact files
    │      ├─ Publish to Pact Broker
    │      └─ Tag with version & branch
    │
    ├─► 3. Can-I-Deploy
    │      ├─ Check with Pact Broker
    │      ├─ Verify provider compatibility
    │      └─ GATE: Block if incompatible ⛔
    │
    └─► 4. Deploy
           ├─ Build application
           ├─ Deploy to production
           └─ Record deployment in broker


┌─────────────────────────────────────────────────────────────────┐
│                         PROVIDER PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘
    │
    ├─► 1. Test
    │      ├─ Run API functional tests
    │      ├─ Start provider server
    │      ├─ Run provider verification
    │      ├─ Publish verification results
    │      └─ Stop provider server
    │
    ├─► 2. Can-I-Deploy
    │      ├─ Check with Pact Broker
    │      ├─ Verify consumer compatibility
    │      └─ GATE: Block if incompatible ⛔
    │
    └─► 3. Deploy
           ├─ Deploy to production
           └─ Record deployment in broker
```

---

## Workflows

### 1. Consumer Pipeline (`.github/workflows/consumer.yml`)

**Triggers**:
- Push to `main` or `develop` branches (consumer code changes)
- Pull requests to `main` branch

**Jobs**:

#### Job 1: Test
- Checkout code
- Setup Node.js 18
- Install dependencies
- Run consumer Pact tests
- Upload generated Pact files as artifacts

#### Job 2: Publish
- Download Pact artifacts
- Publish contracts to Pact Broker
- Tag with git commit SHA and branch
- Comment on PR with contract link

#### Job 3: Can-I-Deploy (main branch only)
- Check deployment safety against production
- Query Pact Broker for verification status
- **GATE**: Fail if provider hasn't verified contracts
- Comment on PR if check fails

#### Job 4: Deploy (main branch only)
- Build consumer application
- Deploy to production environment
- Record deployment in Pact Broker
- Send notifications

**Environment Variables Required**:
```yaml
PACT_BROKER_BASE_URL: Pact Broker URL
PACT_BROKER_TOKEN: Authentication token (for PactFlow)
PACT_BROKER_USERNAME: Basic auth username
PACT_BROKER_PASSWORD: Basic auth password
```

---

### 2. Provider Pipeline (`.github/workflows/provider.yml`)

**Triggers**:
- Push to `main` or `develop` branches (provider code changes)
- Pull requests to `main` branch

**Jobs**:

#### Job 1: Test
- Checkout code
- Setup Node.js 18
- Install dependencies
- Run API functional tests (Newman)
- Start provider server
- Run provider verification against broker contracts
- Publish verification results to broker
- Stop provider server

#### Job 2: Can-I-Deploy (main branch only)
- Check deployment safety against production
- Query Pact Broker for contract status
- **GATE**: Fail if consumer contracts are incompatible
- Comment on PR if check fails

#### Job 3: Deploy (main branch only)
- Deploy provider to production
- Record deployment in Pact Broker
- Send notifications

**Environment Variables Required**:
```yaml
PACT_BROKER_BASE_URL: Pact Broker URL
PACT_BROKER_TOKEN: Authentication token (for PactFlow)
PACT_BROKER_USERNAME: Basic auth username
PACT_BROKER_PASSWORD: Basic auth password
```

---

### 3. Pact Broker Management (`.github/workflows/pact-broker.yml`)

**Triggers**:
- Manual workflow dispatch

**Actions**:
- **Start**: Launch Pact Broker with Docker Compose
- **Stop**: Stop all Pact Broker services
- **Restart**: Restart Pact Broker services
- **Status**: Check health of Pact Broker

---

## Deployment Gates

### What are Deployment Gates?

Deployment gates are automated checks that prevent unsafe deployments. In contract testing, the "Can-I-Deploy" check ensures that:

1. **For Consumer**: Provider has successfully verified the consumer's contracts
2. **For Provider**: All consumer contracts are compatible with the provider changes

### How Gates Work

```
Developer → Push Code → Run Tests → Publish Contract
                                          ↓
                                   Can-I-Deploy? ←─── Check Broker
                                          ↓
                          ┌───────────────┴───────────────┐
                          │                               │
                         YES                             NO
                          │                               │
                          ↓                               ↓
                    Deploy to Prod              Block Deployment ⛔
                          ↓                               ↓
                  Record Deployment            Notify Developer
```

### Example Scenarios

#### ✅ Scenario 1: Safe Deployment
```
Consumer adds new test → Publishes contract → Provider verifies → Can-I-Deploy: YES → Deploy Both
```

#### ⛔ Scenario 2: Blocked Deployment
```
Provider removes endpoint → Consumer still uses it → Can-I-Deploy: NO → Block Deployment
```

#### ✅ Scenario 3: Backward Compatible
```
Provider adds optional field → Consumer unaffected → Can-I-Deploy: YES → Deploy Provider First
```

---

## GitHub Secrets Configuration

### Required Secrets

Set these in your GitHub repository settings under **Settings → Secrets and variables → Actions**:

1. **PACT_BROKER_BASE_URL**
   - Description: URL of your Pact Broker instance
   - Example: `https://your-org.pactflow.io` or `http://your-broker.com:9292`

2. **PACT_BROKER_TOKEN** (for PactFlow SaaS)
   - Description: API token from PactFlow
   - How to get: PactFlow Dashboard → Settings → API Tokens

3. **PACT_BROKER_USERNAME** (for self-hosted)
   - Description: Basic auth username
   - Default: `pact`

4. **PACT_BROKER_PASSWORD** (for self-hosted)
   - Description: Basic auth password
   - Default: `pact`

### Optional Secrets

5. **SLACK_WEBHOOK_URL**: For deployment notifications
6. **TEAMS_WEBHOOK_URL**: For Microsoft Teams notifications

---

## Running Locally

### Test Consumer Pipeline Locally
```bash
# 1. Run consumer tests
cd consumer && npm test

# 2. Publish contracts
node scripts/publish-consumer-contract.js --version $(git rev-parse HEAD)

# 3. Check deployment safety
node scripts/can-i-deploy-consumer.js --version $(git rev-parse HEAD) --to production
```

### Test Provider Pipeline Locally
```bash
# 1. Run API tests
cd provider && npm run test:api

# 2. Start provider
npm start &

# 3. Run verification (publishes results)
npm run test:pact:publish

# 4. Check deployment safety
cd .. && node scripts/can-i-deploy-provider.js --version $(git rev-parse HEAD) --to production

# 5. Stop provider
pkill -f "node.*provider"
```

---

## Workflow Best Practices

### 1. Branch Strategy

```
main (production)
  ├── develop (staging)
  │   ├── feature/new-endpoint
  │   └── fix/bug-123
  └── hotfix/critical-fix
```

**Recommendation**:
- Use `main` branch for production deployments
- Use `develop` for staging/testing
- Tag contracts with branch names for proper verification

### 2. Version Strategy

**Git Commit SHA** (Recommended):
```yaml
version: ${{ github.sha }}
```

**Semantic Versioning**:
```yaml
version: 1.2.3
```

**Combined**:
```yaml
version: 1.2.3+${{ github.sha }}
```

### 3. Environment Strategy

**Environments**:
- `local` - Developer machines
- `test` - CI/CD testing
- `staging` - Pre-production
- `production` - Live environment

**Can-I-Deploy Check**:
```bash
# Check against staging
can-i-deploy --to staging

# Check against production
can-i-deploy --to production
```

---

## Troubleshooting

### Issue: Can-I-Deploy Always Fails

**Cause**: Provider hasn't verified contracts yet

**Solution**:
1. Check if provider pipeline has run
2. View verification results in Pact Broker
3. Ensure `PUBLISH_VERIFICATION=true` is set

### Issue: Pipeline Can't Reach Pact Broker

**Cause**: Network/authentication issues

**Solution**:
1. Verify `PACT_BROKER_BASE_URL` is correct
2. Check authentication credentials
3. For self-hosted: Ensure broker is accessible from CI/CD

### Issue: Verification Tests Fail

**Cause**: Provider state handlers not implemented

**Solution**:
1. Implement state handlers in provider tests
2. See `provider/test/pact/payment-gateway.pact.test.js`
3. Use pending pacts feature during development

---

## Monitoring & Observability

### View Pipeline Results

**GitHub Actions**:
- Go to **Actions** tab in repository
- Click on workflow run to see details
- Each job shows logs and status

**Pact Broker**:
- View contract matrix: `http://your-broker/matrix`
- View verification results: `http://your-broker/hal-browser`
- Check can-i-deploy: Use HAL browser

### Metrics to Track

1. **Contract Coverage**: % of API endpoints covered by contracts
2. **Verification Success Rate**: % of successful verifications
3. **Deployment Gate Success**: % of deployments allowed
4. **Pipeline Duration**: Time from commit to production

---

## Advanced Features

### 1. Pending Pacts

New consumer contracts don't immediately fail provider builds:

```javascript
enablePending: true,
includeWipPactsSince: '2025-01-01'
```

### 2. WIP Pacts (Work In Progress)

Consumer changes in development branches:

```javascript
consumerVersionSelectors: [
  { branch: 'feature/*', matchingBranch: true }
]
```

### 3. Webhook Notifications

Configure Pact Broker to trigger provider verification when consumer publishes:

```json
{
  "events": ["contract_content_changed"],
  "request": {
    "method": "POST",
    "url": "https://api.github.com/repos/owner/repo/dispatches",
    "body": {
      "event_type": "pact_changed"
    }
  }
}
```

---

## Next Steps

1. ✅ Set up GitHub Secrets
2. ✅ Push code to trigger workflows
3. ✅ Monitor first pipeline run
4. ✅ Review Pact Broker results
5. ✅ Configure notifications
6. ✅ Document for team

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Pact CI/CD Guide](https://docs.pact.io/pact_nirvana)
- [PactFlow Dashboard](https://pactflow.io)
- [Contract Testing Best Practices](https://docs.pact.io/best_practices)

---

**Last Updated**: December 5, 2025  
**Version**: 1.0.0
