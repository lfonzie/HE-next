import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Mock publish
    const publishedPrompt = {
      id: params.id,
      status: 'active',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: publishedPrompt
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
