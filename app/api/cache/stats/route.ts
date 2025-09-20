// app/api/cache/stats/route.ts - Endpoint para monitorar estatísticas do cache de slides
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { slideGenerationCache } from '@/lib/slide-generation-cache';



export async function GET(request: NextRequest) {
  try {
    const stats = slideGenerationCache.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter estatísticas do cache',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    slideGenerationCache.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Cache limpo com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao limpar cache',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
