import { NextResponse } from 'next/server';
import { DataRetentionManager } from '@/lib/retention/data-retention';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const retentionManager = new DataRetentionManager();

export async function POST() {
  try {
    console.log('🗑️ Starting data retention cleanup...');
    
    const result = await retentionManager.executeRetention();
    
    return NextResponse.json({
      success: true,
      message: 'Data retention cleanup completed',
      ...result
    });

  } catch (error) {
    console.error('Error during data retention cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await retentionManager.getRetentionStats();
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting retention stats:', error);
    return NextResponse.json(
      { error: 'Failed to get retention stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
