// app/api/unsplash/photo/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unsplashService } from '@/lib/unsplash';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    const photo = await unsplashService.getPhoto(id);

    return NextResponse.json({
      success: true,
      data: photo
    });

  } catch (error: any) {
    console.error('Unsplash photo API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get photo',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
