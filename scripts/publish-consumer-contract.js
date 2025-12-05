#!/usr/bin/env node

/**
 * Publish Consumer Contract (Pact file) to PactFlow/Pact Broker
 * This script uploads the consumer's Pact contract for bi-directional contract testing
 */

require('dotenv').config({ path: require('path').join(__dirname, '../consumer/.env') });
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const BROKER_BASE_URL = process.env.PACT_BROKER_BASE_URL || 'http://localhost:9292';
const BROKER_TOKEN = process.env.PACT_BROKER_TOKEN;
const BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact';
const CONSUMER_NAME = process.env.CONSUMER_NAME || 'payment-client';
const CONSUMER_VERSION = process.env.CONSUMER_VERSION || '1.0.0';
const PACT_DIR = path.join(__dirname, '../consumer/pacts');

console.log('📤 Publishing Consumer Contract (Pact file)...\n');

// Find pact files
const pactFiles = fs.readdirSync(PACT_DIR).filter(f => f.endsWith('.json') && f !== '.gitkeep');

if (pactFiles.length === 0) {
  console.error('❌ Error: No pact files found in:', PACT_DIR);
  console.error('   Run consumer tests first to generate pact files.');
  process.exit(1);
}

console.log(`Consumer: ${CONSUMER_NAME}`);
console.log(`Version: ${CONSUMER_VERSION}`);
console.log(`Broker: ${BROKER_BASE_URL}`);
console.log(`Pact Files: ${pactFiles.join(', ')}\n`);

try {
  // Build authentication arguments
  let authArgs = '';
  if (BROKER_TOKEN) {
    authArgs = `--broker-token="${BROKER_TOKEN}"`;
  } else {
    authArgs = `--broker-username="${BROKER_USERNAME}" --broker-password="${BROKER_PASSWORD}"`;
  }

  // Get git branch and commit (if available)
  let branch = 'main';
  let commit = 'unknown';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.warn('⚠️  Could not get git info, using defaults');
  }

  // Publish each pact file
  pactFiles.forEach(pactFile => {
    const pactPath = path.join(PACT_DIR, pactFile);
    
    console.log(`🔄 Publishing ${pactFile}...`);
    
    const command = `npx pact-broker publish \
      "${pactPath}" \
      --consumer-app-version="${CONSUMER_VERSION}" \
      --broker-base-url="${BROKER_BASE_URL}" \
      --tag="${branch}" \
      --tag="latest" \
      --build-url="local" \
      ${authArgs}`;

    execSync(command, { 
      stdio: 'inherit',
      shell: '/bin/bash'
    });
  });

  console.log('\n✅ Consumer contract published successfully!');
  console.log(`\n📊 View in broker: ${BROKER_BASE_URL}`);
  console.log(`   Branch: ${branch}`);
  console.log(`   Commit: ${commit}`);
  
} catch (error) {
  console.error('\n❌ Failed to publish consumer contract');
  
  if (error.status) {
    console.error(`   Exit code: ${error.status}`);
  }
  
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Ensure Pact Broker is running (docker-compose up)');
  console.error('   2. Check PACT_BROKER_BASE_URL is correct');
  console.error('   3. Verify credentials are correct');
  console.error('   4. Install pact-broker CLI: npm install -g @pact-foundation/pact-node\n');
  
  process.exit(1);
}
