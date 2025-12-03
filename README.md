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

### Prerequisites

- Node.js 18+ and npm
- PactFlow account (or local Pact Broker)
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Pact-Testing

# Install provider dependencies
cd provider
npm install

# Install consumer dependencies
cd ../consumer
npm install
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

## 🎬 Demo Scenarios

1. **Happy Path**: Compatible contracts, deployments succeed ✅
2. **Backward Compatible**: Provider adds optional field ✅
3. **Breaking Consumer**: Consumer expects missing field ❌
4. **Breaking Provider**: Provider removes endpoint ❌
5. **Schema Change**: Provider changes data type ❌
6. **CI/CD Gate**: Pipeline blocks incompatible deployment 🚫

## 📊 Progress

See [plan.md](./plan.md) for detailed implementation progress and task tracking.

## 📚 Resources

- [PactFlow Bi-Directional Testing](https://docs.pactflow.io/docs/bi-directional-contract-testing)
- [Pact JS Documentation](https://docs.pact.io/implementation_guides/javascript)
- [OpenAPI Specification](https://swagger.io/specification/)

## 🤝 Contributing

This is a demo project for learning bi-directional contract testing. Feel free to fork and experiment!

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ to demonstrate the power of bi-directional contract testing**
