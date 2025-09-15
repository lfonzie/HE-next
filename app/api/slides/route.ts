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

async function generateSlide(topic: string, position: number): Promise<Slide> {
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
  
  const prompt = `Gere um slide (JSON, conforme contrato: type, title, content, key_points, question_stem, options, answer, rationale, image_prompt, image_confidence) para a posição ${position} de uma aula de 9 slides sobre ${topic}. Cada slide deve abordar um subtema distinto (ex.: definição, exemplo prático, variações, contraexemplo, prática guiada, síntese). Máx. 150 palavras no content, linguagem clara, brasileira, sem jargões. Para type: question, inclua apenas 1 alternativa correta com opções plausíveis e rationale curto (1–2 frases). Evite repetições de títulos ou ideias de slides anteriores. Não use linguagem 'meta' (ex.: 'neste slide...'). 

Para image_prompt: crie um prompt simples e descritivo em inglês (1-3 palavras) que funcione bem com Unsplash para buscar imagens educacionais relacionadas ao conteúdo. Exemplos: "mathematics classroom", "science laboratory", "students learning", "books education", "teacher teaching". Use image_confidence entre 0.7-1.0 para imagens que realmente agregam valor educacional.`;

  const messages = [
    { role: 'system', content: 'Você é um especialista em educação que gera slides únicos e educativos. Sempre retorne JSON válido.' },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    // Parse JSON response
    const slide = JSON.parse(content) as Slide;
    
    // Validate required fields
    if (!slide.type || !slide.title || !slide.content) {
      throw new Error('Invalid slide structure');
    }

    // Ensure image_confidence is a number
    if (slide.image_confidence === undefined) {
      slide.image_confidence = Math.random() * 0.5 + 0.5; // Random between 0.5-1.0
    }

    return slide;
  } catch (error) {
    console.error('Error generating slide:', error);
    throw error;
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

    // Anti-repetition logic
    while (attempts < maxAttempts) {
      try {
        slide = await generateSlide(topic, position);
        
        // Check similarity with previous slides
        const isUnique = slide ? previousSlides.every(prev => {
          const contentSimilarity = calculateSimilarity(
            slide!.content + (slide!.key_points?.join('') || ''),
            prev.content + (prev.key_points?.join('') || '')
          );
          const titleSimilarity = calculateSimilarity(slide!.title, prev.title);
          
          return contentSimilarity < 0.8 && titleSimilarity < 0.8;
        }) : true;

        if (isUnique) break;
        
        attempts++;
        console.log(`Slide ${position} attempt ${attempts}: similarity too high, regenerating...`);
      } catch (error) {
        console.error(`Error generating slide ${position} (attempt ${attempts + 1}):`, error);
        attempts++;
      }
    }

    if (!slide) {
      return NextResponse.json({ 
        error: 'Failed to generate unique slide after multiple attempts' 
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
