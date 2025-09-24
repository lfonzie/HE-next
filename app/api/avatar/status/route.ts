import { NextRequest, NextResponse } from 'next/server'

const DID_API_URL = 'https://api.d-id.com'
const DID_API_KEY = process.env.DID_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if D-ID API key is configured
    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: 'D-ID API key not configured' },
        { status: 500 }
      )
    }

    // Get video status
    const response = await fetch(`${DID_API_URL}/talks/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to get video status')
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      videoId: result.id,
      status: result.status,
      videoUrl: result.result_url,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    })

  } catch (error) {
    console.error('Video Status Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get video status' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
