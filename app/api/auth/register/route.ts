import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, birth_date, city, state, school, accept_terms } = await request.json()

    if (!name || !email || !password || !birth_date || !city || !state || !school) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (!accept_terms) {
      return NextResponse.json({ error: 'Você deve aceitar os Termos de Uso para continuar' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}