import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user || null,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      error: 'Auth test failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user || null,
      requestBody: body,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Auth test POST error:', error)
    return NextResponse.json({ 
      error: 'Auth test POST failed',
      details: error.message 
    }, { status: 500 })
  }
}