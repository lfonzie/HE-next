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

    const { message, module, conversationId, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Automatic model selection using classifier
    let selectedModel = 'gpt-4o-mini'; // Default fallback
    
    try {
      console.log('🔍 Classifying message for model selection...');
      const classifyResponse = await fetch(`${request.nextUrl.origin}/api/router/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (classifyResponse.ok) {
        const { classification } = await classifyResponse.json();
        selectedModel = classification === 'complexa' ? 'gpt-5-chat-latest' : 'gpt-4o-mini';
        console.log(`✅ Model selected: ${selectedModel} (classification: ${classification})`);
      } else {
        console.warn('⚠️ Classifier failed, using default model');
      }
    } catch (classifyError) {
      console.error('❌ Classification error:', classifyError);
      // Continue with default model
    }

    // System prompts baseados no módulo classificado
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
      
      ti: `Você é um especialista em suporte técnico para escolas. Ajude com problemas de tecnologia, equipamentos, sistemas e conectividade. Seja prático e ofereça soluções passo a passo.`,
      
      secretaria: `Você é um assistente da secretaria escolar. Ajude com documentos de alunos, matrículas, declarações e procedimentos administrativos acadêmicos.`,
      
      financeiro: `Você é um assistente financeiro escolar. Ajude com questões de pagamentos, mensalidades, boletos e questões financeiras de alunos e famílias.`,
      
      rh: `Você é um assistente de recursos humanos escolar. Ajude funcionários com questões trabalhistas, benefícios, férias, treinamentos e políticas internas.`,
      
      coordenacao: `Você é um assistente de coordenação pedagógica. Ajude com gestão pedagógica, calendário escolar e coordenação acadêmica.`,
      
      bem_estar: `Você é um assistente de bem-estar escolar. Ofereça apoio emocional, ajude com ansiedade, conflitos e questões de saúde mental da comunidade escolar.`,
      
      social_media: `Você é um especialista em marketing digital escolar. Ajude a criar posts, destacar conquistas, celebrar resultados e desenvolver conteúdo para redes sociais.`,
      
      atendimento: `Você é um assistente de atendimento geral escolar. Ajude com dúvidas gerais, informações e primeiro contato. Seja cordial e direcione para o setor correto quando necessário.`,
    }

    const systemPrompt = systemPrompts[module as keyof typeof systemPrompts] || systemPrompts.atendimento

    // Preparar mensagens para OpenAI com histórico
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Include last 10 messages for context
      { role: 'user', content: message }
    ]

    // Get model configuration
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
        let isClosed = false
        
        const safeEnqueue = (data: string) => {
          if (!isClosed) {
            try {
              controller.enqueue(encoder.encode(data))
            } catch (error) {
              console.warn('Controller already closed, skipping enqueue')
              isClosed = true
            }
          }
        }
        
        const safeClose = () => {
          if (!isClosed) {
            try {
              controller.close()
              isClosed = true
            } catch (error) {
              console.warn('Controller already closed')
            }
          }
        }
        
        try {
          for await (const chunk of stream as any) {
            const content = chunk.choices[0]?.delta?.content || ''
            
            if (content) {
              // Enviar chunk de conteúdo
              const data = JSON.stringify({ content })
              safeEnqueue(`data: ${data}\n\n`)
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
          safeEnqueue(`data: ${metadata}\n\n`)
          
          // Sinalizar fim do stream
          safeEnqueue('data: [DONE]\n\n')
          safeClose()
          
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = JSON.stringify({ error: 'Erro durante o streaming' })
          safeEnqueue(`data: ${errorData}\n\n`)
          safeClose()
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
