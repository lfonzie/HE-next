import { NextResponse } from 'next/server';
import { getSystemInfo } from '@/lib/admin-utils';

export async function GET() {
  try {
    const systemInfo = await getSystemInfo();
    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json({ error: 'Failed to fetch system info' }, { status: 500 });
  }
}
