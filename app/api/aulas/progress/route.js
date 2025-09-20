// app/api/aulas/progress/route.js
// Endpoint para atualizar progresso das etapas da aula

import { NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function POST(request) {
  try {
    const { lessonId, etapa, completed, points = 0 } = await request.json();

    if (!lessonId || !etapa) {
      return NextResponse.json({ 
        error: 'ID da aula e número da etapa são obrigatórios' 
      }, { status: 400 });
    }

    // Atualizar progresso no Neo4j se configurado
    if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
      try {
        const { updateLessonProgress } = await import('@/lib/neo4j');
        await updateLessonProgress(lessonId, etapa, completed, points);
        
        return NextResponse.json({
          success: true,
          message: 'Progresso atualizado com sucesso',
          data: {
            lessonId,
            etapa,
            completed,
            points
          }
        });
      } catch (neo4jError) {
        console.error('Erro ao atualizar progresso no Neo4j:', neo4jError);
        return NextResponse.json({ 
          error: 'Erro ao atualizar progresso',
          details: neo4jError.message 
        }, { status: 500 });
      }
    } else {
      // Se Neo4j não estiver configurado, retornar sucesso simulado
      return NextResponse.json({
        success: true,
        message: 'Progresso registrado (Neo4j não configurado)',
        data: {
          lessonId,
          etapa,
          completed,
          points
        }
      });
    }

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ 
        error: 'ID da aula é obrigatório' 
      }, { status: 400 });
    }

    // Buscar progresso no Neo4j se configurado
    if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
      try {
        const { getLessonFromNeo4j } = await import('@/lib/neo4j');
        const lesson = await getLessonFromNeo4j(lessonId);
        
        if (!lesson) {
          return NextResponse.json({ 
            error: 'Aula não encontrada' 
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          lesson
        });
      } catch (neo4jError) {
        console.error('Erro ao buscar progresso no Neo4j:', neo4jError);
        return NextResponse.json({ 
          error: 'Erro ao buscar progresso',
          details: neo4jError.message 
        }, { status: 500 });
      }
    } else {
      // Se Neo4j não estiver configurado, retornar estrutura vazia
      return NextResponse.json({
        success: true,
        lesson: {
          id: lessonId,
          progress: '0/14 etapas, 0%',
          stages: []
        }
      });
    }

  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
