// app/api/gemini/beta-control/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { geminiLessonImageService } from '@/lib/gemini-lesson-image-service';
import { DEFAULT_GEMINI_CONFIG, createBetaSystemStatus } from '@/lib/gemini-lesson-json-structure';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

interface BetaControlRequest {
  action: 'enable' | 'disable' | 'status' | 'config';
  config?: {
    enabled?: boolean;
    model?: string;
    imageSlides?: number[];
    maxRetries?: number;
    timeout?: number;
  };
}

interface BetaControlResponse {
  success: boolean;
  action: string;
  betaStatus: {
    enabled: boolean;
    model: string;
    imageSlides: number[];
    maxRetries: number;
    timeout: number;
    lastUpdated: string;
    stats: {
      totalRequests: number;
      successfulGenerations: number;
      failedGenerations: number;
      averageGenerationTime: number;
    };
  };
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BetaControlRequest = await request.json();
    const { action, config } = body;

    console.log(`🎛️ Beta Control Action: ${action}`);

    switch (action) {
      case 'enable':
        return await enableBetaSystem();
      
      case 'disable':
        return await disableBetaSystem();
      
      case 'status':
        return await getBetaStatus();
      
      case 'config':
        return await updateBetaConfig(config);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: enable, disable, status, config'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Erro no controle do sistema beta:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return await getBetaStatus();
}

async function enableBetaSystem(): Promise<NextResponse<BetaControlResponse>> {
  try {
    geminiLessonImageService.setBetaEnabled(true);
    
    const currentConfig = geminiLessonImageService.getConfig();
    const betaStatus = createBetaSystemStatus(DEFAULT_GEMINI_CONFIG);

    console.log('✅ Sistema beta ATIVADO');

    return NextResponse.json({
      success: true,
      action: 'enable',
      betaStatus: {
        ...betaStatus,
        enabled: true,
        lastUpdated: new Date().toISOString()
      },
      message: 'Sistema beta de geração de imagens ativado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao ativar sistema beta:', error);
    return NextResponse.json({
      success: false,
      action: 'enable',
      betaStatus: createBetaSystemStatus(DEFAULT_GEMINI_CONFIG),
      error: error.message
    }, { status: 500 });
  }
}

async function disableBetaSystem(): Promise<NextResponse<BetaControlResponse>> {
  try {
    geminiLessonImageService.setBetaEnabled(false);
    
    const betaStatus = createBetaSystemStatus(DEFAULT_GEMINI_CONFIG);

    console.log('⚠️ Sistema beta DESATIVADO');

    return NextResponse.json({
      success: true,
      action: 'disable',
      betaStatus: {
        ...betaStatus,
        enabled: false,
        lastUpdated: new Date().toISOString()
      },
      message: 'Sistema beta de geração de imagens desativado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao desativar sistema beta:', error);
    return NextResponse.json({
      success: false,
      action: 'disable',
      betaStatus: createBetaSystemStatus(DEFAULT_GEMINI_CONFIG),
      error: error.message
    }, { status: 500 });
  }
}

async function getBetaStatus(): Promise<NextResponse<BetaControlResponse>> {
  try {
    const currentConfig = geminiLessonImageService.getConfig();
    const betaStatus = createBetaSystemStatus(DEFAULT_GEMINI_CONFIG);

    return NextResponse.json({
      success: true,
      action: 'status',
      betaStatus: {
        ...betaStatus,
        enabled: currentConfig.enabled,
        model: currentConfig.model,
        imageSlides: currentConfig.imageSlides,
        maxRetries: currentConfig.maxRetries,
        timeout: currentConfig.timeout,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter status do sistema beta:', error);
    return NextResponse.json({
      success: false,
      action: 'status',
      betaStatus: createBetaSystemStatus(DEFAULT_GEMINI_CONFIG),
      error: error.message
    }, { status: 500 });
  }
}

async function updateBetaConfig(config?: any): Promise<NextResponse<BetaControlResponse>> {
  try {
    if (!config) {
      return NextResponse.json({
        success: false,
        action: 'config',
        betaStatus: createBetaSystemStatus(DEFAULT_GEMINI_CONFIG),
        error: 'Config object is required'
      }, { status: 400 });
    }

    // Atualizar configuração
    geminiLessonImageService.updateConfig(config);
    
    const updatedConfig = geminiLessonImageService.getConfig();
    const betaStatus = createBetaSystemStatus(DEFAULT_GEMINI_CONFIG);

    console.log('⚙️ Configuração do sistema beta atualizada:', config);

    return NextResponse.json({
      success: true,
      action: 'config',
      betaStatus: {
        ...betaStatus,
        enabled: updatedConfig.enabled,
        model: updatedConfig.model,
        imageSlides: updatedConfig.imageSlides,
        maxRetries: updatedConfig.maxRetries,
        timeout: updatedConfig.timeout,
        lastUpdated: new Date().toISOString()
      },
      message: 'Configuração do sistema beta atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao atualizar configuração do sistema beta:', error);
    return NextResponse.json({
      success: false,
      action: 'config',
      betaStatus: createBetaSystemStatus(DEFAULT_GEMINI_CONFIG),
      error: error.message
    }, { status: 500 });
  }
}
