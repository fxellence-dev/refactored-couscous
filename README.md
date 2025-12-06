# Payment Gateway - Bi-Directional Pact Testing Demo

> A comprehensive end-to-end example of bi-directional contract testing using PactFlow, demonstrating real-world payment gateway scenarios.

## 🎯 Project Overview

This project showcases **bi-directional contract testing** with PactFlow, featuring:

- **Provider**: Payment Gateway API (Authorization, Settlement, Refunds)
- **Consumer**: Payment Client Application
- **Contracts**: OpenAPI 3.0 (Provider) + Pact Format (Consumer)
- **Broker**: PactFlow for contract validation
- **CI/CD**: Automated pipelines with deployment gates

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Payment Client │         │  Payment Gateway│
│   (Consumer)    │◄───────►│    (Provider)   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  Pact Contract           │  OAS Contract
         │                           │
         └──────────►┌──────┐◄──────┘
                     │      │
                     │ Pact │
                     │ Flow │
                     │      │
                     └──────┘
                Bi-directional
                  Validation
```

## 🚀 Quick Start

📖 **[Complete End-to-End Guide](./END_TO_END_GUIDE.md)** - Comprehensive walkthrough (60-90 minutes)

### Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Pact-Testing

# Install dependencies
npm install
cd provider && npm install && cd ..
cd consumer && npm install && cd ..

# Start Pact Broker
docker compose up -d
```

### Running Locally

**Start Provider:**
```bash
cd provider
npm start
# API runs on http://localhost:3000
```

**Run Consumer Tests:**
```bash
cd consumer
npm test
# Generates Pact contracts in consumer/pacts/
```

## 📦 Project Structure

```
Pact-Testing/
├── provider/              # Payment Gateway API
│   ├── src/
│   │   ├── controllers/   # API endpoints logic
│   │   ├── models/        # Data models
│   │   ├── routes/        # Express routes
│   │   └── middleware/    # Validation middleware
│   ├── test/              # API functional tests
│   ├── openapi/           # OpenAPI specification (Provider Contract)
│   └── package.json
│
├── consumer/              # Payment Client
│   ├── src/
│   │   └── services/      # API client wrapper
│   ├── test/
│   │   └── pact/          # Pact consumer tests
│   ├── pacts/             # Generated Pact files (Consumer Contracts)
│   └── package.json
│
├── scripts/               # Automation scripts
│   ├── publish-provider-contract.sh
│   ├── publish-consumer-contract.sh
│   ├── can-i-deploy-provider.sh
│   └── can-i-deploy-consumer.sh
│
├── .github/workflows/     # CI/CD pipelines
│   ├── provider-ci.yml
│   └── consumer-ci.yml
│
├── docs/                  # Documentation
└── plan.md                # Implementation plan
```

## 🔄 Bi-Directional Contract Testing Workflow

### Provider Workflow
1. ✅ Design OpenAPI specification
2. ✅ Implement Payment Gateway API
3. ✅ Test API with Postman/Newman (validates OAS)
4. ✅ Publish OAS to PactFlow
5. ✅ Run `can-i-deploy` check
6. ✅ Deploy if compatible
7. ✅ Record deployment

### Consumer Workflow
1. ✅ Write Pact consumer tests with mocks
2. ✅ Generate Pact files
3. ✅ Run consumer tests
4. ✅ Publish Pact files to PactFlow
5. ✅ Run `can-i-deploy` check
6. ✅ Deploy if compatible
7. ✅ Record deployment

### PactFlow Magic ✨
- Receives both contracts
- Performs **cross-contract validation**
- Checks field-level compatibility
- Returns validation results
- Gates incompatible deployments

## 🛠️ API Endpoints

### Payment Gateway API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/authorize` | Authorize a payment |
| POST | `/api/payments/settle` | Settle an authorized payment |
| GET | `/api/payments/:id` | Get payment status |
| POST | `/api/payments/refund` | Process a refund |

## 🧪 Testing

### Provider Tests (API Functional Tests)
```bash
cd provider
npm test
```

### Consumer Tests (Pact Tests)
```bash
cd consumer
npm test
```

### Contract Publishing
```bash
# Publish provider contract
./scripts/publish-provider-contract.sh

# Publish consumer contract
./scripts/publish-consumer-contract.sh
```

### Can I Deploy?
```bash
# Check provider
./scripts/can-i-deploy-provider.sh

# Check consumer
./scripts/can-i-deploy-consumer.sh
```

## 🔄 CI/CD Pipeline

This project includes complete GitHub Actions workflows with contract testing gates:

### Consumer Pipeline
```
Test → Publish Contract → Can-I-Deploy → Deploy → Record
```

### Provider Pipeline
```
Test → Verify Contracts → Can-I-Deploy → Deploy → Record
```

### Deployment Gates 🚦
- ✅ **GREEN**: Contracts compatible → Deploy allowed
- ⛔ **RED**: Contracts incompatible → Deploy blocked

**Setup**: See [GitHub Actions Setup Guide](./docs/GITHUB_ACTIONS_SETUP.md)

## 🎬 Demo Scenarios

This project includes 6 comprehensive demo scenarios showcasing contract testing in action:

### Running Demos
```bash
# Run all scenarios
cd demos
./run-all-scenarios.sh

# Run individual scenario
cd demos/scenarios
./01-happy-path.sh
```

### Available Scenarios
| # | Scenario | Outcome | Demonstrates |
|---|----------|---------|--------------|
| 1 | Happy Path | ✅ Deploy | Compatible contracts |
| 2 | Backward Compatible | ✅ Deploy | Safe evolution |
| 3 | Breaking Consumer | ⛔ Block | Contract violation |
| 4 | Breaking Provider | ⛔ Block | Endpoint removal |
| 5 | Schema Mismatch | ⛔ Block | Type changes |
| 6 | CI/CD Gate | ⛔ Block | Pipeline protection |

**Guide**: See [Demo Guide](./demos/DEMO_GUIDE.md) for detailed visual walkthrough

## 📊 Progress

- ✅ **Phase 1**: Setup & Infrastructure (100%)
- ✅ **Phase 2**: Provider Implementation (100%)
- ✅ **Phase 3**: Consumer Implementation (100%)
- 🚧 **Phase 4**: Bi-directional Testing (85%)
- ✅ **Phase 5**: CI/CD Integration (100%)
- ✅ **Phase 6**: Demo Scenarios (100%)
- ✅ **Phase 7**: Documentation (100%)

**Overall: 86% Complete** (43/50 tasks)

See [plan.md](./plan.md) for detailed task tracking.

## 📚 Documentation

### 🚀 Getting Started
- **[End-to-End Guide](./END_TO_END_GUIDE.md)** ⭐ - Complete walkthrough: setup → test → teardown (60-90 min)
- [Demo Quick Start](./demos/QUICKSTART.md) - Fast reference for running demos
- [Demo Visual Guide](./demos/DEMO_GUIDE.md) - Comprehensive demo walkthrough with diagrams

### 🛠️ Technical Guides
- [CI/CD Pipeline Guide](./docs/CI_CD_PIPELINE.md) - Complete pipeline documentation
- [GitHub Actions Setup](./docs/GITHUB_ACTIONS_SETUP.md) - CI/CD configuration
- [Phase 5 Summary](./docs/PHASE5_SUMMARY.md) - CI/CD completion report
- [Phase 6 Summary](./docs/PHASE6_SUMMARY.md) - Demo scenarios report
- [Project Summary](./PROJECT_SUMMARY.md) - Overall project completion status

### External Resources
- [PactFlow Bi-Directional Testing](https://docs.pactflow.io/docs/bi-directional-contract-testing)
- [Pact JS Documentation](https://docs.pact.io/implementation_guides/javascript)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Contract Testing Best Practices](https://docs.pact.io/getting_started/best_practices)

## 🤝 Contributing

This is a demo project for learning bi-directional contract testing. Feel free to fork and experiment!

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ to demonstrate the power of bi-directional contract testing**
