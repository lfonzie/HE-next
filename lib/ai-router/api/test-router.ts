// lib/ai-router/api/test-router.ts
// API de teste para o sistema de roteamento multi-fornecedor

import { NextRequest, NextResponse } from 'next/server';
import { aiRouter, providerRegistry } from '../index';

export async function POST(request: NextRequest) {
  try {
    const { text, context, userProfile, mode, canaryPercentage } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Configurar modo se especificado
    if (mode) {
      aiRouter.setMode(mode);
    }

    if (canaryPercentage !== undefined) {
      aiRouter.setCanaryPercentage(canaryPercentage);
    }

    // Executar roteamento
    const result = await aiRouter.route(text, context, userProfile);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test router error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          status: {
            enabled: true,
            mode: aiRouter.getConfig().mode,
            canaryPercentage: aiRouter.getConfig().canaryPercentage,
            providers: providerRegistry.getEnabledProviders().map((p: any) => ({
              id: p.id,
              name: p.name,
              enabled: p.enabled,
              health: providerRegistry.getProviderHealth(p.id)
            }))
          }
        });

      case 'metrics':
        return NextResponse.json({
          success: true,
          metrics: aiRouter.getMetrics().slice(-10), // Últimas 10 métricas
          providerHealth: Object.fromEntries(aiRouter.getProviderHealth()),
          learningStats: Object.fromEntries(aiRouter.getLearningStats())
        });

      case 'config':
        return NextResponse.json({
          success: true,
          config: aiRouter.getConfig()
        });

      default:
        return NextResponse.json({
          success: true,
          availableActions: ['status', 'metrics', 'config'],
          usage: {
            'GET /api/test-router?action=status': 'Get router status',
            'GET /api/test-router?action=metrics': 'Get router metrics',
            'GET /api/test-router?action=config': 'Get router configuration',
            'POST /api/test-router': 'Test router with text input'
          }
        });
    }

  } catch (error) {
    console.error('Test router GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
