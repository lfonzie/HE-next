// app/api/admin/system-messages/reload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { reloadSystemMessages } from '@/lib/system-message-loader'

// Verificar se o usuário é admin
async function isAdmin(session: any): Promise<boolean> {
  // Implementar lógica de verificação de admin
  // Por enquanto, assumir que qualquer usuário autenticado é admin
  return !!session?.user
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Recarregar cache de system messages
    reloadSystemMessages()

    return NextResponse.json({ success: true, message: 'System messages cache reloaded' })
  } catch (error) {
    console.error('Error reloading system messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
