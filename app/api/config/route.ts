import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getServerSession } from 'next-auth'


import { authOptions } from '@/lib/auth'


import { apiConfig } from '@/lib/api-config'



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = apiConfig.getConfig()
    
    return NextResponse.json({
      success: true,
      config,
      message: 'API configuration retrieved successfully'
    })
  } catch (error) {
    console.error('Error retrieving API config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update configuration
    apiConfig.updateConfig(body)
    
    const updatedConfig = apiConfig.getConfig()
    
    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: 'API configuration updated successfully'
    })
  } catch (error) {
    console.error('Error updating API config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
