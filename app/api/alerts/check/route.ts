import { NextResponse } from 'next/server';
import { AlertManager } from '@/lib/alerts/alert-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const alertManager = new AlertManager();

export async function POST() {
  try {
    console.log('🔍 Checking alerts...');
    
    const alerts = await alertManager.checkAlerts();
    
    if (alerts.length > 0) {
      console.log(`🚨 Found ${alerts.length} alerts`);
      
      // Enviar alertas
      for (const alert of alerts) {
        await alertManager.sendAlert(alert);
      }
      
      return NextResponse.json({
        success: true,
        alerts: alerts.length,
        message: `Sent ${alerts.length} alerts`
      });
    } else {
      console.log('✅ No alerts triggered');
      return NextResponse.json({
        success: true,
        alerts: 0,
        message: 'No alerts triggered'
      });
    }
    
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const alerts = await alertManager.checkAlerts();
    
    return NextResponse.json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
