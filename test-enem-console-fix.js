#!/usr/bin/env node

/**
 * Test script to verify ENEM console loop fix
 * This script simulates the ENEM session creation process
 */

const fetch = require('node-fetch');

async function testEnemSessionCreation() {
  console.log('🧪 Testing ENEM session creation to check for console loops...\n');
  
  try {
    const testConfig = {
      mode: 'custom',
      area: ['CN'], // Test with one area first
      config: {
        num_questions: 5, // Small number for testing
        time_limit: 300,
        year: 2023
      }
    };

    console.log('📝 Test configuration:', JSON.stringify(testConfig, null, 2));
    console.log('\n🚀 Making request to /api/enem/sessions...\n');

    const response = await fetch('http://localhost:3000/api/enem/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testConfig)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Session created successfully');
      console.log(`📊 Session ID: ${result.session_id}`);
      console.log(`📋 Questions generated: ${result.items?.length || 0}`);
      console.log(`⏱️ Estimated duration: ${result.metadata?.estimated_duration || 'N/A'} minutes`);
      
      if (result.items && result.items.length > 0) {
        console.log('\n📝 Sample question:');
        const sampleQuestion = result.items[0];
        console.log(`   Area: ${sampleQuestion.area}`);
        console.log(`   Year: ${sampleQuestion.year}`);
        console.log(`   Text preview: ${sampleQuestion.text?.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Error:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testEnemSessionCreation().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test error:', error);
});
