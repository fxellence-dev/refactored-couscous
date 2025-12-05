#!/usr/bin/env node

/**
 * Can I Deploy - Consumer
 * Checks if the consumer can be safely deployed based on contract compatibility
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
const CONSUMER_NAME = process.env.CONSUMER_NAME || 'payment-client';
const CONSUMER_VERSION = version || process.env.CONSUMER_VERSION || '1.0.0';
const ENVIRONMENT = environment || process.env.ENVIRONMENT || 'local';

console.log('🔍 Can I Deploy - Consumer\n');
console.log(`Consumer: ${CONSUMER_NAME}`);
console.log(`Version: ${CONSUMER_VERSION}`);
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
    --pacticipant="${CONSUMER_NAME}" \
    --version="${CONSUMER_VERSION}" \
    --broker-base-url="${BROKER_BASE_URL}" \
    ${authArgs}`;

  console.log('🔄 Checking deployment safety...\n');

  execSync(command, { 
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('\n✅ SAFE TO DEPLOY!');
  console.log('   Consumer contract is compatible with deployed provider.');
  console.log(`   You can deploy ${CONSUMER_NAME} v${CONSUMER_VERSION} to ${ENVIRONMENT}\n`);
  
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ DEPLOYMENT BLOCKED!');
  console.error('   Consumer contract is incompatible with the provider.');
  console.error('   Review the verification results above.\n');
  
  console.error('💡 What to do:');
  console.error('   1. Check if provider has the required endpoints');
  console.error('   2. Update your consumer code to match provider changes');
  console.error('   3. Update consumer tests and regenerate pact files');
  console.error('   4. Run can-i-deploy again\n');
  
  process.exit(1);
}
