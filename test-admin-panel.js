#!/usr/bin/env node

/**
 * Admin Panel Test Script
 * Tests the admin panel API endpoints
 */

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-token';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const endpoints = [
  '/api/admin/stats',
  '/api/admin/schools',
  '/api/admin/users',
  '/api/admin/conversations',
  '/api/admin/models',
  '/api/admin/prompts',
  '/api/admin/system-info'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint}...`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${endpoint} - Success (${Object.keys(data).length} fields)`);
    
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Admin Panel Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Token: ${ADMIN_TOKEN.substring(0, 10)}...\n`);

  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error}`);
    });
  }

  console.log('\n🎯 Next Steps:');
  if (successful === results.length) {
    console.log('1. ✅ All API endpoints are working correctly');
    console.log('2. 🌐 Visit http://localhost:3000/admin to access the admin panel');
    console.log('3. 🔐 Make sure you have ADMIN or SUPER_ADMIN role to access the UI');
  } else {
    console.log('1. 🔧 Fix the failed endpoints before accessing the admin panel');
    console.log('2. 📝 Check your database connection and environment variables');
    console.log('3. 🚀 Make sure your Next.js server is running on port 3000');
  }

  console.log('\n✨ Admin Panel Features:');
  console.log('- 📊 Dashboard with system statistics');
  console.log('- 🏫 Schools management');
  console.log('- 👥 Users overview');
  console.log('- 💬 Conversations history');
  console.log('- 🤖 AI Models configuration');
  console.log('- 📝 System prompts management');
  console.log('- ⚙️ System information and health');
}

// Run the tests
runTests().catch(console.error);
