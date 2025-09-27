import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SPEC_FROM_VIDEO_PROMPT } from '@/lib/video-learning-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Descrição do vídeo é obrigatória' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Modify the prompt to work with text description instead of video
    const textPrompt = `Você é um pedagogista e designer de produtos com profunda experiência em criar experiências de aprendizado envolventes via aplicações web interativas.

Com base na seguinte descrição de conteúdo de vídeo: "${description}"

Escreva uma especificação detalhada e cuidadosamente considerada para uma aplicação web interativa projetada para complementar o conteúdo descrito e reforçar sua(s) ideia(s) principal(is). A especificação deve ser completa e autocontida. Aqui está um exemplo de uma especificação escrita em resposta a um vídeo sobre harmonia funcional:

"Na música, acordes criam expectativas de movimento em direção a certos outros acordes e resolução em direção a um centro tonal. Isso é chamado de harmonia funcional.

Construa uma aplicação web interativa para ajudar um aprendiz a entender o conceito de harmonia funcional.

ESPECIFICAÇÕES:
1. A aplicação deve apresentar um teclado interativo.
2. A aplicação deve mostrar todos os 7 tríades diatônicas que podem ser criadas em uma tonalidade maior (ou seja, tônica, supertônica, mediante, subdominante, dominante, submediante, acorde de condução).
3. A aplicação deve de alguma forma descrever a função de cada uma das tríades diatônicas, e declarar para quais outros acordes cada tríade tende a levar.
4. A aplicação deve fornecer uma maneira para os usuários tocarem diferentes acordes em sequência e ver os resultados.
[etc.]"

O objetivo da aplicação que será construída com base na especificação é melhorar o entendimento através de design simples e lúdico. A especificação fornecida não deve ser excessivamente complexa, ou seja, um desenvolvedor web júnior deve ser capaz de implementá-la em um único arquivo HTML (com todos os estilos e scripts inline). Mais importante, a especificação deve delinear claramente os mecanismos centrais da aplicação, e esses mecanismos devem ser altamente eficazes em reforçar a(s) ideia(s) principal(is) do conteúdo descrito.

Forneça o resultado como um objeto JSON contendo um único campo chamado "spec", cujo valor é a especificação para a aplicação web. Certifique-se de que o JSON está bem formatado e não contém caracteres de controle que possam causar problemas de parsing.`

    const result = await model.generateContent(textPrompt)
    const response = await result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Falha ao gerar especificação' },
        { status: 500 }
      )
    }

    // Parse JSON response
    try {
      // Try multiple approaches to extract JSON
      let jsonString = null
      
      // First, try to find JSON between ```json and ``` markers
      const codeBlockMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1]
      } else {
        // Fallback: try to find JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonString = jsonMatch[0]
        }
      }

      if (!jsonString) {
        throw new Error('Resposta não contém JSON válido')
      }

      // Clean the JSON string by removing control characters that might cause issues
      let cleanedJson = jsonString
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove problematic control characters (keep \n, \r, \t)
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Convert remaining \r to \n
        .trim() // Remove leading/trailing whitespace

      // Try to parse, if it fails, try additional cleaning
      let parsed
      try {
        parsed = JSON.parse(cleanedJson)
      } catch (firstError) {
        console.log('First parse attempt failed, trying additional cleaning...')
        console.log('Problematic JSON around position 179:', cleanedJson.substring(170, 190))
        
        // More aggressive cleaning - escape all remaining problematic characters
        cleanedJson = cleanedJson
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove all control characters
          .replace(/\n/g, '\\n') // Escape newlines
          .replace(/\t/g, '\\t') // Escape tabs
          .replace(/\\n/g, '\n') // Convert back to actual newlines
          .replace(/\\t/g, '\t') // Convert back to actual tabs
        
        parsed = JSON.parse(cleanedJson)
      }
      
      if (!parsed.spec) {
        throw new Error('Especificação não encontrada na resposta')
      }

      return NextResponse.json({
        spec: parsed.spec,
        description
      })

    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError)
      console.error('Texto da resposta:', text.substring(0, 500) + '...')
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao gerar especificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
