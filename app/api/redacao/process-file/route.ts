import { NextRequest, NextResponse } from 'next/server'

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { OpenAI } from 'openai'


import mammoth from 'mammoth'



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para extrair texto de DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    throw new Error('Erro ao processar documento Word')
  }
}

// Função para OCR com OpenAI
async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    // Converter buffer para base64
    const base64 = buffer.toString('base64')
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia todo o texto desta imagem. Se for uma redação, mantenha a formatação original com parágrafos. Retorne apenas o texto extraído, sem comentários adicionais."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Erro no OCR:', error)
    throw new Error('Erro ao processar imagem com OCR')
  }
}

// Função para extrair texto de arquivo de texto
function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Verificar tamanho do arquivo
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type
    let extractedText = ''

    // Processar arquivo baseado no tipo
    switch (mimeType) {
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        extractedText = await extractTextFromDOCX(buffer)
        break
        
      case 'text/plain':
      case 'text/markdown':
        extractedText = extractTextFromTXT(buffer)
        break
        
      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
        extractedText = await extractTextFromImage(buffer)
        break
        
      default:
        return NextResponse.json(
          { error: 'Tipo de arquivo não suportado. Use DOC, DOCX, TXT, MD ou imagens.' },
          { status: 400 }
        )
    }

    // Limpar texto extraído
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    // Contar palavras
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length

    return NextResponse.json({
      success: true,
      text: cleanedText,
      wordCount,
      fileName: file.name,
      fileSize: file.size,
      mimeType
    })

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
