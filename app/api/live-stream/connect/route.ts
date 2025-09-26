import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured' 
      }, { status: 500 })
    }

    console.log('🔗 [LIVE-STREAM] Testing Gemini API connection...')

    // Test Gemini API connection
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" })

      // Test basic connection with a simple request
      const result = await model.generateContent("Hello, this is a connection test.")
      const response = await result.response
      const text = response.text()
      
      console.log('✅ [LIVE-STREAM] Gemini API connection successful')
      
      return NextResponse.json({ 
        status: 'connected',
        model: 'gemini-2.0-flash-thinking-exp',
        message: 'Conexão com Gemini API estabelecida com sucesso!',
        testResponse: text.substring(0, 100) + '...'
      })
    } catch (geminiError: any) {
      console.error('❌ [LIVE-STREAM] Gemini connection error:', geminiError)
      return NextResponse.json({ 
        error: 'Failed to connect to Gemini API',
        details: geminiError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [LIVE-STREAM] Connection error:', error)
    return NextResponse.json({ 
      error: 'Failed to establish connection',
      details: error.message 
    }, { status: 500 })
  }
}
