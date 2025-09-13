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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin ou super_admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');

    let filteredSchools = mockSchools;

    // Aplicar filtros
    if (search) {
      filteredSchools = filteredSchools.filter(school =>
        school.name.toLowerCase().includes(search.toLowerCase()) ||
        school.domain.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (plan && plan !== 'all') {
      filteredSchools = filteredSchools.filter(school => school.plan === plan);
    }

    if (status && status !== 'all') {
      filteredSchools = filteredSchools.filter(school => school.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredSchools,
      total: filteredSchools.length
    });

  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin ou super_admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { name, domain, city, state, country, plan } = body;

    // Validações básicas
    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Nome e domínio são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o domínio já existe
    const existingSchool = mockSchools.find(school => school.domain === domain);
    if (existingSchool) {
      return NextResponse.json(
        { error: 'Domínio já está em uso' },
        { status: 400 }
      );
    }

    // Criar nova escola
    const newSchool = {
      id: Date.now().toString(),
      name,
      domain,
      city: city || '',
      state: state || '',
      country: country || 'Brasil',
      plan: plan || 'basic',
      status: 'active',
      usersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    // Em produção, salvar no banco de dados
    mockSchools.push(newSchool);

    return NextResponse.json({
      success: true,
      data: newSchool,
      message: 'Escola criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
