import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Buscar estatísticas do ENEM
    const [
      totalItems,
      totalSessions,
      totalUsers,
      itemsByYear,
      itemsByArea,
      recentSessions
    ] = await Promise.all([
      // Total de questões
      prisma.enem_item.count(),
      
      // Total de sessões
      prisma.enem_session.count(),
      
      // Total de usuários únicos
      prisma.enem_session.groupBy({
        by: ['user_id'],
        _count: { user_id: true }
      }).then(result => result.length),
      
      // Questões por ano
      prisma.enem_item.groupBy({
        by: ['year'],
        _count: { year: true },
        orderBy: { year: 'desc' }
      }),
      
      // Questões por área
      prisma.enem_item.groupBy({
        by: ['area'],
        _count: { area: true }
      }),
      
      // Sessões recentes (últimas 24h)
      prisma.enem_session.count({
        where: {
          start_time: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Converter dados para formato esperado
    const itemsByYearObj: { [year: string]: number } = {};
    itemsByYear.forEach(item => {
      itemsByYearObj[item.year.toString()] = item._count.year;
    });

    const itemsByAreaObj: { [area: string]: number } = {};
    itemsByArea.forEach(item => {
      itemsByAreaObj[item.area] = item._count.area;
    });

    const stats = {
      totalItems,
      totalSessions,
      totalUsers,
      itemsByYear: itemsByYearObj,
      itemsByArea: itemsByAreaObj,
      recentSessions
    };

    return NextResponse.json(stats);
    
  } catch (error: any) {
    console.error('Error fetching ENEM stats:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
