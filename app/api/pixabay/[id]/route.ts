// app/api/pixabay/[id]/route.ts - Endpoint para buscar imagem específica por ID
import { NextRequest, NextResponse } from 'next/server';
import { pixabayService } from '@/lib/pixabay';

/**
 * GET /api/pixabay/[id] - Busca imagem específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id);
    
    if (isNaN(imageId)) {
      return NextResponse.json({
        success: false,
        error: 'ID da imagem deve ser um número válido'
      }, { status: 400 });
    }

    console.log(`🖼️ [PIXABAY] Buscando imagem ID: ${imageId}`);

    const image = await pixabayService.getImage(imageId);

    if (!image) {
      return NextResponse.json({
        success: false,
        error: 'Imagem não encontrada',
        imageId
      }, { status: 404 });
    }

    const formattedImage = pixabayService.formatImageResult(image);

    return NextResponse.json({
      success: true,
      data: formattedImage,
      metadata: {
        imageId,
        source: 'pixabay',
        educational: true,
        retrievedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [PIXABAY] Erro ao buscar imagem por ID:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
