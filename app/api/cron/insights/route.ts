import { NextRequest, NextResponse } from 'next/server';
import { SQLInsightsEngine } from '@/lib/analytics/sql-insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const insightsEngine = new SQLInsightsEngine();

export async function GET(req: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (cron job)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Starting scheduled insights execution...');
    
    // Executar insights baseado na frequência
    const insights = await insightsEngine.getAllInsights();
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const insightsToExecute = insights.filter(insight => {
      if (!insight.enabled) return false;
      
      switch (insight.frequency) {
        case 'realtime':
          return true; // Executar sempre
        case 'hourly':
          return true; // Executar sempre (pode ser refinado)
        case 'daily':
          return hour === 0; // Executar à meia-noite
        case 'weekly':
          return day === 0 && hour === 0; // Executar domingo à meia-noite
        default:
          return false;
      }
    });

    console.log(`📊 Executing ${insightsToExecute.length} insights...`);

    const results = [];
    for (const insight of insightsToExecute) {
      try {
        const result = await insightsEngine.executeInsight(insight.id);
        results.push(result);
        console.log(`✅ Executed insight: ${insight.name}`);
      } catch (error) {
        console.error(`❌ Error executing insight ${insight.name}:`, error);
        results.push({
          insight,
          data: [],
          executedAt: new Date(),
          executionTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled insights execution completed',
      executed: results.length,
      results: results.map(r => ({
        insight: r.insight.name,
        success: !r.error,
        executionTime: r.executionTime,
        dataCount: r.data.length
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scheduled insights execution error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Scheduled insights execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
