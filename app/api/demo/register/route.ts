import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if demo user already exists
    const existingDemo = await prisma.demoUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingDemo) {
      return NextResponse.json(
        { error: 'Já existe um demo registrado para este email' },
        { status: 409 }
      );
    }

    // Create demo user
    const demoUser = await prisma.demoUser.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.replace(/\D/g, ''), // Remove non-digits
        registeredAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Demo registrado com sucesso',
      demoUser: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
        registeredAt: demoUser.registeredAt,
        expiresAt: demoUser.expiresAt
      }
    });

  } catch (error) {
    console.error('Demo registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
