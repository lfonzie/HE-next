#!/usr/bin/env node

/**
 * Test Script for Gemini Audio API
 * 
 * Usage:
 *   node test-gemini-audio.js
 * 
 * This script tests the Gemini Audio API endpoint to ensure it's working correctly.
 */

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n📋 Test 1: Health Check', 'bright');
  log('━'.repeat(50), 'cyan');

  try {
    const response = await fetch(`${BASE_URL}/api/gemini-audio`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${data.status}`, 'cyan');
      log(`   Service: ${data.service}`, 'cyan');
      log(`   Version: ${data.version}`, 'cyan');
      return true;
    } else {
      log('❌ Health check failed', 'red');
      log(`   Status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Health check error', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return false;
  }
}

async function testBasicRequest() {
  log('\n📋 Test 2: Basic Request', 'bright');
  log('━'.repeat(50), 'cyan');

  const prompt = 'Diga olá em uma frase curta.';
  log(`   Prompt: "${prompt}"`, 'cyan');

  try {
    const startTime = Date.now();

    const response = await fetch(`${BASE_URL}/api/gemini-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      log('✅ Basic request passed', 'green');
      log(`   Duration: ${duration}ms`, 'cyan');
      log(`   Text Length: ${data.text?.length || 0} chars`, 'cyan');
      log(`   Has Audio: ${data.audio ? 'Yes' : 'No'}`, 'cyan');
      log(`   Audio Format: ${data.audioFormat || 'N/A'}`, 'cyan');
      log(`   Voice: ${data.voice || 'N/A'}`, 'cyan');
      log(`   Response: "${data.text?.substring(0, 100)}..."`, 'blue');
      return true;
    } else {
      log('❌ Basic request failed', 'red');
      log(`   Status: ${response.status}`, 'yellow');
      log(`   Error: ${data.error}`, 'yellow');
      log(`   Details: ${data.details}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Basic request error', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return false;
  }
}

async function testInvalidRequest() {
  log('\n📋 Test 3: Invalid Request (No Prompt)', 'bright');
  log('━'.repeat(50), 'cyan');

  try {
    const response = await fetch(`${BASE_URL}/api/gemini-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400) {
      log('✅ Invalid request handled correctly', 'green');
      log(`   Error: ${data.error}`, 'cyan');
      return true;
    } else {
      log('⚠️  Expected 400 status, got:', 'yellow');
      log(`   Status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Invalid request test error', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return false;
  }
}

async function testLongPrompt() {
  log('\n📋 Test 4: Long Prompt', 'bright');
  log('━'.repeat(50), 'cyan');

  const prompt = 'Conte uma história curta sobre um astronauta corajoso que explora um planeta desconhecido.';
  log(`   Prompt: "${prompt}"`, 'cyan');

  try {
    const startTime = Date.now();

    const response = await fetch(`${BASE_URL}/api/gemini-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      log('✅ Long prompt passed', 'green');
      log(`   Duration: ${duration}ms`, 'cyan');
      log(`   Text Length: ${data.text?.length || 0} chars`, 'cyan');
      log(`   Has Audio: ${data.audio ? 'Yes' : 'No'}`, 'cyan');
      
      if (data.audio) {
        const audioSizeKB = (data.audio.length * 0.75 / 1024).toFixed(2); // Base64 to bytes to KB
        log(`   Audio Size: ~${audioSizeKB} KB`, 'cyan');
      }
      
      return true;
    } else {
      log('❌ Long prompt failed', 'red');
      log(`   Status: ${response.status}`, 'yellow');
      log(`   Error: ${data.error}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Long prompt error', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return false;
  }
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════╗', 'bright');
  log('║   Gemini Audio API Test Suite                ║', 'bright');
  log('╚═══════════════════════════════════════════════╝', 'bright');

  // Check if server is running
  try {
    await fetch(`${BASE_URL}/api/health`);
  } catch (error) {
    log('\n❌ Server is not running!', 'red');
    log('   Please start the server with: npm run dev', 'yellow');
    process.exit(1);
  }

  const results = [];

  // Run tests
  results.push(await testHealthCheck());
  results.push(await testBasicRequest());
  results.push(await testInvalidRequest());
  results.push(await testLongPrompt());

  // Summary
  log('\n╔═══════════════════════════════════════════════╗', 'bright');
  log('║   Test Summary                                ║', 'bright');
  log('╚═══════════════════════════════════════════════╝', 'bright');

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;

  log(`\n   Total Tests: ${total}`, 'cyan');
  log(`   Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`   Failed: ${failed}`, failed === 0 ? 'green' : 'red');

  if (passed === total) {
    log('\n🎉 All tests passed!', 'green');
    log('   Your Gemini Audio API is working correctly.', 'green');
    log('\n   Access the UI at: http://localhost:3000/gemini-audio', 'cyan');
  } else {
    log('\n⚠️  Some tests failed', 'yellow');
    log('   Check the errors above for details.', 'yellow');
  }

  log('\n' + '━'.repeat(50), 'cyan');
  log('');

  process.exit(failed > 0 ? 1 : 0);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  log('❌ This script requires Node.js 18 or higher', 'red');
  log('   Your Node.js version: ' + process.version, 'yellow');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});

