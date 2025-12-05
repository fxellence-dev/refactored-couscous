#!/usr/bin/env node

/**
 * Record Deployment
 * Records that a version has been deployed to an environment
 */

require('dotenv').config();
const { execSync } = require('child_process');

// Configuration
const BROKER_BASE_URL = process.env.PACT_BROKER_BASE_URL || 'http://localhost:9292';
const BROKER_TOKEN = process.env.PACT_BROKER_TOKEN;
const BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact';

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node record-deployment.js <pacticipant> <version> <environment>');
  console.error('Example: node record-deployment.js payment-gateway-api 1.0.0 production');
  process.exit(1);
}

const [PACTICIPANT, VERSION, ENVIRONMENT] = args;

console.log('📝 Recording Deployment\n');
console.log(`Pacticipant: ${PACTICIPANT}`);
console.log(`Version: ${VERSION}`);
console.log(`Environment: ${ENVIRONMENT}`);
console.log(`Broker: ${BROKER_BASE_URL}\n`);

try {
  // Build authentication arguments
  let authArgs = '';
  if (BROKER_TOKEN) {
    authArgs = `--broker-token="${BROKER_TOKEN}"`;
  } else {
    authArgs = `--broker-username="${BROKER_USERNAME}" --broker-password="${BROKER_PASSWORD}"`;
  }

  const command = `npx pact-broker record-deployment \
    --pacticipant="${PACTICIPANT}" \
    --version="${VERSION}" \
    --environment="${ENVIRONMENT}" \
    --broker-base-url="${BROKER_BASE_URL}" \
    ${authArgs}`;

  console.log('🔄 Recording deployment...\n');

  execSync(command, { 
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('\n✅ Deployment recorded successfully!');
  console.log(`   ${PACTICIPANT} v${VERSION} is now deployed to ${ENVIRONMENT}\n`);
  
} catch (error) {
  console.error('\n❌ Failed to record deployment');
  console.error('   Check broker connection and credentials.\n');
  process.exit(1);
}
