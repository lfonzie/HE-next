import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    // Mock preview
    const previewData = {
      input: body.input,
      output: 'Mock preview response',
      tokens: 150,
      cost: 0.001
    }

    return NextResponse.json({
      success: true,
      data: previewData
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
