# GitHub Actions Setup Guide

## Quick Start

### 1. Configure GitHub Secrets

Navigate to your repository: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

#### For PactFlow SaaS (Recommended)
```
PACT_BROKER_BASE_URL = https://your-org.pactflow.io
PACT_BROKER_TOKEN = your-pactflow-api-token
```

#### For Self-Hosted Pact Broker
```
PACT_BROKER_BASE_URL = http://your-broker-url:9292
PACT_BROKER_USERNAME = pact
PACT_BROKER_PASSWORD = pact
```

### 2. Get PactFlow API Token

1. Sign up at [https://pactflow.io](https://pactflow.io) (free trial available)
2. Go to **Settings → API Tokens**
3. Click **Create API Token**
4. Copy the token and add to GitHub Secrets

### 3. Trigger Your First Workflow

```bash
# Make a change to consumer code
cd consumer/src
echo "// Test change" >> services/payment.service.js

# Commit and push
git add .
git commit -m "test: Trigger consumer pipeline"
git push origin main
```

Watch the workflow run in **GitHub Actions** tab!

---

## Workflow Files Explained

### Consumer Workflow (`.github/workflows/consumer.yml`)

**What it does**:
1. Runs consumer Pact tests
2. Publishes contracts to broker
3. Checks if safe to deploy (can-i-deploy)
4. Deploys to production (if on main branch)

**When it runs**:
- On push to `main` or `develop` branches
- On pull requests to `main`
- Only when consumer files change

### Provider Workflow (`.github/workflows/provider.yml`)

**What it does**:
1. Runs API functional tests
2. Verifies consumer contracts
3. Publishes verification results
4. Checks if safe to deploy
5. Deploys to production (if on main branch)

**When it runs**:
- On push to `main` or `develop` branches
- On pull requests to `main`
- Only when provider files change

---

## Testing the Pipeline

### Scenario 1: Happy Path (Both Pass)

**Consumer changes**:
```bash
cd consumer
# No breaking changes, just update a test
git commit -am "feat: Add new payment scenario"
git push
```

**Expected Result**:
- ✅ Tests pass
- ✅ Contract published
- ✅ Can-i-deploy: YES
- ✅ Deployed to production

### Scenario 2: Breaking Change (Deployment Blocked)

**Consumer expects new field**:
```javascript
// consumer/test/pact/payment.pact.test.js
.willRespondWith({
  status: 200,
  body: {
    transactionId: like('txn_123'),
    newField: like('new-value'),  // ← Provider doesn't have this!
    // ...
  }
})
```

**Expected Result**:
- ✅ Tests pass
- ✅ Contract published
- ❌ Can-i-deploy: NO
- ⛔ Deployment BLOCKED
- 💬 PR comment explaining why

### Scenario 3: Provider Adds Optional Field (Safe)

**Provider adds optional field**:
```javascript
// provider/src/controllers/authorization.controller.js
res.json({
  transactionId: tx.id,
  authorizationCode: tx.authCode,
  newOptionalField: 'value',  // ← Consumer doesn't need this
  // ...
})
```

**Expected Result**:
- ✅ Tests pass
- ✅ Verification passes
- ✅ Can-i-deploy: YES
- ✅ Deployed to production

---

## Viewing Results

### GitHub Actions UI

1. Go to repository **Actions** tab
2. Click on workflow run
3. Expand jobs to see detailed logs
4. Check artifacts for Pact files

### Pact Broker UI

1. Open your Pact Broker URL
2. View **Matrix** page for overview
3. Click on contracts to see details
4. Check verification results

---

## Common Issues

### Issue: "No verified pact found"

**Cause**: Provider hasn't run verification yet

**Fix**:
```bash
# Trigger provider workflow
cd provider
git commit -am "chore: Trigger verification" --allow-empty
git push
```

### Issue: "Authentication failed"

**Cause**: GitHub Secrets not set correctly

**Fix**:
1. Check secret names (exact match required)
2. Verify token is valid
3. Test authentication locally:
```bash
export PACT_BROKER_TOKEN="your-token"
npm run publish:consumer
```

### Issue: "Can't reach Pact Broker"

**Cause**: Broker URL incorrect or broker down

**Fix**:
1. Verify broker URL in secrets
2. Test manually: `curl $PACT_BROKER_BASE_URL`
3. Check broker is running: `docker-compose ps`

---

## Customization

### Change Deployment Target

Edit workflow files:
```yaml
# .github/workflows/consumer.yml
- name: Check deployment safety
  run: |
    node scripts/can-i-deploy-consumer.js \
      --version ${{ github.sha }} \
      --to staging  # ← Change to your environment
```

### Add Slack Notifications

1. Add `SLACK_WEBHOOK_URL` to GitHub Secrets

2. Add step to workflow:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Only Run on Specific Paths

```yaml
on:
  push:
    paths:
      - 'consumer/**'
      - '!consumer/README.md'  # Exclude README changes
```

---

## Best Practices

### 1. Use Branch Protection

Settings → Branches → Add rule:
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- Select: "Can I Deploy Consumer" and "Can I Deploy Provider"

### 2. Enable Auto-merge for Dependabot

```yaml
# .github/workflows/dependabot-auto-merge.yml
if: github.actor == 'dependabot[bot]' && 
    contains(steps.can-i-deploy.outputs.result, 'success')
```

### 3. Use Environments for Approvals

```yaml
environment: production
# Requires manual approval before deploy
```

### 4. Monitor Pipeline Health

- Set up alerts for failed workflows
- Track deployment frequency
- Monitor can-i-deploy success rate

---

## Manual Workflow Triggers

### Test Provider Verification
```bash
gh workflow run provider.yml
```

### Test Consumer Contract Publishing
```bash
gh workflow run consumer.yml
```

### Manage Pact Broker
```bash
gh workflow run pact-broker.yml -f action=status
```

---

## Next Steps

1. ✅ Configure GitHub Secrets
2. ✅ Push a test change
3. ✅ Watch pipeline run
4. ✅ Check Pact Broker for results
5. ✅ Test a breaking change scenario
6. ✅ Configure branch protection
7. ✅ Set up notifications

---

**Need Help?**
- Check [CI/CD Pipeline Documentation](./CI_CD_PIPELINE.md)
- Review [Pact Broker Setup Guide](./PACT_BROKER_SETUP.md)
- Visit [Pact Documentation](https://docs.pact.io)
