import { NextRequest, NextResponse } from 'next/server';
import { InclusivityMetrics } from '@/hooks/useSustainabilityAnalytics';

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
  {
    id: 'incl_004',
    category: 'representation',
    metric: 'Representação Regional',
    value: 65,
    unit: '%',
    baseline: 55,
    target: 75,
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
    id: 'incl_005',
    category: 'participation',
    metric: 'Participação Ativa',
    value: 82,
    unit: '%',
    baseline: 70,
    target: 90,
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

// Get inclusivity metrics
export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const period = req.nextUrl.searchParams.get('period');

    let filteredMetrics = mockInclusivityMetrics;

    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    if (period) {
      filteredMetrics = filteredMetrics.filter(metric => metric.period === period);
    }

    return NextResponse.json({ metrics: filteredMetrics }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inclusivity metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inclusivity metrics' },
      { status: 500 }
    );
  }
}

// Create or update inclusivity metrics
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
      demographics,
    } = await req.json();

    if (!category || !metric || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'Category, metric, value, and unit are required' },
        { status: 400 }
      );
    }

    // Generate metric ID
    const metricId = `incl_${Date.now()}`;

    // Create new metric
    const newMetric: InclusivityMetrics = {
      id: metricId,
      category,
      metric,
      value,
      unit,
      baseline: baseline || value,
      target: target || value * 1.2,
      period: period || 'monthly',
      timestamp: new Date().toISOString(),
      trend: trend || 'stable',
      impact: impact || 'neutral',
      demographics: demographics || {
        age: [],
        gender: [],
        ethnicity: [],
        location: [],
        socioeconomic: [],
        disability: [],
        education: [],
      },
    };

    // Add to mock database
    mockInclusivityMetrics.push(newMetric);

    return NextResponse.json({ metric: newMetric }, { status: 201 });
  } catch (error) {
    console.error('Error creating inclusivity metric:', error);
    return NextResponse.json(
      { error: 'Failed to create inclusivity metric' },
      { status: 500 }
    );
  }
}

// Update inclusivity metrics
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const metricIndex = mockInclusivityMetrics.findIndex(m => m.id === id);
    if (metricIndex === -1) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Update metric
    mockInclusivityMetrics[metricIndex] = {
      ...mockInclusivityMetrics[metricIndex],
      ...updates,
    };

    return NextResponse.json({ metric: mockInclusivityMetrics[metricIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating inclusivity metric:', error);
    return NextResponse.json(
      { error: 'Failed to update inclusivity metric' },
      { status: 500 }
    );
  }
}

// Delete inclusivity metrics
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const metricIndex = mockInclusivityMetrics.findIndex(m => m.id === id);
    if (metricIndex === -1) {
      return NextResponse.json(
        { error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Remove metric
    mockInclusivityMetrics.splice(metricIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting inclusivity metric:', error);
    return NextResponse.json(
      { error: 'Failed to delete inclusivity metric' },
      { status: 500 }
    );
  }
}
