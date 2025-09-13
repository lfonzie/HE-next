import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai, selectModel, getModelConfig, MODELS } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando NextAuth (desabilitado temporariamente para desenvolvimento)
    const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { message, module, conversationId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // System prompts baseados no módulo
    const systemPrompts = {
      professor: `Você é um assistente educacional especializado em pedagogia. Forneça explicações claras, didáticas e adequadas para estudantes brasileiros. Sempre use exemplos práticos e linguagem acessível.

IMPORTANTE: Para expressões matemáticas, sempre use símbolos Unicode em vez de LaTeX. Por exemplo:
- Use √ para raiz quadrada (não \\sqrt)
- Use ⁄ para frações (não \\frac)
- Use ± para mais/menos (não \\pm)
- Use × para multiplicação (não \\times)
- Use ÷ para divisão (não \\div)
- Use ≤ para menor ou igual (não \\leq)
- Use ≥ para maior ou igual (não \\geq)
- Use π para pi (não \\pi)
- Use α, β, γ, δ, etc. para letras gregas (não \\alpha, \\beta, etc.)`,
      enem: `Você é um especialista em preparação para o ENEM. Ajude com questões, estratégias de estudo e explicações sobre o exame. Sempre mencione competências e habilidades da BNCC quando relevante.

IMPORTANTE: Para expressões matemáticas, sempre use símbolos Unicode em vez de LaTeX. Por exemplo:
- Use √ para raiz quadrada (não \\sqrt)
- Use ⁄ para frações (não \\frac)
- Use ± para mais/menos (não \\pm)
- Use × para multiplicação (não \\times)
- Use ÷ para divisão (não \\div)
- Use ≤ para menor ou igual (não \\leq)
- Use ≥ para maior ou igual (não \\geq)
- Use π para pi (não \\pi)
- Use α, β, γ, δ, etc. para letras gregas (não \\alpha, \\beta, etc.)`,
      admin: `Você é um assistente administrativo para escolas. Ajude com gestão escolar, processos administrativos e organização educacional.`,
    }

    const systemPrompt = systemPrompts[module as keyof typeof systemPrompts] || systemPrompts.professor

    // Preparar mensagens para OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]

    // Selecionar modelo baseado na complexidade da mensagem
    const selectedModel = selectModel(message, module)
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Using model: ${selectedModel} for module: ${module}`)
    
    // Configurar streaming
    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as any,
      stream: modelConfig.stream,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    // Criar ReadableStream para streaming
    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        let totalTokens = 0
        
        try {
          for await (const chunk of stream as any) {
            const content = chunk.choices[0]?.delta?.content || ''
            
            if (content) {
              // Enviar chunk de conteúdo
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
            
            // Capturar uso de tokens
            if (chunk.usage) {
              totalTokens = chunk.usage.total_tokens || 0
            }
          }
          
          // Enviar metadados finais
          const metadata = JSON.stringify({ 
            metadata: { 
              tokens: totalTokens,
              model: selectedModel,
              tier: selectedModel === MODELS.COMPLEX ? 'IA_SUPER' : 'IA'
            }
          })
          controller.enqueue(encoder.encode(`data: ${metadata}\n\n`))
          
          // Sinalizar fim do stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = JSON.stringify({ error: 'Erro durante o streaming' })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Preparar erro amigável
    let friendlyError = 'Erro interno do servidor. Tente novamente.'
    
    if (error.message?.includes('rate limit')) {
      friendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.'
    } else if (error.message?.includes('quota')) {
      friendlyError = 'Cota de tokens excedida. Verifique seu plano.'
    } else if (error.message?.includes('network')) {
      friendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.'
    }

    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
