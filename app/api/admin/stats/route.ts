import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Mock data - em produção isso viria do banco de dados
    const stats = {
      summary: {
        totalSchools: 5,
        totalUsers: 15,
        totalConversations: 1048,
        totalAnalytics: 294,
        activeUsersThisMonth: 4,
        totalQuotas: 7,
        growthRate: 0
      },
      systemStatus: {
        services: {
          database: { status: 'healthy', detail: 'Conectado' },
          openai: { status: 'healthy', detail: 'API Ativa' },
          storage: { status: 'healthy', detail: 'Disponível' },
          auth: { status: 'healthy', detail: 'Ativo' },
          rateLimit: { status: 'healthy', detail: 'Normal' },
          lgpd: { status: 'healthy', detail: 'Conforme' }
        }
      },
      recentActivity: [
        {
          id: '1',
          type: 'school_created',
          description: 'Nova escola "Escola Municipal João Silva" foi criada',
          timestamp: '2024-01-20T10:30:00Z',
          user: 'Admin User'
        },
        {
          id: '2',
          type: 'user_registered',
          description: 'Novo usuário registrado na escola "Colégio Estadual Maria Santos"',
          timestamp: '2024-01-19T14:15:00Z',
          user: 'Maria Santos'
        },
        {
          id: '3',
          type: 'system_update',
          description: 'Sistema atualizado para versão 1.2.0',
          timestamp: '2024-01-18T09:00:00Z',
          user: 'System'
        }
      ],
      charts: {
        usersOverTime: [
          { date: '2024-01-01', users: 10 },
          { date: '2024-01-02', users: 12 },
          { date: '2024-01-03', users: 15 },
          { date: '2024-01-04', users: 18 },
          { date: '2024-01-05', users: 20 }
        ],
        conversationsOverTime: [
          { date: '2024-01-01', conversations: 50 },
          { date: '2024-01-02', conversations: 75 },
          { date: '2024-01-03', conversations: 100 },
          { date: '2024-01-04', conversations: 125 },
          { date: '2024-01-05', conversations: 150 }
        ],
        schoolsByPlan: [
          { plan: 'basic', count: 2 },
          { plan: 'premium', count: 2 },
          { plan: 'enterprise', count: 1 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
