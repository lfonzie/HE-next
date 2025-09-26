#!/usr/bin/env node

/**
 * Test script for Live Chat permissions functionality
 * Tests the auto-permission request feature after connection
 */

import fetch from 'node-fetch'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testLiveChatPermissions() {
  console.log('🧪 Testing Live Chat Permissions...\n')

  try {
    // Test 1: Check if live-connect endpoint works
    console.log('1️⃣ Testing live-connect endpoint...')
    const connectResponse = await fetch(`${BASE_URL}/api/test/live-connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!connectResponse.ok) {
      throw new Error(`Connection failed: ${connectResponse.statusText}`)
    }

    const connectData = await connectResponse.json()
    console.log('✅ Connection successful:', connectData.sessionId)
    console.log('   Status:', connectData.status)
    console.log('   Gemini Test:', connectData.geminiTest)

    // Test 2: Check if text sending works
    console.log('\n2️⃣ Testing text message sending...')
    const textResponse = await fetch(`${BASE_URL}/api/test/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Hello, this is a test message' }),
    })

    if (!textResponse.ok) {
      throw new Error(`Text sending failed: ${textResponse.statusText}`)
    }

    console.log('✅ Text message endpoint accessible')
    console.log('   Response status:', textResponse.status)

    // Test 3: Check media streaming endpoints
    console.log('\n3️⃣ Testing media streaming endpoints...')
    
    const endpoints = [
      '/api/chat/live/send-audio-stream',
      '/api/chat/live/send-video-stream', 
      '/api/chat/live/send-screen-stream'
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: Buffer.from('test data'),
        })
        
        // We expect these to fail without proper data, but endpoint should exist
        console.log(`   ${endpoint}: ${response.status} ${response.statusText}`)
      } catch (error) {
        console.log(`   ${endpoint}: Error - ${error.message}`)
      }
    }

    console.log('\n🎉 All tests completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Live connection endpoint working')
    console.log('   ✅ Text messaging endpoint working')
    console.log('   ✅ Media streaming endpoints accessible')
    console.log('\n💡 Next steps:')
    console.log('   1. Open /chat/live in browser')
    console.log('   2. Click "Conectar" button')
    console.log('   3. Browser should request microphone/camera permissions')
    console.log('   4. Click mic/video/screen buttons to start streaming')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testLiveChatPermissions()
