import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        status: 'missing'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Gemini API key is configured',
      status: 'ok',
      keyLength: process.env.GEMINI_API_KEY.length
    })

  } catch (error: any) {
    console.error('❌ [TEST] Error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message 
    }, { status: 500 })
  }
}
