import { NextResponse } from 'next/server';
import { getConversationsData } from '@/lib/admin-utils';

export async function GET() {
  try {
    const conversations = await getConversationsData();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
