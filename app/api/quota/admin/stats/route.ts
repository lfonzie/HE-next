import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuotaService } from '@/lib/quota-service'

/**
 * GET /api/quota/admin/stats - Obter estatísticas de quotas (admin only)
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

    // Verificar se é admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || undefined

    const stats = await QuotaService.getQuotaStats(month)

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao obter estatísticas de quota:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
