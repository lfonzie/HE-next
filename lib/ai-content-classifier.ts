// lib/ai-content-classifier.ts
// Sistema de classificação de conteúdo por IA para detectar tópicos inadequados

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export interface ContentClassificationResult {
  isInappropriate: boolean;
  confidence: number;
  categories: string[];
  reasoning: string;
  educationalAlternative?: string;
  suggestedResponse?: string;
}

export interface ContentClassificationSchema {
  isInappropriate: boolean;
  confidence: number;
  categories: string[];
  reasoning: string;
  educationalAlternative?: string;
}

// Schema para validação da resposta da IA usando zod
import { z } from 'zod';

const ContentClassificationSchema = z.object({
  isInappropriate: z.boolean().describe('Se o conteúdo é inadequado para ambiente educacional'),
  confidence: z.number().min(0).max(1).describe('Nível de confiança da classificação (0-1)'),
  categories: z.array(z.string()).describe('Categorias de inadequação detectadas'),
  reasoning: z.string().describe('Explicação da classificação'),
  educationalAlternative: z.string().optional().describe('Alternativa educacional apropriada')
});

// Prompt especializado para classificação de conteúdo educacional
const CLASSIFICATION_PROMPT = `
Você é um especialista em segurança educacional e classificação de conteúdo. Sua função é analisar tópicos de aula e determinar se são apropriados para um ambiente educacional seguro.

CONTEXTO:
- Sistema educacional para estudantes de diferentes idades
- Foco em segurança e proteção de menores
- Ambiente acadêmico e construtivo

CATEGORIAS DE CONTEÚDO INADEQUADO:
1. **Conteúdo Sexual Explícito**: Pornografia, exploração sexual, instruções sexuais inadequadas
2. **Violência e Armas**: Instruções de violência, armas, atividades perigosas
3. **Substâncias Ilícitas**: Instruções de uso de drogas, álcool, cigarros, substâncias controladas
4. **Atividades Ilegais**: Hacking malicioso, pirataria, fraudes, atividades criminosas
5. **Conteúdo Prejudicial**: Automutilação, suicídio, extremismo, ódio
6. **Explosivos e Perigosos**: Instruções para fazer bombas, explosivos caseiros, substâncias tóxicas
7. **Conteúdo de Ódio**: Racismo, xenofobia, homofobia, discriminação

CONTEÚDO EDUCATIVO APROPRIADO (NÃO BLOQUEAR):
- Educação sexual responsável e científica
- Biologia e anatomia humana
- Química e física aplicadas de forma segura
- História e geografia
- Matemática e ciências
- Literatura e artes
- Tecnologia construtiva e programação ética
- Saúde e bem-estar
- Meio ambiente e sustentabilidade

CRITÉRIOS DE CLASSIFICAÇÃO:
- **Apropriado**: Tópicos educacionais construtivos, científicos, acadêmicos
- **Inadequado**: Instruções para atividades prejudiciais, ilegais ou inadequadas para menores
- **Confiança Alta (0.8-1.0)**: Clara inadequação ou apropriação
- **Confiança Média (0.5-0.7)**: Conteúdo limítrofe que requer análise cuidadosa
- **Confiança Baixa (0.0-0.4)**: Conteúdo ambíguo ou apropriado

ALTERNATIVAS EDUCACIONAIS:
- Para conteúdo sexual inadequado → "educação sexual responsável e biologia"
- Para violência → "resolução pacífica de conflitos e comunicação"
- Para drogas → "biologia e como o corpo funciona"
- Para armas → "física e mecânica aplicada de forma segura"
- Para atividades ilegais → "tecnologia construtiva e ética digital"
- Para explosivos → "química e física aplicadas de forma segura"

INSTRUÇÕES:
1. Analise o tópico fornecido
2. Determine se é apropriado para ambiente educacional
3. Classifique a confiança da sua análise
4. Identifique categorias de inadequação se aplicável
5. Forneça raciocínio claro
6. Sugira alternativa educacional se inadequado

EXEMPLOS:
- "Como funciona o sistema solar?" → Apropriado (confiança: 0.95)
- "Como fazer uma bomba" → Inadequado (confiança: 0.98, categoria: explosivos)
- "Educação sexual responsável" → Apropriado (confiança: 0.90)
- "Como usar drogas" → Inadequado (confiança: 0.99, categoria: substâncias ilícitas)
- "Física das explosões" → Apropriado (confiança: 0.85) - conteúdo científico
- "Biologia do sistema reprodutor" → Apropriado (confiança: 0.90) - conteúdo científico
- "Como fazer sexo" → Inadequado (confiança: 0.95, categoria: conteúdo sexual explícito)
- "Anatomia humana" → Apropriado (confiança: 0.95) - conteúdo científico

TÓPICO PARA ANÁLISE: "{topic}"

Analise este tópico e forneça sua classificação seguindo o schema JSON especificado.
`;

/**
 * Classifica conteúdo usando IA para detectar tópicos inadequados
 */
export async function classifyContentWithAI(topic: string): Promise<ContentClassificationResult> {
  try {
    // Tentar OpenAI primeiro
    if (process.env.OPENAI_API_KEY) {
      try {
        const model = openai('gpt-4o-mini');
        
        const result = await generateObject({
          model,
          schema: ContentClassificationSchema,
          prompt: CLASSIFICATION_PROMPT.replace('{topic}', topic),
          temperature: 0.1, // Baixa temperatura para consistência
        });

        const classification = result.object;
        
        // Gerar resposta sugerida se inadequado
        let suggestedResponse: string | undefined;
        if (classification.isInappropriate && classification.educationalAlternative) {
          suggestedResponse = `Não posso fornecer informações sobre este tópico. Que tal aprendermos sobre ${classification.educationalAlternative}? Se você tem dúvidas importantes, recomendo conversar com seus pais, professores ou outros adultos responsáveis.`;
        }

        return {
          isInappropriate: classification.isInappropriate,
          confidence: classification.confidence,
          categories: classification.categories,
          reasoning: classification.reasoning,
          educationalAlternative: classification.educationalAlternative,
          suggestedResponse
        };
      } catch (openaiError) {
        console.warn('OpenAI classification failed, trying Gemini:', openaiError);
      }
    }

    // Fallback para Gemini
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const model = google('gemini-2.0-flash-exp');
        
        const result = await generateObject({
          model,
          schema: ContentClassificationSchema,
          prompt: CLASSIFICATION_PROMPT.replace('{topic}', topic),
          temperature: 0.1,
        });

        const classification = result.object;
        
        // Gerar resposta sugerida se inadequado
        let suggestedResponse: string | undefined;
        if (classification.isInappropriate && classification.educationalAlternative) {
          suggestedResponse = `Não posso fornecer informações sobre este tópico. Que tal aprendermos sobre ${classification.educationalAlternative}? Se você tem dúvidas importantes, recomendo conversar com seus pais, professores ou outros adultos responsáveis.`;
        }

        return {
          isInappropriate: classification.isInappropriate,
          confidence: classification.confidence,
          categories: classification.categories,
          reasoning: classification.reasoning,
          educationalAlternative: classification.educationalAlternative,
          suggestedResponse
        };
      } catch (geminiError) {
        console.error('Gemini classification failed:', geminiError);
      }
    }

    // Fallback para classificação local se ambas as IAs falharem
    console.warn('AI classification failed, using local fallback');
    return classifyContentLocally(topic);

  } catch (error) {
    console.error('Error in AI content classification:', error);
    return classifyContentLocally(topic);
  }
}

/**
 * Classificação local como fallback
 */
function classifyContentLocally(topic: string): ContentClassificationResult {
  const lowerTopic = topic.toLowerCase();
  
  // Lista de padrões inadequados
  const inappropriatePatterns = [
    { pattern: /como fazer sexo|instruções sexuais|pornografia|exploração sexual/i, category: 'Conteúdo Sexual Explícito' },
    { pattern: /como fazer uma bomba|explosivos caseiros|instruções para bombas/i, category: 'Explosivos e Perigosos' },
    { pattern: /como usar drogas|como fumar|como beber|instruções de uso de substâncias/i, category: 'Substâncias Ilícitas' },
    { pattern: /violência|armas|assassinato|tortura|abuso/i, category: 'Violência e Armas' },
    { pattern: /hacking malicioso|pirataria|fraudes|atividades ilegais/i, category: 'Atividades Ilegais' },
    { pattern: /suicídio|automutilação|extremismo|ódio/i, category: 'Conteúdo Prejudicial' },
    { pattern: /racismo|xenofobia|homofobia|discriminação/i, category: 'Conteúdo de Ódio' }
  ];

  // Lista de padrões educacionais apropriados (não bloquear)
  const educationalPatterns = [
    /educação sexual responsável/i,
    /biologia do sistema reprodutor/i,
    /anatomia humana/i,
    /física das explosões/i,
    /química aplicada/i,
    /história/i,
    /geografia/i,
    /matemática/i,
    /literatura/i,
    /artes/i,
    /programação ética/i,
    /saúde e bem-estar/i,
    /meio ambiente/i,
    /sustentabilidade/i
  ];

  // Verificar se é conteúdo educacional apropriado primeiro
  for (const pattern of educationalPatterns) {
    if (pattern.test(lowerTopic)) {
      return {
        isInappropriate: false,
        confidence: 0.9,
        categories: [],
        reasoning: 'Conteúdo educacional apropriado e científico'
      };
    }
  }

  for (const { pattern, category } of inappropriatePatterns) {
    if (pattern.test(lowerTopic)) {
      const educationalAlternatives = {
        'Conteúdo Sexual Explícito': 'educação sexual responsável e biologia',
        'Explosivos e Perigosos': 'química e física aplicadas de forma segura',
        'Substâncias Ilícitas': 'biologia e como o corpo funciona',
        'Violência e Armas': 'resolução pacífica de conflitos e comunicação',
        'Atividades Ilegais': 'tecnologia construtiva e ética digital',
        'Conteúdo Prejudicial': 'saúde mental e bem-estar',
        'Conteúdo de Ódio': 'diversidade e inclusão'
      };

      const educationalAlternative = educationalAlternatives[category as keyof typeof educationalAlternatives] || 'conteúdos educacionais apropriados';
      const suggestedResponse = `Não posso fornecer informações sobre este tópico. Que tal aprendermos sobre ${educationalAlternative}? Se você tem dúvidas importantes, recomendo conversar com seus pais, professores ou outros adultos responsáveis.`;

      return {
        isInappropriate: true,
        confidence: 0.8,
        categories: [category],
        reasoning: `Conteúdo inadequado detectado: ${category}`,
        educationalAlternative,
        suggestedResponse
      };
    }
  }

  return {
    isInappropriate: false,
    confidence: 0.7,
    categories: [],
    reasoning: 'Conteúdo parece apropriado para ambiente educacional'
  };
}

/**
 * Função de conveniência para verificar se conteúdo é inadequado
 */
export async function isContentInappropriate(topic: string): Promise<boolean> {
  const result = await classifyContentWithAI(topic);
  return result.isInappropriate && result.confidence > 0.6;
}

/**
 * Função para obter resposta educacional para conteúdo inadequado
 */
export async function getEducationalResponse(topic: string): Promise<string | null> {
  const result = await classifyContentWithAI(topic);
  
  if (result.isInappropriate && result.suggestedResponse) {
    return result.suggestedResponse;
  }
  
  return null;
}
