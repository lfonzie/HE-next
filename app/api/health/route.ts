import { NextResponse } from 'next/server'

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HE-next'
  })
}