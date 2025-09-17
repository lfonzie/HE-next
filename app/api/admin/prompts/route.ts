import { NextResponse } from 'next/server';
import { getPromptsData } from '@/lib/admin-utils';

export async function GET() {
  try {
    const prompts = await getPromptsData();
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
