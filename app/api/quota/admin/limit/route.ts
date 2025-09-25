import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuotaService } from '@/lib/quota-service'

/**
 * PUT /api/quota/admin/limit - Atualizar limite de quota de um usuário (admin only)
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { userId, newLimit, month } = body

    if (!userId || !newLimit) {
      return NextResponse.json(
        { error: 'ID do usuário e novo limite são obrigatórios' },
        { status: 400 }
      )
    }

    if (typeof newLimit !== 'number' || newLimit < 0) {
      return NextResponse.json(
        { error: 'Limite deve ser um número positivo' },
        { status: 400 }
      )
    }

    await QuotaService.updateQuotaLimit(userId, newLimit, month)

    return NextResponse.json({
      message: 'Limite de quota atualizado com sucesso',
      userId,
      newLimit,
      month: month || 'mês atual'
    })

  } catch (error) {
    console.error('Erro ao atualizar limite de quota:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
