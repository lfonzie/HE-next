// app/api/gemini/process-content/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { GoogleGenerativeAI } from '@google/generative-ai';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, subject, type = 'diagram' } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('🎨 Processando conteúdo com Gemini:', content);

    // Verificar se a API key está configurada
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('⚠️ GOOGLE_GEMINI_API_KEY não configurada');
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
        fallback: true
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Detectar tipo de conteúdo baseado na sintaxe especial
    let processedType = type;
    let processedContent = content;

    // Detectar sintaxe especial para diagramas
    const diagramMatch = content.match(/<<<criar um diagrama da (.+?), sem letras somente imagem>>>/i);
    if (diagramMatch) {
      processedType = 'diagram';
      processedContent = diagramMatch[1];
    }

    // Detectar sintaxe especial para tabelas
    const tableMatch = content.match(/<<<criar uma tabela (.+?)>>>/i);
    if (tableMatch) {
      processedType = 'table';
      processedContent = tableMatch[1];
    }

    // Detectar sintaxe especial para gráficos
    const chartMatch = content.match(/<<<criar um gráfico da (.+?)>>>/i);
    if (chartMatch) {
      processedType = 'chart';
      processedContent = chartMatch[1];
    }

    // Construir prompt otimizado baseado no tipo
    let optimizedPrompt = '';
    
    switch (processedType) {
      case 'diagram':
        optimizedPrompt = `Create a detailed educational diagram showing: ${processedContent}. 
        - Use clear, simple lines and shapes
        - Include labels and annotations
        - Use a clean, professional style
        - Focus on educational clarity
        - No text overlays, only visual elements
        - Use contrasting colors for better visibility
        - Make it suitable for educational materials`;
        break;
        
      case 'table':
        optimizedPrompt = `Create a visual table/chart showing: ${processedContent}.
        - Use clear grid lines
        - Include headers and data cells
        - Use professional colors
        - Make it easy to read and understand
        - Focus on data visualization
        - Make it suitable for educational materials`;
        break;
        
      case 'chart':
        optimizedPrompt = `Create an educational chart/graph showing: ${processedContent}.
        - Use clear axes and labels
        - Include data points and trends
        - Use professional colors
        - Make it easy to interpret
        - Focus on data visualization
        - Make it suitable for educational materials`;
        break;
        
      case 'illustration':
        optimizedPrompt = `Create an educational illustration showing: ${processedContent}.
        - Use clear, detailed artwork
        - Include relevant visual elements
        - Use professional colors
        - Make it educational and informative
        - Focus on visual learning
        - Make it suitable for educational materials`;
        break;
        
      default:
        optimizedPrompt = `Create an educational image showing: ${processedContent}.
        - Use clear, detailed visuals
        - Include relevant elements
        - Use professional colors
        - Make it educational and informative
        - Focus on visual learning
        - Make it suitable for educational materials`;
    }

    // Adicionar contexto do assunto se fornecido
    if (subject) {
      optimizedPrompt += `\n\nContext: This is for a lesson about ${subject}.`;
    }

    // Adicionar estilo educacional
    optimizedPrompt += `\n\nStyle: Educational, professional, clear, and suitable for learning materials.`;

    console.log('🎯 Prompt otimizado:', optimizedPrompt);

    try {
      const result = await model.generateContent(optimizedPrompt);
      const response = await result.response;
      
      if (!response) {
        throw new Error('No response from Gemini');
      }

      // Verificar se há imagem na resposta
      const imageData = response.candidates?.[0]?.content?.parts?.[0];
      
      if (!imageData || !imageData.inlineData) {
        console.log('⚠️ Gemini não retornou imagem, tentando fallback');
        return getFallbackResponse(processedContent, processedType);
      }

      // Converter dados da imagem para base64
      const imageBase64 = imageData.inlineData.data;
      const imageMimeType = imageData.inlineData.mimeType || 'image/png';
      
      console.log('✅ Conteúdo processado com sucesso pelo Gemini');

      return NextResponse.json({
        success: true,
        image: {
          data: imageBase64,
          mimeType: imageMimeType,
          source: 'gemini',
          prompt: optimizedPrompt,
          type: processedType,
          originalContent: content,
          processedContent: processedContent
        },
        fallback: false
      });

    } catch (geminiError: any) {
      console.error('❌ Erro na geração com Gemini:', geminiError);
      return getFallbackResponse(processedContent, processedType);
    }

  } catch (error: any) {
    console.error('❌ Erro na API de processamento de conteúdo:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
}

// Função de fallback quando Gemini não funciona
function getFallbackResponse(content: string, type: string) {
  console.log('🔄 Usando fallback para processamento de conteúdo');
  
  // Gerar URL de placeholder baseado no tipo
  let fallbackUrl = '';
  
  switch (type) {
    case 'diagram':
      fallbackUrl = `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Diagram+Placeholder`;
      break;
    case 'table':
      fallbackUrl = `https://via.placeholder.com/800x600/50C878/FFFFFF?text=Table+Placeholder`;
      break;
    case 'chart':
      fallbackUrl = `https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Chart+Placeholder`;
      break;
    case 'illustration':
      fallbackUrl = `https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Illustration+Placeholder`;
      break;
    default:
      fallbackUrl = `https://via.placeholder.com/800x600/34495E/FFFFFF?text=Content+Placeholder`;
  }

  return NextResponse.json({
    success: true,
    image: {
      data: null,
      mimeType: 'image/png',
      source: 'fallback',
      prompt: content,
      type: type,
      fallbackUrl: fallbackUrl
    },
    fallback: true
  });
}
