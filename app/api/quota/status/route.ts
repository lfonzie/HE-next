import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuotaService } from '@/lib/quota-service'

/**
 * GET /api/quota/status - Obter status da quota do usuário atual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || undefined

    const quotaStatus = await QuotaService.getQuotaStatus(session.user.id, month)

    if (!quotaStatus) {
      return NextResponse.json(
        { error: 'Quota não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(quotaStatus)

  } catch (error) {
    console.error('Erro ao obter status da quota:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
