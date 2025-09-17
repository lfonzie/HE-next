import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, description, priority, category } = body;

    // Validação básica
    if (!subject || !description) {
      return NextResponse.json(
        { message: 'Assunto e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar ticket
    const ticketId = uuidv4();
    const ticket = {
      id: ticketId,
      subject,
      description,
      priority: priority || 'MEDIA',
      category: category || 'TECNICO',
      status: 'ABERTO',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar no banco (simulado por enquanto)
    console.log('Ticket criado:', ticket);

    return NextResponse.json({
      ticketId,
      message: 'Ticket criado com sucesso',
      ticket
    });

  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Listar tickets (simulado por enquanto)
    const tickets = [
      {
        id: '1',
        subject: 'Problema de login',
        description: 'Não consigo fazer login no sistema',
        priority: 'ALTA',
        category: 'TECNICO',
        status: 'ABERTO',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    return NextResponse.json({ tickets });

  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
