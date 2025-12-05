#!/usr/bin/env node

/**
 * Can I Deploy - Provider
 * Checks if the provider can be safely deployed based on contract compatibility
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let version, environment;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--version' && args[i + 1]) {
    version = args[i + 1];
    i++;
  } else if (args[i] === '--to' && args[i + 1]) {
    environment = args[i + 1];
    i++;
  }
}

// Configuration
const BROKER_BASE_URL = process.env.PACT_BROKER_BASE_URL || 'http://localhost:9292';
const BROKER_TOKEN = process.env.PACT_BROKER_TOKEN;
const BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact';
const PROVIDER_NAME = process.env.PROVIDER_NAME || 'payment-gateway-api';
const PROVIDER_VERSION = version || process.env.PROVIDER_VERSION || '1.0.0';
const ENVIRONMENT = environment || process.env.ENVIRONMENT || 'local';

console.log('🔍 Can I Deploy - Provider\n');
console.log(`Provider: ${PROVIDER_NAME}`);
console.log(`Version: ${PROVIDER_VERSION}`);
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

  // For local testing without environments, just check latest versions
  const command = `npx pact-broker can-i-deploy \
    --pacticipant="${PROVIDER_NAME}" \
    --version="${PROVIDER_VERSION}" \
    --broker-base-url="${BROKER_BASE_URL}" \
    ${authArgs}`;

  console.log('🔄 Checking deployment safety...\n');

  execSync(command, { 
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('\n✅ SAFE TO DEPLOY!');
  console.log('   All consumer contracts are compatible with this provider version.');
  console.log(`   You can deploy ${PROVIDER_NAME} v${PROVIDER_VERSION} to ${ENVIRONMENT}\n`);
  
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ DEPLOYMENT BLOCKED!');
  console.error('   One or more consumer contracts are incompatible.');
  console.error('   Review the verification results above.\n');
  
  console.error('💡 What to do:');
  console.error('   1. Review breaking changes in your provider');
  console.error('   2. Update consumers to handle the changes');
  console.error('   3. Publish updated consumer contracts');
  console.error('   4. Run can-i-deploy again\n');
  
  process.exit(1);
}
