import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemPrivacyService } from '@/lib/enem-privacy';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const privacyService = new EnemPrivacyService();

    await privacyService.updateUserPrivacySettings(session.user.id, body);
    await privacyService.cleanup();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ 
      error: 'Failed to update privacy settings',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privacyService = new EnemPrivacyService();
    const settings = await privacyService.getUserPrivacySettings(session.user.id);
    await privacyService.cleanup();

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch privacy settings',
      success: false 
    }, { status: 500 });
  }
}
