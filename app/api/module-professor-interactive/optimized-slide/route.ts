import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { openai, selectModel, getModelConfig } from '@/lib/openai'


import { lessonCache, slideCache } from '@/lib/cache/lessonCache'



export async function POST(request: NextRequest) {
  try {
    const { query, subject, slideIndex, useCache = true } = await request.json()

    if (!query || !subject || !slideIndex) {
      return NextResponse.json({ 
        error: 'Query, subject e slideIndex são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar cache primeiro
    if (useCache) {
      const cachedSlide = slideCache.get(query, subject, slideIndex)
      if (cachedSlide) {
        console.log(`📋 Cache hit para slide ${slideIndex}`)
        return NextResponse.json({ 
          success: true, 
          slide: cachedSlide,
          fromCache: true,
          cacheStats: slideCache.getStats()
        })
      }
    }

    console.log(`🔄 Gerando slide ${slideIndex} para: ${query}`)

    // System prompt otimizado para geração de slides
    const systemPrompt = `Você é um assistente educacional especializado em criar slides interativos e didáticos.

INSTRUÇÕES ESPECÍFICAS:
1. Crie conteúdo educativo claro e envolvente
2. Use linguagem apropriada para o nível educacional
3. Inclua exemplos práticos e relevantes
4. Estruture o conteúdo de forma lógica e progressiva
5. Adapte o tom para a matéria: ${subject}

FORMATO DE RESPOSTA (JSON):
{
  "type": "explanation" | "question" | "example" | "feedback",
  "content": "Conteúdo principal do slide",
  "card1": {
    "title": "Título do primeiro card",
    "content": "Conteúdo explicativo"
  },
  "card2": {
    "title": "Título do segundo card",
    "content": "Conteúdo adicional ou questão",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctOption": 0,
    "helpMessage": "Dica para ajudar o aluno",
    "correctAnswer": "Explicação da resposta correta"
  }
}

REGRAS IMPORTANTES:
- Sempre retorne JSON válido
- Para slides de questão, inclua 4 opções (A, B, C, D)
- correctOption deve ser o índice (0-3) da opção correta
- Use conteúdo educativo e motivador
- Adapte a dificuldade baseada no slideIndex (1-8)`

    const messages = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Crie o slide ${slideIndex} de 8 sobre "${query}" na matéria de ${subject}. 
        
        Slide ${slideIndex} deve focar em:
        ${getSlideFocus(slideIndex)}
        
        Responda APENAS com JSON válido, sem texto adicional.` 
      }
    ]

    // Selecionar modelo baseado na complexidade
    const selectedModel = selectModel(messages[1].content, 'professor-interactive')
    const modelConfig = getModelConfig(selectedModel)
    
    console.log(`Usando modelo: ${selectedModel} para slide ${slideIndex}`)
    
    const startTime = Date.now()
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as any,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.max_tokens,
    })

    const generationTime = Date.now() - startTime
    const content = response.choices[0]?.message?.content || ''
    
    try {
      // Tentar parsear como JSON
      const parsedData = JSON.parse(content)
      
      // Validar estrutura do slide
      const validatedSlide = validateSlideStructure(parsedData, slideIndex)
      
      // Armazenar no cache
      if (useCache) {
        slideCache.set(query, subject, slideIndex, validatedSlide)
      }
      
      console.log(`✅ Slide ${slideIndex} gerado em ${generationTime}ms`)
      
      return NextResponse.json({ 
        success: true, 
        slide: validatedSlide,
        fromCache: false,
        generationTime,
        model: selectedModel,
        cacheStats: slideCache.getStats()
      })
      
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError)
      console.error('📝 Resposta problemática:', content)
      
      // Tentar limpar e parsear novamente
      const cleanedResponse = content.replace(/```json|```/g, '').trim()
      
      try {
        const parsedData = JSON.parse(cleanedResponse)
        const validatedSlide = validateSlideStructure(parsedData, slideIndex)
        
        if (useCache) {
          slideCache.set(query, subject, slideIndex, validatedSlide)
        }
        
        return NextResponse.json({ 
          success: true, 
          slide: validatedSlide,
          fromCache: false,
          generationTime,
          model: selectedModel,
          warning: 'Resposta foi limpa antes do parse',
          cacheStats: slideCache.getStats()
        })
        
      } catch (secondParseError) {
        console.error('❌ Segundo parse também falhou:', secondParseError)
        
        // Fallback: gerar slide mock
        const mockSlide = generateMockSlide(query, subject, slideIndex)
        
        if (useCache) {
          slideCache.set(query, subject, slideIndex, mockSlide)
        }
        
        return NextResponse.json({ 
          success: true, 
          slide: mockSlide,
          fromCache: false,
          generationTime,
          model: selectedModel,
          warning: 'Usado slide mock devido a erro de parse',
          cacheStats: slideCache.getStats()
        })
      }
    }

  } catch (error: any) {
    console.error('❌ Erro na API optimized-slide:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 })
  }
}

// Função para determinar o foco de cada slide
function getSlideFocus(slideIndex: number): string {
  const focuses = {
    1: "Introdução ao tema e conceitos básicos",
    2: "Desenvolvimento dos conceitos principais",
    3: "Exemplos práticos e aplicações",
    4: "Questão de múltipla escolha sobre conceitos básicos",
    5: "Aprofundamento e detalhes importantes",
    6: "Questão de múltipla escolha de nível intermediário",
    7: "Síntese e conexões entre conceitos",
    8: "Questão final e conclusão do tema"
  }
  
  return focuses[slideIndex as keyof typeof focuses] || "Conteúdo educativo relevante"
}

// Função para validar estrutura do slide
function validateSlideStructure(slide: any, slideIndex: number): any {
  const defaultSlide = {
    type: 'explanation',
    content: `Conteúdo do slide ${slideIndex}`,
    card1: {
      title: `Card 1 - Slide ${slideIndex}`,
      content: "Conteúdo explicativo"
    },
    card2: {
      title: `Card 2 - Slide ${slideIndex}`,
      content: "Conteúdo adicional",
      options: ["Opção A", "Opção B", "Opção C", "Opção D"],
      correctOption: 0,
      helpMessage: "Dica para ajudar o aluno",
      correctAnswer: "Explicação da resposta correta"
    }
  }

  // Validar campos obrigatórios
  if (!slide.type) slide.type = defaultSlide.type
  if (!slide.content) slide.content = defaultSlide.content
  if (!slide.card1) slide.card1 = defaultSlide.card1
  if (!slide.card2) slide.card2 = defaultSlide.card2

  // Validar card1
  if (!slide.card1.title) slide.card1.title = defaultSlide.card1.title
  if (!slide.card1.content) slide.card1.content = defaultSlide.card1.content

  // Validar card2
  if (!slide.card2.title) slide.card2.title = defaultSlide.card2.title
  if (!slide.card2.content) slide.card2.content = defaultSlide.card2.content
  if (!slide.card2.options) slide.card2.options = defaultSlide.card2.options
  if (slide.card2.correctOption === undefined) slide.card2.correctOption = defaultSlide.card2.correctOption
  if (!slide.card2.helpMessage) slide.card2.helpMessage = defaultSlide.card2.helpMessage
  if (!slide.card2.correctAnswer) slide.card2.correctAnswer = defaultSlide.card2.correctAnswer

  return slide
}

// Função para gerar slide mock
function generateMockSlide(query: string, subject: string, slideIndex: number): any {
  return {
    type: slideIndex % 2 === 0 ? 'question' : 'explanation',
    content: `Este é o slide ${slideIndex} sobre ${query} na matéria de ${subject}.`,
    card1: {
      title: `Conceito Principal - Slide ${slideIndex}`,
      content: `Aqui está o conteúdo principal do slide ${slideIndex} sobre ${query}.`
    },
    card2: {
      title: slideIndex % 2 === 0 ? `Questão ${slideIndex}` : `Informação Adicional`,
      content: slideIndex % 2 === 0 
        ? `Qual é a resposta correta sobre ${query}?`
        : `Informações adicionais sobre ${query} na matéria de ${subject}.`,
      options: slideIndex % 2 === 0 ? [
        "Alternativa A",
        "Alternativa B", 
        "Alternativa C",
        "Alternativa D"
      ] : undefined,
      correctOption: slideIndex % 2 === 0 ? 0 : undefined,
      helpMessage: slideIndex % 2 === 0 ? "Pense sobre os conceitos principais." : undefined,
      correctAnswer: slideIndex % 2 === 0 ? "A resposta correta é a alternativa A." : undefined
    }
  }
}
