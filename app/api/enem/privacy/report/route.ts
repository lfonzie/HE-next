import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemPrivacyService } from '@/lib/enem-privacy';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privacyService = new EnemPrivacyService();
    const report = await privacyService.generatePrivacyReport(session.user.id);
    await privacyService.cleanup();

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating privacy report:', error);
    return NextResponse.json({ 
      error: 'Failed to generate privacy report',
      success: false 
    }, { status: 500 });
  }
}
