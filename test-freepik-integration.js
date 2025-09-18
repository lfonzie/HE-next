#!/usr/bin/env node

/**
 * Test script for Freepik API integration
 * Run with: node test-freepik-integration.js
 */

import axios from 'axios';

const FREEPIK_API_KEY = 'FPSXadeac0afae95aa5f843f43e6682fd15f';
const BASE_URL = 'https://api.freepik.com/v1';

async function testFreepikAPI() {
  console.log('🚀 Testing Freepik Stock Content API Integration...\n');

  try {
    // Test 1: Search for images using Stock Content API
    console.log('📋 Test 1: Searching for images...');
    const searchResponse = await axios.get(`${BASE_URL}/stock-content/search`, {
      headers: {
        'Authorization': `Bearer ${FREEPIK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        query: 'education',
        limit: 5,
        type: 'images',
      },
    });

    console.log('✅ Image search successful!');
    console.log(`Found ${searchResponse.data.data?.length || 0} results`);
    if (searchResponse.data.data?.length > 0) {
      const firstResult = searchResponse.data.data[0];
      console.log(`First result: ${firstResult.title}`);
      console.log(`Preview URL: ${firstResult.preview_url}`);
    }
    console.log('');

    // Test 2: Search for templates
    console.log('📋 Test 2: Searching for templates...');
    const templateResponse = await axios.get(`${BASE_URL}/stock-content/search`, {
      headers: {
        'Authorization': `Bearer ${FREEPIK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        query: 'presentation',
        limit: 3,
        type: 'templates',
      },
    });

    console.log('✅ Template search successful!');
    console.log(`Found ${templateResponse.data.data?.length || 0} template results\n`);

    // Test 3: Search for icons
    console.log('📋 Test 3: Searching for icons...');
    const iconResponse = await axios.get(`${BASE_URL}/stock-content/search`, {
      headers: {
        'Authorization': `Bearer ${FREEPIK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        query: 'education',
        limit: 3,
        type: 'icons',
      },
    });

    console.log('✅ Icon search successful!');
    console.log(`Found ${iconResponse.data.data?.length || 0} icon results\n`);

    // Test 4: Test Classifier API
    console.log('📋 Test 4: Testing Classifier API...');
    try {
      const classifyResponse = await axios.post(`${BASE_URL}/classifier/classify`, {
        text_content: 'A classroom with students learning mathematics',
      }, {
        headers: {
          'Authorization': `Bearer ${FREEPIK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Classification successful!');
      console.log('Classification response:', JSON.stringify(classifyResponse.data, null, 2));
    } catch (classifyError) {
      console.log('⚠️  Classification test failed');
      console.log('Error:', classifyError.response?.data?.error || classifyError.message);
    }
    console.log('');

    // Test 5: Test download endpoint (if we have a resource ID)
    if (searchResponse.data.data?.length > 0) {
      const resourceId = searchResponse.data.data[0].id;
      console.log('📋 Test 5: Testing download endpoint...');
      try {
        const downloadResponse = await axios.get(`${BASE_URL}/stock-content/images/${resourceId}/download`, {
          headers: {
            'Authorization': `Bearer ${FREEPIK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('✅ Download endpoint successful!');
        console.log('Download response:', JSON.stringify(downloadResponse.data, null, 2));
      } catch (downloadError) {
        console.log('⚠️  Download test failed');
        console.log('Error:', downloadError.response?.data?.error || downloadError.message);
      }
    }

    console.log('\n🎉 Freepik API integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add FREEPIK_API_KEY to your .env.local file');
    console.log('2. Start your Next.js development server: npm run dev');
    console.log('3. Visit http://localhost:3000/freepik-search to test the interface');
    console.log('4. Integrate FreepikImageSelector component into your aulas system');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication Error:');
      console.log('- Check if your API key is correct');
      console.log('- Verify the API key has the necessary permissions');
    } else if (error.response?.status === 429) {
      console.log('\n⏱️  Rate Limit Error:');
      console.log('- You have exceeded the API rate limit');
      console.log('- Wait before making more requests');
    } else if (error.response?.status === 400) {
      console.log('\n📝 Bad Request Error:');
      console.log('- Check your request parameters');
      console.log('- Verify the API endpoint URL');
    }
  }
}

// Run the test
testFreepikAPI();
