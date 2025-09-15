import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { openai, selectModel, getModelConfig } from '@/lib/openai';
import { Slide, SlideGenerationRequest, SlideGenerationResponse } from '@/types/slides';

// Simple similarity function (can be replaced with embeddings)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);
  
  return intersection.size / union.size;
}

// Sanitize JSON response from OpenAI API
function sanitizeJsonString(content: string): string {
  // First, try to extract JSON from markdown blocks
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // If no markdown blocks, try to find JSON object/array
  const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // Fallback: clean the entire content
  return content
    .replace(/```json/g, '') // Remove ```json
    .replace(/```/g, '')     // Remove ```
    .replace(/^\s+|\s+$/g, '') // Remove espaços em branco no início/fim
    .replace(/\n/g, '')      // Remove quebras de linha
    .replace(/\t/g, '');     // Remove tabulações
}

// Validate if string is potentially valid JSON
function isPotentiallyValidJson(content: string): boolean {
  const trimmed = content.trim();
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}

// Validate slide structure
function validateSlideStructure(slide: any): slide is Slide {
  return (
    slide &&
    typeof slide === 'object' &&
    typeof slide.type === 'string' &&
    ['explanation', 'question', 'closing'].includes(slide.type) &&
    typeof slide.title === 'string' &&
    typeof slide.content === 'string' &&
    slide.title.trim().length > 0 &&
    slide.content.trim().length > 0
  );
}

async function generateSlide(topic: string, position: number, previousSlides: Slide[] = [], attempt: number = 1): Promise<Slide> {
  const model = selectModel('gpt-4o-mini');
  const config = getModelConfig(model);
  
  const slideTypes = [
    'explanation', 'explanation', 'explanation', // Slides 1-3
    'question', // Slide 4
    'explanation', 'explanation', 'explanation', // Slides 5-7
    'question', // Slide 8
    'closing' // Slide 9
  ];
  
  const slideType = slideTypes[position - 1];
  
  // Create context from previous slides to avoid repetition
  const previousContext = previousSlides.length > 0 
    ? `\n\nCONTEXTO DOS SLIDES ANTERIORES (evite repetir):\n${previousSlides.map((slide, i) => 
        `Slide ${i + 1}: "${slide.title}" - ${slide.content.substring(0, 100)}...`
      ).join('\n')}\n\nIMPORTANTE: Crie conteúdo completamente diferente dos slides anteriores.`
    : '';
  
  // Enhanced prompt with better diversity and context awareness
  const basePrompt = `Gere um slide (JSON, conforme contrato: type, title, content, key_points, question_stem, options, answer, rationale, image_prompt, image_confidence) para a posição ${position} de uma aula de 9 slides sobre "${topic}".

TIPO DE SLIDE: ${slideType}
POSIÇÃO: ${position}/9

DIRETRIZES ESPECÍFICAS:
- Para EXPLANATION: Foque em conceitos, exemplos práticos, aplicações reais
- Para QUESTION: Crie pergunta desafiadora com 4 alternativas (só 1 correta)
- Para CLOSING: Resumo final + dica prática para aplicar o conhecimento

DIVERSIDADE OBRIGATÓRIA:
- Título único e específico (não genérico)
- Conteúdo focado em aspecto específico do tema
- Linguagem clara, brasileira, sem jargões técnicos
- Máximo 150 palavras no content
- Para questions: rationale curto (1-2 frases)

IMAGEM:
- image_prompt: 1-3 palavras em inglês para Unsplash
- image_confidence: 0.7-1.0 (alta qualidade educacional)

${previousContext}`;

  // Enhanced prompt for retry attempts
  const retryPrompt = attempt === 1 
    ? basePrompt
    : `${basePrompt}\n\nCRÍTICO: Retorne APENAS um objeto JSON válido, sem blocos de código Markdown (ex.: sem \`\`\`json ou \`\`\`), comentários ou texto adicional. A resposta deve ser exclusivamente JSON puro.`;

  const messages = [
    { 
      role: 'system', 
      content: 'Você é um especialista em educação que gera slides únicos e educativos. Sempre retorne JSON válido puro, sem formatação Markdown ou texto adicional.' 
    },
    { role: 'user', content: retryPrompt }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI API');
    }

    // Log raw response for debugging
    console.log(`Raw API response (attempt ${attempt}):`, content);

    // Sanitize the response
    const sanitizedContent = sanitizeJsonString(content);
    
    // Validate JSON format before parsing
    if (!isPotentiallyValidJson(sanitizedContent)) {
      console.error(`Response is not in valid JSON format (attempt ${attempt}):`, sanitizedContent);
      throw new Error('Response is not in valid JSON format');
    }

    // Parse JSON response
    const slide = JSON.parse(sanitizedContent) as Slide;
    
    // Validate slide structure
    if (!validateSlideStructure(slide)) {
      console.error(`Invalid slide structure (attempt ${attempt}):`, slide);
      throw new Error('Invalid slide structure: missing required fields');
    }

    // Ensure image_confidence is a number
    if (slide.image_confidence === undefined) {
      slide.image_confidence = Math.random() * 0.5 + 0.5; // Random between 0.5-1.0
    }

    console.log(`Successfully generated slide ${position} (attempt ${attempt})`);
    return slide;
  } catch (error) {
    console.error(`Error generating slide ${position} (attempt ${attempt}):`, error);
    
    // Retry with enhanced prompt if not the last attempt
    if (attempt < 3) {
      console.warn(`Retrying slide generation (attempt ${attempt + 1})`);
      return generateSlide(topic, position, [], attempt + 1);
    }
    
    throw new Error(`Failed to generate slide after ${attempt} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (temporarily disabled for development)
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { topic, position, previousSlides }: SlideGenerationRequest = await request.json();

    if (!topic || !position || position < 1 || position > 9) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    let slide: Slide | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    // Anti-repetition logic with improved error handling
    while (attempts < maxAttempts) {
      try {
        slide = await generateSlide(topic, position, previousSlides, attempts);
        
        // Check similarity with previous slides (more lenient threshold)
        const isUnique = slide ? previousSlides.every(prev => {
          const contentSimilarity = calculateSimilarity(
            slide!.content + (slide!.key_points?.join('') || ''),
            prev.content + (prev.key_points?.join('') || '')
          );
          const titleSimilarity = calculateSimilarity(slide!.title, prev.title);
          
          return contentSimilarity < 0.7 && titleSimilarity < 0.7; // Reduced threshold
        }) : true;

        if (isUnique) break;
        
        attempts++;
        console.log(`Slide ${position} attempt ${attempts}: similarity too high, regenerating...`);
      } catch (error) {
        console.error(`Error generating slide ${position} (attempt ${attempts + 1}):`, error);
        attempts++;
        
        // If this is the last attempt, return error immediately
        if (attempts >= maxAttempts) {
          return NextResponse.json({ 
            error: `Failed to generate slide after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false
          }, { status: 500 });
        }
      }
    }

    if (!slide) {
      return NextResponse.json({ 
        error: 'Failed to generate unique slide after multiple attempts',
        success: false
      }, { status: 500 });
    }

    const response: SlideGenerationResponse = {
      slide,
      success: true
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in slides API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
