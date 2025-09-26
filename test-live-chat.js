#!/usr/bin/env node

/**
 * Test script for Live Chat implementation
 * Tests the API endpoints and basic functionality
 */

import { config } from 'dotenv'

// Load environment variables
config()

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

async function testLiveChatAPI() {
  console.log('🧪 Testing Live Chat API Implementation')
  console.log('=' .repeat(50))

  // Test 1: Check environment variables
  console.log('\n1. Checking environment variables...')
  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found in environment variables')
    console.log('   Please add GEMINI_API_KEY to your .env.local file')
    return false
  }
  console.log('✅ GEMINI_API_KEY is configured')

  // Test 2: Test connection endpoint
  console.log('\n2. Testing connection endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/live/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Connection endpoint working')
      console.log(`   Session ID: ${data.sessionId}`)
    } else {
      console.log('❌ Connection endpoint failed')
      console.log(`   Status: ${response.status}`)
      const error = await response.text()
      console.log(`   Error: ${error}`)
    }
  } catch (error) {
    console.log('❌ Connection endpoint error:', error.message)
  }

  // Test 3: Test text message endpoint
  console.log('\n3. Testing text message endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/chat/live/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message'
      })
    })

    if (response.ok) {
      console.log('✅ Text message endpoint working')
      console.log('   Response headers:', Object.fromEntries(response.headers.entries()))
    } else {
      console.log('❌ Text message endpoint failed')
      console.log(`   Status: ${response.status}`)
      const error = await response.text()
      console.log(`   Error: ${error}`)
    }
  } catch (error) {
    console.log('❌ Text message endpoint error:', error.message)
  }

  // Test 4: Check dependencies
  console.log('\n4. Checking dependencies...')
  try {
    const { GoogleGenAI } = await import('@google/genai')
    console.log('✅ @google/genai dependency available')
  } catch (error) {
    console.log('❌ @google/genai dependency not found')
    console.log('   Run: npm install @google/genai')
  }

  try {
    const mime = await import('mime')
    console.log('✅ mime dependency available')
  } catch (error) {
    console.log('❌ mime dependency not found')
    console.log('   Run: npm install mime')
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🎉 Live Chat API test completed!')
  console.log('\nNext steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Navigate to /chat/live in your browser')
  console.log('3. Test the live chat functionality')
  console.log('4. Check browser console for any errors')

  return true
}

// Test browser compatibility
function testBrowserCompatibility() {
  console.log('\n5. Browser compatibility check...')
  
  const features = {
    'MediaRecorder': typeof MediaRecorder !== 'undefined',
    'getUserMedia': navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function',
    'Web Audio API': typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
    'Fetch API': typeof fetch !== 'undefined',
    'WebSocket': typeof WebSocket !== 'undefined'
  }

  let allSupported = true
  for (const [feature, supported] of Object.entries(features)) {
    if (supported) {
      console.log(`✅ ${feature} supported`)
    } else {
      console.log(`❌ ${feature} not supported`)
      allSupported = false
    }
  }

  if (allSupported) {
    console.log('\n✅ All required browser features are supported!')
  } else {
    console.log('\n⚠️  Some browser features are not supported.')
    console.log('   Consider using Chrome, Firefox, or Safari for best compatibility.')
  }

  return allSupported
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  testLiveChatAPI().catch(console.error)
} else {
  // Browser environment
  testBrowserCompatibility()
}

export { testLiveChatAPI, testBrowserCompatibility }
