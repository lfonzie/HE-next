import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data - em produção isso viria do banco de dados
const mockSchools = [
  {
    id: "1",
    name: "Escola Municipal João Silva",
    domain: "joaosilva.edu.br",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    plan: "premium",
    status: "active",
    usersCount: 25,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    name: "Colégio Estadual Maria Santos",
    domain: "mariasantos.edu.br",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    plan: "basic",
    status: "active",
    usersCount: 15,
    createdAt: "2024-02-01",
    updatedAt: "2024-02-05"
  },
  {
    id: "3",
    name: "Instituto Federal Pedro Costa",
    domain: "pedrocosta.edu.br",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    plan: "enterprise",
    status: "pending",
    usersCount: 8,
    createdAt: "2024-02-10",
    updatedAt: "2024-02-12"
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin ou super_admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const school = mockSchools.find(s => s.id === id);

    if (!school) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: school
    });

  } catch (error) {
    console.error('Erro ao buscar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin ou super_admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, domain, city, state, country, plan, status } = body;

    const schoolIndex = mockSchools.findIndex(s => s.id === id);

    if (schoolIndex === -1) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o domínio já existe em outra escola
    if (domain) {
      const existingSchool = mockSchools.find(school => 
        school.domain === domain && school.id !== id
      );
      if (existingSchool) {
        return NextResponse.json(
          { error: 'Domínio já está em uso' },
          { status: 400 }
        );
      }
    }

    // Atualizar escola
    const updatedSchool = {
      ...mockSchools[schoolIndex],
      ...(name && { name }),
      ...(domain && { domain }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(country !== undefined && { country }),
      ...(plan && { plan }),
      ...(status && { status }),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    mockSchools[schoolIndex] = updatedSchool;

    return NextResponse.json({
      success: true,
      data: updatedSchool,
      message: 'Escola atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin ou super_admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const schoolIndex = mockSchools.findIndex(s => s.id === id);

    if (schoolIndex === -1) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a escola tem usuários
    const school = mockSchools[schoolIndex];
    if (school.usersCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma escola com usuários associados' },
        { status: 400 }
      );
    }

    // Remover escola
    mockSchools.splice(schoolIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Escola deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
