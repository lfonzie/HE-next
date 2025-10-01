// app/api/admin/system-messages/reload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { reloadSystemMessages } from '@/lib/system-message-loader'

import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Recarregar cache de system messages
    reloadSystemMessages()

    return NextResponse.json({ success: true, message: 'System messages cache reloaded' })
  } catch (error) {
    const adminResponse = handleAdminRouteError(error)
    if (adminResponse) {
      return adminResponse
    }

    console.error('Error reloading system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
