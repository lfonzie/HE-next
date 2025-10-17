// api/scenarios/route.ts - API para cenários do laboratório virtual
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LabState, ExperimentPreset } from '../../types/lab';

// Simulação de banco de dados (em produção seria um banco real)
const scenarios: Map<string, LabState> = new Map();
const presets: Map<string, ExperimentPreset> = new Map();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = session.user?.id;
    const type = searchParams.get('type'); // 'scenarios' ou 'presets'

    if (type === 'presets') {
      // Retornar presets públicos
      const publicPresets = Array.from(presets.values());
      return NextResponse.json({
        success: true,
        presets: publicPresets,
        count: publicPresets.length
      });
    } else {
      // Retornar cenários do usuário
      const userScenarios = Array.from(scenarios.entries())
        .filter(([key]) => key.startsWith(`${userId}_`))
        .map(([key, scenario]) => ({
          id: key,
          ...scenario
        }));

      return NextResponse.json({
        success: true,
        scenarios: userScenarios,
        count: userScenarios.length
      });
    }

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error fetching scenarios:', error);
    return NextResponse.json({
      error: 'Failed to fetch scenarios',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user?.id;
    const body = await request.json();
    const { type, data } = body;

    if (type === 'scenario') {
      // Salvar cenário do usuário
      const scenarioId = `${userId}_${Date.now()}`;
      const scenario: LabState = {
        ...data,
        id: scenarioId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      scenarios.set(scenarioId, scenario);

      return NextResponse.json({
        success: true,
        scenarioId,
        message: 'Scenario saved successfully'
      });
    } else if (type === 'preset') {
      // Salvar preset (apenas para admins)
      if (session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const presetId = `preset_${Date.now()}`;
      const preset: ExperimentPreset = {
        ...data,
        id: presetId,
        createdBy: userId,
        createdAt: new Date().toISOString()
      };

      presets.set(presetId, preset);

      return NextResponse.json({
        success: true,
        presetId,
        message: 'Preset saved successfully'
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error saving scenario:', error);
    return NextResponse.json({
      error: 'Failed to save scenario',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user?.id;
    const body = await request.json();
    const { scenarioId, data } = body;

    // Verificar se o cenário pertence ao usuário
    const scenario = scenarios.get(scenarioId);
    if (!scenario || !scenarioId.startsWith(`${userId}_`)) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    // Atualizar cenário
    const updatedScenario: LabState = {
      ...scenario,
      ...data,
      updatedAt: new Date().toISOString()
    };

    scenarios.set(scenarioId, updatedScenario);

    return NextResponse.json({
      success: true,
      message: 'Scenario updated successfully'
    });

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error updating scenario:', error);
    return NextResponse.json({
      error: 'Failed to update scenario',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user?.id;
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('id');

    if (!scenarioId) {
      return NextResponse.json({ error: 'Scenario ID required' }, { status: 400 });
    }

    // Verificar se o cenário pertence ao usuário
    const scenario = scenarios.get(scenarioId);
    if (!scenario || !scenarioId.startsWith(`${userId}_`)) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    // Deletar cenário
    scenarios.delete(scenarioId);

    return NextResponse.json({
      success: true,
      message: 'Scenario deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error deleting scenario:', error);
    return NextResponse.json({
      error: 'Failed to delete scenario',
      details: error.message
    }, { status: 500 });
  }
}
