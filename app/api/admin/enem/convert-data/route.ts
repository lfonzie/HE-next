import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemDataImporter } from '@/lib/enem-data-importer';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissões de admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Adicionar verificação de permissões de admin
    // if (!session.user.role?.includes('admin')) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const importer = new EnemDataImporter();
    
    try {
      // Converter dados existentes
      await importer.convertExistingData();
      
      return NextResponse.json({
        success: true,
        message: 'Dados convertidos com sucesso!',
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Error converting ENEM data:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Falha na conversão dos dados',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    } finally {
      await importer.cleanup();
    }
    
  } catch (error: any) {
    console.error('Error in convert-data endpoint:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
