import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRedacaoEvaluationFromNeo4j } from '@/lib/neo4j'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evaluationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se Neo4j está configurado
    if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
      return NextResponse.json({ 
        error: 'Neo4j não configurado' 
      }, { status: 503 })
    }

    const { evaluationId } = await params

    // Buscar avaliação específica
    const evaluation = await getRedacaoEvaluationFromNeo4j(evaluationId)
    
    if (!evaluation) {
      return NextResponse.json({ 
        error: 'Avaliação não encontrada' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error) {
    console.error('Erro ao buscar avaliação no Neo4j:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
