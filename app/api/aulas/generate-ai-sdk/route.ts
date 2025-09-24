import { NextRequest, NextResponse } from 'next/server';
import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { AI_PROVIDERS, FALLBACK_CONFIG, type AIProvider } from '@/lib/ai-providers';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

// Schema para validação da resposta
const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  level: z.string(),
  objectives: z.array(z.string()),
  stages: z.array(z.object({
    etapa: z.string(),
    type: z.string(),
    activity: z.object({
      component: z.string(),
      content: z.string(),
      questions: z.array(z.object({
        q: z.string(),
        options: z.array(z.string()),
        correct: z.number(),
        explanation: z.string()
      })).optional(),
      imageUrl: z.string().optional(),
      imagePrompt: z.string().optional()
    }),
    route: z.string(),
    estimatedTime: z.number()
  })),
  feedback: z.object({
    pacing: z.object({
      duration: z.object({
        sync: z.number(),
        async: z.number()
      }),
      content: z.object({
        totalTokens: z.number(),
        totalWords: z.number(),
        averageTokensPerSlide: z.number()
      }),
      quality: z.object({
        score: z.number(),
        validSlides: z.number(),
        totalSlides: z.number()
      }),
      images: z.object({
        count: z.number(),
        estimatedSizeMB: z.number()
      })
    })
  }),
  metadata: z.object({
    subject: z.string(),
    grade: z.string(),
    duration: z.string(),
    difficulty: z.string(),
    tags: z.array(z.string()),
    provider: z.string(),
    model: z.string()
  })
});

// Configuração dos provedores usando configuração centralizada
const PROVIDERS = [
  {
    name: 'gemini' as AIProvider,
    model: google(AI_PROVIDERS.gemini.model),
    priority: AI_PROVIDERS.gemini.priority,
    timeout: AI_PROVIDERS.gemini.timeout,
    description: AI_PROVIDERS.gemini.description
  },
  {
    name: 'gpt-4o-mini' as AIProvider,
    model: openai(AI_PROVIDERS['gpt-4o-mini'].model),
    priority: AI_PROVIDERS['gpt-4o-mini'].priority,
    timeout: AI_PROVIDERS['gpt-4o-mini'].timeout,
    description: AI_PROVIDERS['gpt-4o-mini'].description
  },
  {
    name: 'gpt-5' as AIProvider,
    model: openai(AI_PROVIDERS['gpt-5'].model),
    priority: AI_PROVIDERS['gpt-5'].priority,
    timeout: AI_PROVIDERS['gpt-5'].timeout,
    description: AI_PROVIDERS['gpt-5'].description
  }
];

// Função para gerar aula com fallback
async function generateLessonWithFallback(topic: string, schoolId: string, mode: string) {
  const errors = [];
  
  for (const provider of PROVIDERS) {
    try {
      console.log(`[AI-SDK] Tentando provedor: ${provider.name} (${provider.description})`);
      
      const startTime = Date.now();
      
      const result = await generateObject({
        model: provider.model,
        schema: LessonSchema,
        prompt: `Você é um especialista em educação e criação de aulas interativas. Crie uma aula completa sobre "${topic}" com as seguintes especificações:

REQUISITOS:
- Título claro e específico sobre o tópico
- 14 slides no total
- Slides 7 e 12 devem ser quizzes com 3 perguntas cada
- Slides 1, 8 e 14 devem ter imagens educacionais
- Duração estimada: 45-60 minutos
- Nível: Ensino Médio
- Objetivos de aprendizagem claros
- Atividades interativas e engajantes

ESTRUTURA:
1. Introdução e Contextualização
2-6. Conteúdo Principal (5 slides)
7. Quiz de Verificação (3 perguntas)
8-11. Aplicação Prática (4 slides)
12. Quiz Final (3 perguntas)
13. Síntese e Conclusão
14. Próximos Passos

Para cada slide, inclua:
- Conteúdo educativo detalhado
- Tempo estimado (3-5 minutos por slide)
- Tipo de atividade apropriado
- Para quizzes: perguntas objetivas com 4 alternativas e explicações

Gere uma aula completa, educativa e envolvente sobre "${topic}".`,
        maxTokens: 8000,
        temperature: 0.7,
      });

      const duration = Date.now() - startTime;
      console.log(`[AI-SDK] Sucesso com ${provider.name} em ${duration}ms`);

      // Transformar resultado para o formato esperado
      const lesson = {
        ...result.object,
        metadata: {
          ...result.object.metadata,
          provider: provider.name,
          model: provider.name,
          generationTime: duration
        }
      };

      return {
        success: true,
        lesson,
        provider: provider.name,
        duration,
        usage: result.usage
      };

    } catch (error) {
      console.error(`[AI-SDK] Erro com ${provider.name} (${provider.description}):`, error);
      errors.push({
        provider: provider.name,
        description: provider.description,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Se não é o último provedor, continuar para o próximo
      if (provider !== PROVIDERS[PROVIDERS.length - 1]) {
        const nextProvider = PROVIDERS[PROVIDERS.indexOf(provider) + 1];
        console.log(`[AI-SDK] Fallback: Tentando ${nextProvider.name} (${nextProvider.description})`);
        continue;
      }
    }
  }

  // Se todos os provedores falharam
  throw new Error(`Todos os provedores falharam. Erros: ${JSON.stringify(errors)}`);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { topic, schoolId = '', mode = 'sync' } = await request.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Tópico é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`[AI-SDK] Iniciando geração de aula: "${topic}"`);

    // Gerar aula com fallback
    const result = await generateLessonWithFallback(topic, schoolId, mode);

    const totalDuration = Date.now() - startTime;

    console.log(`[AI-SDK] Aula gerada com sucesso usando ${result.provider} em ${totalDuration}ms`);

    return NextResponse.json({
      success: true,
      lesson: result.lesson,
      provider: result.provider,
      generationTime: totalDuration,
      usage: result.usage,
      topic,
      mode,
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: result.provider,
        generationTime: totalDuration,
        fallbackUsed: result.provider !== 'gemini'
      }
    });

  } catch (error) {
    console.error('[AI-SDK] Erro na geração da aula:', error);
    
    const totalDuration = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: totalDuration,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
