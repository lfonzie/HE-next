import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !['FREE', 'PREMIUM', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
    }

    // Atualizar a role do usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        birth_date: true,
        city: true,
        state: true,
        school: true
      }
    })

    return NextResponse.json({
      message: `Role atualizada para ${role}`,
      user: {
        ...updatedUser,
        birth_date: updatedUser.birth_date?.toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Upgrade API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
