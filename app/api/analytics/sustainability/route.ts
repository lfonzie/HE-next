import { NextRequest, NextResponse } from 'next/server';
import { SustainabilityMetrics, InclusivityMetrics, EnvironmentalImpact, AccessibilityScore, DiversityReport, B2BDashboard } from '@/hooks/useSustainabilityAnalytics';

// Mock database for sustainability metrics
const mockSustainabilityMetrics: SustainabilityMetrics[] = [
  {
    id: 'sust_001',
    category: 'energy',
    metric: 'Energia Consumida',
    value: 1250,
    unit: 'kWh',
    baseline: 1500,
    target: 1000,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'down',
    impact: 'positive',
  },
  {
    id: 'sust_002',
    category: 'carbon',
    metric: 'Emissões de CO2',
    value: 2.5,
    unit: 'toneladas',
    baseline: 3.2,
    target: 2.0,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'down',
    impact: 'positive',
  },
  {
    id: 'sust_003',
    category: 'water',
    metric: 'Consumo de Água',
    value: 850,
    unit: 'litros',
    baseline: 1200,
    target: 800,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'down',
    impact: 'positive',
  },
  {
    id: 'sust_004',
    category: 'waste',
    metric: 'Resíduos Gerados',
    value: 45,
    unit: 'kg',
    baseline: 60,
    target: 40,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'down',
    impact: 'positive',
  },
  {
    id: 'sust_005',
    category: 'digital',
    metric: 'Armazenamento Digital',
    value: 2.8,
    unit: 'TB',
    baseline: 3.5,
    target: 2.5,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'down',
    impact: 'positive',
  },
];

// Mock database for inclusivity metrics
const mockInclusivityMetrics: InclusivityMetrics[] = [
  {
    id: 'incl_001',
    category: 'accessibility',
    metric: 'Acessibilidade Web',
    value: 85,
    unit: '%',
    baseline: 70,
    target: 95,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'up',
    impact: 'positive',
    demographics: {
      age: [
        { range: '18-25', count: 1200, percentage: 35 },
        { range: '26-35', count: 1500, percentage: 44 },
        { range: '36-45', count: 600, percentage: 18 },
        { range: '46+', count: 100, percentage: 3 },
      ],
      gender: [
        { identity: 'Feminino', count: 1800, percentage: 53 },
        { identity: 'Masculino', count: 1400, percentage: 41 },
        { identity: 'Não-binário', count: 150, percentage: 4 },
        { identity: 'Prefiro não informar', count: 50, percentage: 2 },
      ],
      ethnicity: [
        { ethnicity: 'Branco', count: 1500, percentage: 44 },
        { ethnicity: 'Pardo', count: 1200, percentage: 35 },
        { ethnicity: 'Preto', count: 500, percentage: 15 },
        { ethnicity: 'Indígena', count: 100, percentage: 3 },
        { ethnicity: 'Amarelo', count: 100, percentage: 3 },
      ],
      location: [
        { region: 'Sudeste', count: 2000, percentage: 59 },
        { region: 'Nordeste', count: 800, percentage: 24 },
        { region: 'Sul', count: 300, percentage: 9 },
        { region: 'Norte', count: 200, percentage: 6 },
        { region: 'Centro-Oeste', count: 100, percentage: 2 },
      ],
      socioeconomic: [
        { level: 'Classe A', count: 200, percentage: 6 },
        { level: 'Classe B', count: 800, percentage: 24 },
        { level: 'Classe C', count: 1800, percentage: 53 },
        { level: 'Classe D', count: 500, percentage: 15 },
        { level: 'Classe E', count: 100, percentage: 2 },
      ],
      disability: [
        { type: 'Visual', count: 150, percentage: 4 },
        { type: 'Auditiva', count: 100, percentage: 3 },
        { type: 'Motora', count: 80, percentage: 2 },
        { type: 'Cognitiva', count: 120, percentage: 4 },
        { type: 'Sem deficiência', count: 2950, percentage: 87 },
      ],
      education: [
        { level: 'Ensino Fundamental', count: 200, percentage: 6 },
        { level: 'Ensino Médio', count: 1200, percentage: 35 },
        { level: 'Ensino Superior', count: 1500, percentage: 44 },
        { level: 'Pós-graduação', count: 500, percentage: 15 },
      ],
    },
  },
  {
    id: 'incl_002',
    category: 'diversity',
    metric: 'Diversidade de Gênero',
    value: 53,
    unit: '%',
    baseline: 45,
    target: 60,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'up',
    impact: 'positive',
    demographics: {
      age: [],
      gender: [],
      ethnicity: [],
      location: [],
      socioeconomic: [],
      disability: [],
      education: [],
    },
  },
  {
    id: 'incl_003',
    category: 'equity',
    metric: 'Equidade de Acesso',
    value: 78,
    unit: '%',
    baseline: 65,
    target: 85,
    period: 'monthly',
    timestamp: '2023-12-15T00:00:00Z',
    trend: 'up',
    impact: 'positive',
    demographics: {
      age: [],
      gender: [],
      ethnicity: [],
      location: [],
      socioeconomic: [],
      disability: [],
      education: [],
    },
  },
];

// Mock database for environmental impact
const mockEnvironmentalImpact: EnvironmentalImpact[] = [
  {
    id: 'env_001',
    activity: 'Servidores de Computação',
    impact: 'carbon_footprint',
    value: 1.2,
    unit: 'toneladas CO2',
    reduction: 25,
    timestamp: '2023-12-15T00:00:00Z',
    description: 'Redução de 25% nas emissões de CO2 através de servidores mais eficientes',
  },
  {
    id: 'env_002',
    activity: 'Armazenamento de Dados',
    impact: 'energy_consumption',
    value: 800,
    unit: 'kWh',
    reduction: 30,
    timestamp: '2023-12-15T00:00:00Z',
    description: 'Redução de 30% no consumo de energia através de compressão de dados',
  },
  {
    id: 'env_003',
    activity: 'Transporte de Funcionários',
    impact: 'carbon_footprint',
    value: 0.8,
    unit: 'toneladas CO2',
    reduction: 40,
    timestamp: '2023-12-15T00:00:00Z',
    description: 'Redução de 40% nas emissões através do trabalho remoto',
  },
];

// Mock database for accessibility scores
const mockAccessibilityScores: AccessibilityScore[] = [
  {
    id: 'acc_001',
    category: 'visual',
    score: 85,
    maxScore: 100,
    percentage: 85,
    improvements: [
      {
        id: 'imp_001',
        description: 'Implementar contraste de cores melhorado',
        impact: 'high',
        cost: 'low',
        effort: 'low',
        status: 'completed',
      },
      {
        id: 'imp_002',
        description: 'Adicionar suporte a leitores de tela',
        impact: 'high',
        cost: 'medium',
        effort: 'medium',
        status: 'in_progress',
      },
    ],
    timestamp: '2023-12-15T00:00:00Z',
  },
  {
    id: 'acc_002',
    category: 'auditory',
    score: 90,
    maxScore: 100,
    percentage: 90,
    improvements: [
      {
        id: 'imp_003',
        description: 'Adicionar legendas em vídeos',
        impact: 'high',
        cost: 'low',
        effort: 'low',
        status: 'completed',
      },
      {
        id: 'imp_004',
        description: 'Implementar transcrições de áudio',
        impact: 'medium',
        cost: 'medium',
        effort: 'medium',
        status: 'planned',
      },
    ],
    timestamp: '2023-12-15T00:00:00Z',
  },
  {
    id: 'acc_003',
    category: 'motor',
    score: 75,
    maxScore: 100,
    percentage: 75,
    improvements: [
      {
        id: 'imp_005',
        description: 'Melhorar navegação por teclado',
        impact: 'high',
        cost: 'low',
        effort: 'low',
        status: 'completed',
      },
      {
        id: 'imp_006',
        description: 'Implementar comandos de voz',
        impact: 'high',
        cost: 'high',
        effort: 'high',
        status: 'planned',
      },
    ],
    timestamp: '2023-12-15T00:00:00Z',
  },
];

// Mock database for diversity reports
const mockDiversityReports: DiversityReport[] = [
  {
    id: 'div_001',
    title: 'Relatório de Diversidade 2023',
    period: '2023',
    metrics: [
      {
        category: 'Gênero',
        current: 53,
        target: 60,
        gap: 7,
        trend: 'improving',
      },
      {
        category: 'Etnia',
        current: 35,
        target: 45,
        gap: 10,
        trend: 'improving',
      },
      {
        category: 'Faixa Etária',
        current: 65,
        target: 70,
        gap: 5,
        trend: 'stable',
      },
    ],
    recommendations: [
      {
        id: 'rec_001',
        title: 'Programa de Mentoria',
        description: 'Implementar programa de mentoria para grupos sub-representados',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        timeline: '6 meses',
      },
      {
        id: 'rec_002',
        title: 'Recrutamento Inclusivo',
        description: 'Desenvolver estratégias de recrutamento mais inclusivas',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        timeline: '3 meses',
      },
    ],
    timestamp: '2023-12-15T00:00:00Z',
  },
];

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
    ],
    reports: [
      {
        id: 'rep_001',
        title: 'Relatório de Sustentabilidade Q4 2023',
        type: 'sustainability',
        period: 'Q4 2023',
        data: {},
        insights: [
          'Redução de 25% nas emissões de CO2',
          'Melhoria de 15% na eficiência energética',
        ],
        recommendations: [
          'Implementar painéis solares',
          'Otimizar uso de servidores',
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
        id: 'met_004',
        name: 'Sustentabilidade',
        value: 72,
        unit: '%',
        target: 80,
        status: 'behind',
        trend: 'up',
      },
      {
        id: 'met_005',
        name: 'Inclusividade',
        value: 88,
        unit: '%',
        target: 85,
        status: 'ahead',
        trend: 'up',
      },
      {
        id: 'met_006',
        name: 'Performance',
        value: 85,
        unit: '%',
        target: 90,
        status: 'behind',
        trend: 'down',
      },
    ],
    reports: [
      {
        id: 'rep_002',
        title: 'Relatório de Inclusividade Q4 2023',
        type: 'inclusivity',
        period: 'Q4 2023',
        data: {},
        insights: [
          'Aumento de 20% na diversidade de gênero',
          'Melhoria de 30% na acessibilidade',
        ],
        recommendations: [
          'Expandir programas de inclusão',
          'Melhorar acessibilidade digital',
        ],
        generatedAt: '2023-12-15T00:00:00Z',
      },
    ],
    lastUpdated: '2023-12-15T00:00:00Z',
  },
];

// Get sustainability metrics
export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const period = req.nextUrl.searchParams.get('period');

    let filteredMetrics = mockSustainabilityMetrics;

    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    if (period) {
      filteredMetrics = filteredMetrics.filter(metric => metric.period === period);
    }

    return NextResponse.json({ metrics: filteredMetrics }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sustainability metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sustainability metrics' },
      { status: 500 }
    );
  }
}

// Create or update sustainability metrics
export async function POST(req: NextRequest) {
  try {
    const {
      category,
      metric,
      value,
      unit,
      baseline,
      target,
      period,
      trend,
      impact,
    } = await req.json();

    if (!category || !metric || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'Category, metric, value, and unit are required' },
        { status: 400 }
      );
    }

    // Generate metric ID
    const metricId = `sust_${Date.now()}`;

    // Create new metric
    const newMetric: SustainabilityMetrics = {
      id: metricId,
      category,
      metric,
      value,
      unit,
      baseline: baseline || value,
      target: target || value * 0.8,
      period: period || 'monthly',
      timestamp: new Date().toISOString(),
      trend: trend || 'stable',
      impact: impact || 'neutral',
    };

    // Add to mock database
    mockSustainabilityMetrics.push(newMetric);

    return NextResponse.json({ metric: newMetric }, { status: 201 });
  } catch (error) {
    console.error('Error creating sustainability metric:', error);
    return NextResponse.json(
      { error: 'Failed to create sustainability metric' },
      { status: 500 }
    );
  }
}

// Update sustainability metrics
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const metricIndex = mockSustainabilityMetrics.findIndex(m => m.id === id);
    if (metricIndex === -1) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Update metric
    mockSustainabilityMetrics[metricIndex] = {
      ...mockSustainabilityMetrics[metricIndex],
      ...updates,
    };

    return NextResponse.json({ metric: mockSustainabilityMetrics[metricIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating sustainability metric:', error);
    return NextResponse.json(
      { error: 'Failed to update sustainability metric' },
      { status: 500 }
    );
  }
}

// Delete sustainability metrics
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const metricIndex = mockSustainabilityMetrics.findIndex(m => m.id === id);
    if (metricIndex === -1) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Remove metric
    mockSustainabilityMetrics.splice(metricIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting sustainability metric:', error);
    return NextResponse.json(
      { error: 'Failed to delete sustainability metric' },
      { status: 500 }
    );
  }
}
