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

    const { birth_date, city, state, school } = await request.json()

    if (!birth_date || !city || !state || !school) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Atualizar o usuário com as informações do perfil
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        birth_date: new Date(birth_date),
        city,
        state,
        school,
      }
    })

    return NextResponse.json({
      message: 'Perfil completado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileComplete: true
      }
    })

  } catch (error) {
    console.error('Complete profile API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
