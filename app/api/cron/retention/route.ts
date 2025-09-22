import { NextRequest, NextResponse } from 'next/server';
import { DataRetentionManager } from '@/lib/retention/data-retention';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const retentionManager = new DataRetentionManager();

export async function GET(req: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (cron job)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🗑️ Starting scheduled data retention cleanup...');
    
    // Executar limpeza
    const cleanupResult = await retentionManager.executeRetention();
    
    // Arquivar dados antigos (opcional)
    const archiveResult = await retentionManager.archiveOldData();
    
    // Otimizar tabelas
    const optimizeResult = await retentionManager.optimizeTables();
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled data retention completed',
      cleanup: cleanupResult,
      archive: archiveResult,
      optimize: optimizeResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scheduled retention cleanup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Scheduled retention cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
