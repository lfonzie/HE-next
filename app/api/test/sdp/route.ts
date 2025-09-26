import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sdp, model = 'gemini-2.0-live' } = await req.json()

    console.log('🧪 [TEST-SDP] Testando endpoint SDP')
    console.log('📋 [TEST-SDP] Model:', model)
    console.log('📋 [TEST-SDP] SDP Offer length:', sdp?.length || 0)

    // Retornar sucesso imediatamente para testar o fluxo
    return NextResponse.json({ 
      answer: 'mock-answer-sdp',
      sessionId: `test_session_${Date.now()}`,
      status: 'connected',
      mode: 'test'
    })

  } catch (error: any) {
    console.error('❌ [TEST-SDP] Error:', error)
    return NextResponse.json({ 
      error: 'Test SDP failed',
      details: error.message 
    }, { status: 500 })
  }
}
