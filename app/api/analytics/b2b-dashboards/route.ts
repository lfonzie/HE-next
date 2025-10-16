import { NextRequest, NextResponse } from 'next/server';
import { B2BDashboard } from '@/hooks/useSustainabilityAnalytics';

// Mock database for B2B dashboards
const mockB2bDashboards: B2BDashboard[] = [
  {
    id: 'b2b_001',
    clientId: 'client_001',
    clientName: 'Universidade Federal do Rio de Janeiro',
    metrics: [
      {
        id: 'met_001',
        name: 'Sustentabilidade',
        value: 85,
        unit: '%',
        target: 90,
        status: 'on_track',
        trend: 'up',
      },
      {
        id: 'met_002',
        name: 'Inclusividade',
        value: 78,
        unit: '%',
        target: 85,
        status: 'on_track',
        trend: 'up',
      },
      {
        id: 'met_003',
        name: 'Performance',
        value: 92,
        unit: '%',
        target: 90,
        status: 'ahead',
        trend: 'up',
      },
      {
        id: 'met_004',
        name: 'Engajamento',
        value: 88,
        unit: '%',
        target: 85,
        status: 'ahead',
        trend: 'up',
      },
    ],
    reports: [
      {
        id: 'rep_001',
        title: 'Relatório de Sustentabilidade Q4 2023',
        type: 'sustainability',
        period: 'Q4 2023',
        data: {
          carbonReduction: 25,
          energyEfficiency: 15,
          wasteReduction: 30,
        },
        insights: [
          'Redução de 25% nas emissões de CO2',
          'Melhoria de 15% na eficiência energética',
          'Redução de 30% na geração de resíduos',
        ],
        recommendations: [
          'Implementar painéis solares',
          'Otimizar uso de servidores',
          'Expandir programa de reciclagem',
        ],
        generatedAt: '2023-12-15T00:00:00Z',
      },
      {
        id: 'rep_002',
        title: 'Relatório de Inclusividade Q4 2023',
        type: 'inclusivity',
        period: 'Q4 2023',
        data: {
          accessibilityScore: 85,
          diversityIndex: 78,
          equityScore: 82,
        },
        insights: [
          'Aumento de 20% na diversidade de gênero',
          'Melhoria de 30% na acessibilidade',
          'Redução de 15% na desigualdade de acesso',
        ],
        recommendations: [
          'Expandir programas de inclusão',
          'Melhorar acessibilidade digital',
          'Implementar políticas de equidade',
        ],
        generatedAt: '2023-12-15T00:00:00Z',
      },
    ],
    lastUpdated: '2023-12-15T00:00:00Z',
  },
  {
    id: 'b2b_002',
    clientId: 'client_002',
    clientName: 'Instituto Federal de Educação',
    metrics: [
      {
        id: 'met_005',
        name: 'Sustentabilidade',
        value: 72,
        unit: '%',
        target: 80,
        status: 'behind',
        trend: 'up',
      },
      {
        id: 'met_006',
        name: 'Inclusividade',
        value: 88,
        unit: '%',
        target: 85,
        status: 'ahead',
        trend: 'up',
      },
      {
        id: 'met_007',
        name: 'Performance',
        value: 85,
        unit: '%',
        target: 90,
        status: 'behind',
        trend: 'down',
      },
      {
        id: 'met_008',
        name: 'Engajamento',
        value: 82,
        unit: '%',
        target: 85,
        status: 'behind',
        trend: 'up',
      },
    ],
    reports: [
      {
        id: 'rep_003',
        title: 'Relatório de Performance Q4 2023',
        type: 'performance',
        period: 'Q4 2023',
        data: {
          completionRate: 85,
          satisfactionScore: 4.2,
          retentionRate: 78,
        },
        insights: [
          'Taxa de conclusão de 85%',
          'Pontuação de satisfação de 4.2/5',
          'Taxa de retenção de 78%',
        ],
        recommendations: [
          'Melhorar conteúdo interativo',
          'Implementar feedback personalizado',
          'Otimizar experiência do usuário',
        ],
        generatedAt: '2023-12-15T00:00:00Z',
      },
    ],
    lastUpdated: '2023-12-15T00:00:00Z',
  },
  {
    id: 'b2b_003',
    clientId: 'client_003',
    clientName: 'Colégio Estadual de São Paulo',
    metrics: [
      {
        id: 'met_009',
        name: 'Sustentabilidade',
        value: 90,
        unit: '%',
        target: 85,
        status: 'ahead',
        trend: 'up',
      },
      {
        id: 'met_010',
        name: 'Inclusividade',
        value: 75,
        unit: '%',
        target: 80,
        status: 'behind',
        trend: 'up',
      },
      {
        id: 'met_011',
        name: 'Performance',
        value: 88,
        unit: '%',
        target: 85,
        status: 'ahead',
        trend: 'up',
      },
      {
        id: 'met_012',
        name: 'Engajamento',
        value: 92,
        unit: '%',
        target: 90,
        status: 'ahead',
        trend: 'up',
      },
    ],
    reports: [
      {
        id: 'rep_004',
        title: 'Relatório de Compliance Q4 2023',
        type: 'compliance',
        period: 'Q4 2023',
        data: {
          lgpdCompliance: 95,
          accessibilityCompliance: 88,
          securityScore: 92,
        },
        insights: [
          '95% de conformidade com LGPD',
          '88% de conformidade com acessibilidade',
          'Pontuação de segurança de 92%',
        ],
        recommendations: [
          'Melhorar políticas de privacidade',
          'Implementar auditorias de acessibilidade',
          'Atualizar protocolos de segurança',
        ],
        generatedAt: '2023-12-15T00:00:00Z',
      },
    ],
    lastUpdated: '2023-12-15T00:00:00Z',
  },
];

// Get B2B dashboards
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId');
    const status = req.nextUrl.searchParams.get('status');

    let filteredDashboards = mockB2bDashboards;

    if (clientId) {
      filteredDashboards = filteredDashboards.filter(dashboard => dashboard.clientId === clientId);
    }

    if (status) {
      filteredDashboards = filteredDashboards.filter(dashboard => 
        dashboard.metrics.some(metric => metric.status === status)
      );
    }

    return NextResponse.json({ dashboards: filteredDashboards }, { status: 200 });
  } catch (error) {
    console.error('Error fetching B2B dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B dashboards' },
      { status: 500 }
    );
  }
}

// Create a new B2B dashboard
export async function POST(req: NextRequest) {
  try {
    const {
      clientId,
      clientName,
      metrics,
      reports,
    } = await req.json();

    if (!clientId || !clientName) {
      return NextResponse.json(
        { error: 'Client ID and client name are required' },
        { status: 400 }
      );
    }

    // Generate dashboard ID
    const dashboardId = `b2b_${Date.now()}`;

    // Create new dashboard
    const newDashboard: B2BDashboard = {
      id: dashboardId,
      clientId,
      clientName,
      metrics: metrics || [],
      reports: reports || [],
      lastUpdated: new Date().toISOString(),
    };

    // Add to mock database
    mockB2bDashboards.push(newDashboard);

    return NextResponse.json({ dashboard: newDashboard }, { status: 201 });
  } catch (error) {
    console.error('Error creating B2B dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create B2B dashboard' },
      { status: 500 }
    );
  }
}

// Update a B2B dashboard
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    const dashboardIndex = mockB2bDashboards.findIndex(d => d.id === id);
    if (dashboardIndex === -1) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Update dashboard
    mockB2bDashboards[dashboardIndex] = {
      ...mockB2bDashboards[dashboardIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ dashboard: mockB2bDashboards[dashboardIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating B2B dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to update B2B dashboard' },
      { status: 500 }
    );
  }
}

// Delete a B2B dashboard
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    const dashboardIndex = mockB2bDashboards.findIndex(d => d.id === id);
    if (dashboardIndex === -1) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Remove dashboard
    mockB2bDashboards.splice(dashboardIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting B2B dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to delete B2B dashboard' },
      { status: 500 }
    );
  }
}
