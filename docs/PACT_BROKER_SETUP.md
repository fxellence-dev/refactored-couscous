# Pact Broker Setup Guide

This guide provides instructions for setting up both PactFlow (SaaS) and a local Pact Broker.

## Option 1: PactFlow (Recommended for Bi-Directional Testing)

PactFlow is the commercial SaaS version that includes bi-directional contract testing features.

### Steps:

1. **Sign up for PactFlow**
   - Go to https://pactflow.io/
   - Click "Try for Free" or "Sign Up"
   - Create an account (free tier available)

2. **Get Your API Token**
   - After logging in, go to Settings → API Tokens
   - Create a new token with Read/Write permissions
   - Copy the token

3. **Configure Environment Variables**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` and update:
   ```bash
   PACT_BROKER_BASE_URL=https://your-account.pactflow.io
   PACT_BROKER_TOKEN=your-actual-token-here
   ```

4. **Verify Connection**
   ```bash
   # Install Pact CLI globally
   npm install -g @pact-foundation/pact-node
   
   # Test connection
   npx pact-broker list-latest-pact-versions --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN
   ```

### PactFlow Features:
- ✅ Bi-directional contract testing
- ✅ Cross-contract validation
- ✅ Web UI for contract visualization
- ✅ Webhooks and integrations
- ✅ Can-I-Deploy safety checks
- ✅ Cloud-hosted (no infrastructure management)

---

## Option 2: Local Pact Broker (OSS)

Use this for learning or if you don't need bi-directional testing features.

### Prerequisites:
- Docker & Docker Compose installed
- Ports 9292 and 5432 available

### Steps:

1. **Start the Pact Broker**
   ```bash
   docker-compose up -d
   ```

2. **Verify Services are Running**
   ```bash
   docker-compose ps
   ```
   
   Expected output:
   ```
   pact-broker    running   0.0.0.0:9292->9292/tcp
   pact-broker-db running   0.0.0.0:5432->5432/tcp
   ```

3. **Access the Web UI**
   - Open browser to http://localhost:9292
   - Login with:
     - Username: `pact`
     - Password: `pact`

4. **Configure Environment Variables**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` and update:
   ```bash
   PACT_BROKER_BASE_URL=http://localhost:9292
   PACT_BROKER_USERNAME=pact
   PACT_BROKER_PASSWORD=pact
   ```

5. **Test Connection**
   ```bash
   curl -u pact:pact http://localhost:9292/
   ```

### Local Broker Limitations:
- ❌ No bi-directional contract testing
- ❌ Limited advanced features
- ✅ Full control over data
- ✅ Free and open-source
- ✅ Good for learning basic Pact

### Managing the Local Broker:

**Stop the broker:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f pact-broker
```

**Reset database (WARNING: deletes all contracts):**
```bash
docker-compose down -v
docker-compose up -d
```

---

## Recommendation

For this demo project:

🌟 **Use PactFlow** - The bi-directional contract testing feature is exclusive to PactFlow and is the main focus of this demo. The free tier is sufficient for learning and demo purposes.

If PactFlow is not an option, the local broker can still be used to demonstrate basic consumer-driven contract testing (non-bidirectional), but you'll miss out on the OpenAPI specification validation features.

---

## Verification Checklist

Once setup is complete, verify:

- [ ] Can access broker web UI
- [ ] Have valid authentication credentials
- [ ] Can publish a test contract
- [ ] Can query contracts via CLI
- [ ] Environment variables are configured

---

## Troubleshooting

### PactFlow Issues

**"Invalid token" error:**
- Verify token is copied correctly (no extra spaces)
- Check token has Read/Write permissions
- Ensure token hasn't expired

**Connection timeout:**
- Check internet connectivity
- Verify broker base URL is correct
- Try accessing the URL in a browser

### Local Broker Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :9292
# Stop the process or change the port in docker-compose.yml
```

**Database connection fails:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres
# Restart services
docker-compose restart
```

**Broker not starting:**
```bash
# Check logs
docker-compose logs pact-broker
# Rebuild containers
docker-compose down
docker-compose up --build
```

---

## Next Steps

After successful setup:
1. ✅ Mark Task 1.2 complete in plan.md
2. ➡️ Proceed to Task 2.1: Initialize Provider project
