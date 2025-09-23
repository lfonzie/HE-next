#!/usr/bin/env node

/**
 * Test script for Google Image Search API Alternatives
 * Tests all implemented providers and fallback mechanisms
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestCase {
  name: string;
  query: string;
  subject?: string;
  count?: number;
  expectedMinResults?: number;
}

const testCases: TestCase[] = [
  {
    name: 'Mathematics - Basic',
    query: 'mathematics equations',
    subject: 'matemática',
    count: 3,
    expectedMinResults: 1
  },
  {
    name: 'Biology - Photosynthesis',
    query: 'photosynthesis biology',
    subject: 'biologia',
    count: 3,
    expectedMinResults: 1
  },
  {
    name: 'History - Ancient',
    query: 'ancient civilization',
    subject: 'história',
    count: 3,
    expectedMinResults: 1
  },
  {
    name: 'Geography - Landscape',
    query: 'mountain landscape',
    subject: 'geografia',
    count: 3,
    expectedMinResults: 1
  },
  {
    name: 'General Education',
    query: 'education learning',
    count: 3,
    expectedMinResults: 1
  }
];

async function testGoogleAlternativesAPI() {
  console.log('🔍 Testing Google Image Search API Alternatives\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Query: "${testCase.query}"`);
    console.log(`   Subject: ${testCase.subject || 'general'}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/images/google-alternatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          subject: testCase.subject,
          count: testCase.count || 3,
          safeSearch: true,
          imageType: 'photo',
          color: 'color',
          size: 'large',
          aspectRatio: 'wide',
          orientation: 'horizontal'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`   ✅ Status: ${data.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   📊 Results: ${data.images?.length || 0} images found`);
      console.log(`   🔍 Sources: ${data.sourcesUsed?.join(', ') || 'none'}`);
      console.log(`   ⏱️  Time: ${data.searchTime || 0}ms`);
      
      if (data.images && data.images.length > 0) {
        console.log(`   🖼️  First image: ${data.images[0].title?.substring(0, 50)}...`);
        console.log(`   📏 Dimensions: ${data.images[0].width}x${data.images[0].height}`);
        console.log(`   🏷️  Source: ${data.images[0].source}`);
        console.log(`   📈 Relevance: ${data.images[0].relevanceScore?.toFixed(2) || 'N/A'}`);
      }
      
      if (data.images && data.images.length >= (testCase.expectedMinResults || 1)) {
        passedTests++;
        console.log(`   ✅ PASSED`);
      } else {
        console.log(`   ❌ FAILED - Expected at least ${testCase.expectedMinResults || 1} results`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Google Image Alternatives are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check your API keys and configuration.');
  }
}

async function testEnhancedSearchIntegration() {
  console.log('\n🔗 Testing Enhanced Search Integration\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/enhanced-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'science laboratory',
        subject: 'ciências',
        count: 3,
        useGoogleAlternatives: true,
        preferredDimensions: { width: 1350, height: 1080 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Enhanced Search Status: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📊 Results: ${data.images?.length || 0} images found`);
    console.log(`🔍 Google Alternatives Used: ${data.googleAlternativesUsed ? 'YES' : 'NO'}`);
    console.log(`⏱️  Search Time: ${data.searchTime || 0}ms`);
    
    if (data.images && data.images.length > 0) {
      console.log(`🖼️  Sample image: ${data.images[0].title?.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.log(`❌ Enhanced Search Error: ${error.message}`);
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Testing Environment Variables\n');
  
  const requiredVars = [
    'BING_SEARCH_API_KEY',
    'PEXELS_API_KEY',
    'UNSPLASH_ACCESS_KEY',
    'PIXABAY_API_KEY'
  ];
  
  let configuredVars = 0;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== `your_${varName.toLowerCase()}_here`) {
      console.log(`✅ ${varName}: Configured`);
      configuredVars++;
    } else {
      console.log(`❌ ${varName}: Not configured`);
    }
  }
  
  console.log(`\n📊 Environment: ${configuredVars}/${requiredVars.length} variables configured`);
  
  if (configuredVars === 0) {
    console.log('⚠️  No API keys configured. Tests will use fallback providers only.');
  } else if (configuredVars < requiredVars.length) {
    console.log('⚠️  Some API keys missing. Some providers may not work.');
  } else {
    console.log('🎉 All API keys configured! All providers should work.');
  }
}

async function runAllTests() {
  console.log('🚀 Google Image Search API Alternatives - Test Suite');
  console.log('=' .repeat(60));
  
  await testEnvironmentVariables();
  await testGoogleAlternativesAPI();
  await testEnhancedSearchIntegration();
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Test suite completed!');
  console.log('\n📚 For more information, see: GOOGLE_IMAGE_ALTERNATIVES_README.md');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGoogleAlternativesAPI,
  testEnhancedSearchIntegration,
  testEnvironmentVariables,
  runAllTests
};
