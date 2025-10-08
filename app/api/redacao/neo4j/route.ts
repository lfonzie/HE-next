import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserRedacoesFromNeo4j, getRedacaoFromNeo4j } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const redacaoId = searchParams.get('id')

    if (redacaoId) {
      // Buscar redação específica
      const redacao = await getRedacaoFromNeo4j(redacaoId)
      
      if (!redacao) {
        return NextResponse.json({ 
          error: 'Redação não encontrada' 
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        redacao
      })
    } else {
      // Listar todas as redações do usuário
      const redacoes = await getUserRedacoesFromNeo4j(session.user.id)
      
      return NextResponse.json({
        success: true,
        redacoes
      })
    }

  } catch (error) {
    console.error('Erro ao buscar redações no Neo4j:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
