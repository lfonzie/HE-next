import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


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
      // Importar dados convertidos
      const result = await importer.importAllData();
      
      return NextResponse.json({
        success: result.errors.length === 0,
        imported_items: result.imported_items,
        skipped_items: result.skipped_items,
        errors: result.errors,
        validation_report: result.validation_report,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Error importing ENEM data:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Falha na importação dos dados',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    } finally {
      await importer.cleanup();
    }
    
  } catch (error: any) {
    console.error('Error in import-data endpoint:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
