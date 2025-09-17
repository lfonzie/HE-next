import { NextResponse } from 'next/server';
import { getUsersData } from '@/lib/admin-utils';

export async function GET() {
  try {
    const users = await getUsersData();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
