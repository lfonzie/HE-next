import { NextRequest, NextResponse } from 'next/server'
import { callGrok } from '@/lib/providers/grok'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({
        error: 'Grok API key not configured'
      }, { status: 500 })
    }

    const { message, documentId, documents } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 })
    }

    console.log(`📄 [CHAT-DOCS] Processing query with Grok 4 Fast: ${message.substring(0, 100)}...`)
    console.log(`📄 [CHAT-DOCS] Document ID: ${documentId}`)
    console.log(`📄 [CHAT-DOCS] Documents count: ${documents.length}`)

    // Preparar contexto dos documentos
    const documentContext = documents.map(doc => 
      `Documento: ${doc.name}\nTipo: ${doc.type}\nConteúdo:\n${doc.content}`
    ).join('\n\n---\n\n')

    const prompt = `Analise o(s) documento(s) fornecido(s) e responda à pergunta do usuário de forma precisa e útil.

DOCUMENTOS:
${documentContext}

PERGUNTA DO USUÁRIO:
${message}

INSTRUÇÕES:
1. Baseie sua resposta APENAS no conteúdo dos documentos fornecidos
2. Se a informação não estiver nos documentos, diga claramente que não foi encontrada
3. Cite trechos específicos dos documentos quando relevante
4. Seja preciso e objetivo
5. Se houver múltiplos documentos, diferencie entre eles
6. Responda em português brasileiro

RESPOSTA:`

    try {
      const result = await callGrok(
        'grok-4-fast-reasoning',
        [],
        prompt,
        'Você é um assistente especializado em análise de documentos. Sempre forneça respostas precisas e úteis baseadas no conteúdo dos documentos fornecidos.'
      )

      const text = result.text

      console.log(`✅ [CHAT-DOCS] Response generated successfully with Grok 4 Fast`)

      return NextResponse.json({
        success: true,
        response: text,
        documentId,
        timestamp: new Date().toISOString()
      })

    } catch (error: any) {
      console.error('❌ [CHAT-DOCS] Error generating response:', error)
      return NextResponse.json({
        error: 'Failed to generate response',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ [CHAT-DOCS] Processing error:', error)
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 })
  }
}
