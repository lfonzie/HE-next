import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, birth_date, city, state, school } = await request.json()

    if (!name || !email || !birth_date || !city || !state || !school) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Se o usuário já existe, atualizar com as informações adicionais
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          birth_date: new Date(birth_date),
          city,
          state,
          school,
        }
      })

      return NextResponse.json({ 
        message: 'Perfil atualizado com sucesso',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      })
    } else {
      // Se é um novo usuário, criar com google_id
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          google_id: email, // Usar email como google_id temporariamente
          birth_date: new Date(birth_date),
          city,
          state,
          school,
          plan: 'free',
          role: 'FREE'
        }
      })

      return NextResponse.json({ 
        message: 'Usuário criado com sucesso',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      })
    }

  } catch (error) {
    console.error('Google complete API error:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
