import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface TelemetryEvent {
  event: string
  timestamp: number
  userId?: string
  sessionId: string
  properties: Record<string, any>
  metadata: {
    userAgent: string
    url: string
    referrer?: string
    viewport: {
      width: number
      height: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication for production
    if (process.env.NODE_ENV === 'production') {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const event: TelemetryEvent = await request.json()

    // Validate event structure
    if (!event.event || !event.sessionId || !event.timestamp) {
      return NextResponse.json({ error: 'Invalid event structure' }, { status: 400 })
    }

    // Sanitize sensitive data
    const sanitizedEvent = sanitizeEvent(event)

    // Store event (in production, this would go to a proper analytics service)
    await storeTelemetryEvent(sanitizedEvent)

    // Return success
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Telemetry API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function sanitizeEvent(event: TelemetryEvent): TelemetryEvent {
  // Remove or truncate sensitive information
  const sanitized = { ...event }

  // Truncate long text fields
  if (sanitized.properties.input) {
    sanitized.properties.input = sanitized.properties.input.substring(0, 100)
  }
  if (sanitized.properties.prompt) {
    sanitized.properties.prompt = sanitized.properties.prompt.substring(0, 50)
  }

  // Remove sensitive metadata
  delete sanitized.metadata.referrer

  return sanitized
}

async function storeTelemetryEvent(event: TelemetryEvent) {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Telemetry Event:', event)
    return
  }

  // In production, this would store to a proper analytics service
  // For now, we'll store in a simple format
  const eventData = {
    ...event,
    storedAt: new Date().toISOString(),
  }

  // This could be replaced with:
  // - Google Analytics 4
  // - Mixpanel
  // - Amplitude
  // - Custom analytics database
  console.log('📊 Storing telemetry event:', eventData)
}

// Health check endpoint for telemetry service
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'telemetry',
    timestamp: new Date().toISOString(),
  })
}
