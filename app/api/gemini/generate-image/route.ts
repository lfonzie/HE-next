// app/api/gemini/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { GoogleGenerativeAI } from '@google/generative-ai';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type = 'image', subject, style = 'educational' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🎨 Gerando imagem com Gemini 2.5 Nano Banana:', prompt);

    // Verificar se a API key está configurada
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY não configurada');
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
        fallback: true
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    // Construir prompt otimizado baseado no tipo
    let optimizedPrompt = '';
    
    switch (type) {
      case 'diagram':
        optimizedPrompt = `Create a detailed educational diagram showing: ${prompt}. 
        - Use clear, simple lines and shapes
        - Include labels and annotations
        - Use a clean, professional style
        - Focus on educational clarity
        - No text overlays, only visual elements
        - Use contrasting colors for better visibility`;
        break;
        
      case 'table':
        optimizedPrompt = `Create a visual table/chart showing: ${prompt}.
        - Use clear grid lines
        - Include headers and data cells
        - Use professional colors
        - Make it easy to read and understand
        - Focus on data visualization`;
        break;
        
      case 'chart':
        optimizedPrompt = `Create an educational chart/graph showing: ${prompt}.
        - Use clear axes and labels
        - Include data points and trends
        - Use professional colors
        - Make it easy to interpret
        - Focus on data visualization`;
        break;
        
      case 'illustration':
        optimizedPrompt = `Create an educational illustration showing: ${prompt}.
        - Use clear, detailed artwork
        - Include relevant visual elements
        - Use professional colors
        - Make it educational and informative
        - Focus on visual learning`;
        break;
        
      default:
        optimizedPrompt = `Create an educational image showing: ${prompt}.
        - Use clear, detailed visuals
        - Include relevant elements
        - Use professional colors
        - Make it educational and informative
        - Focus on visual learning`;
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
        return getFallbackResponse(prompt, type);
      }

      // Converter dados da imagem para base64
      const imageBase64 = imageData.inlineData.data;
      const imageMimeType = imageData.inlineData.mimeType || 'image/png';
      
      console.log('✅ Imagem gerada com sucesso pelo Gemini');

      return NextResponse.json({
        success: true,
        image: {
          data: imageBase64,
          mimeType: imageMimeType,
          source: 'gemini',
          prompt: optimizedPrompt,
          type: type
        },
        fallback: false
      });

    } catch (geminiError: any) {
      console.error('❌ Erro na geração com Gemini:', geminiError);
      return getFallbackResponse(prompt, type);
    }

  } catch (error: any) {
    console.error('❌ Erro na API de geração de imagem:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
}

// Função de fallback quando Gemini não funciona
function getFallbackResponse(prompt: string, type: string) {
  console.log('🔄 Usando fallback para geração de imagem');
  
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
      fallbackUrl = `https://via.placeholder.com/800x600/34495E/FFFFFF?text=Image+Placeholder`;
  }

  return NextResponse.json({
    success: true,
    image: {
      data: null,
      mimeType: 'image/png',
      source: 'fallback',
      prompt: prompt,
      type: type,
      fallbackUrl: fallbackUrl
    },
    fallback: true
  });
}
