import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export interface ENEMQuestionRequest {
  area: string;
  count: number;
  skill_tags?: string[];
  difficulty?: string[];
  years?: number[];
  style_hints?: string[];
}

export interface ENEMQuestion {
  id?: string;
  area: string;
  year: number;
  disciplina: string;
  skill_tag: string[];
  stem: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  correct: string;
  rationale: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  image_url?: string;
  image_alt?: string;
  source: 'AI' | 'DATABASE' | 'FALLBACK';
}

export interface FewShotExample {
  stem: string;
  options: { a: string; b: string; c: string; d: string; e: string };
  correct: string;
  rationale: string;
  skill_tag: string[];
  difficulty: string;
}

export class ENEMQuestionGenerator {
  private cache = new Map<string, ENEMQuestion[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async generateQuestions(request: ENEMQuestionRequest): Promise<ENEMQuestion[]> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Get few-shot examples
      const examples = await this.getFewShotExamples(request);
      
      // Generate questions
      const questions = await this.callOpenAI(request, examples);
      
      // Cache results
      this.cache.set(cacheKey, questions);
      setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);
      
      return questions;
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.generateFallbackQuestions(request);
    }
  }

  private async getFewShotExamples(request: ENEMQuestionRequest): Promise<FewShotExample[]> {
    const whereClause: any = {
      area: request.area
    };

    if (request.skill_tags?.length) {
      whereClause.skill_tag = { hasSome: request.skill_tags };
    }

    if (request.difficulty?.length) {
      whereClause.difficulty = { in: request.difficulty };
    }

    if (request.years?.length) {
      whereClause.year = { in: request.years };
    }

    const examples = await prisma.enemQuestion.findMany({
      where: whereClause,
      take: 3,
      orderBy: { created_at: 'desc' }
    });

    return examples.map(ex => ({
      stem: ex.stem,
      options: { a: ex.a, b: ex.b, c: ex.c, d: ex.d, e: ex.e },
      correct: ex.correct,
      rationale: ex.rationale || 'Explicação não disponível',
      skill_tag: ex.skill_tag,
      difficulty: ex.difficulty
    }));
  }

  private async callOpenAI(request: ENEMQuestionRequest, examples: FewShotExample[]): Promise<ENEMQuestion[]> {
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request, examples);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content generated');

    const parsed = JSON.parse(content);
    return this.validateAndFormatQuestions(parsed.questions || [], request);
  }

  private buildSystemPrompt(request: ENEMQuestionRequest): string {
    return `Você é um especialista em questões do ENEM (Exame Nacional do Ensino Médio). Sua missão é gerar questões autênticas e educativas.

REGRAS OBRIGATÓRIAS:
1. Sempre retorne JSON válido com array "questions"
2. Use linguagem clara e brasileira
3. Alinhe com a BNCC (Base Nacional Comum Curricular)
4. Varie níveis de dificuldade conforme solicitado
5. Inclua competências e habilidades específicas
6. Evite repetir subassuntos no mesmo lote
7. Use formato oficial ENEM (5 alternativas A-E)

FORMATO DE RESPOSTA:
{
  "questions": [
    {
      "area": "${request.area}",
      "year": 2023,
      "disciplina": "disciplina específica",
      "skill_tag": ["competência1", "competência2"],
      "stem": "Enunciado da questão",
      "a": "Alternativa A",
      "b": "Alternativa B",
      "c": "Alternativa C", 
      "d": "Alternativa D",
      "e": "Alternativa E",
      "correct": "A",
      "rationale": "Explicação detalhada da resposta",
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ]
}`;
  }

  private buildUserPrompt(request: ENEMQuestionRequest, examples: FewShotExample[]): string {
    let prompt = `Gere ${request.count} questões para a área ${request.area}.\n\n`;

    if (examples.length > 0) {
      prompt += 'EXEMPLOS DE REFERÊNCIA:\n';
      examples.forEach((ex, index) => {
        prompt += `\nExemplo ${index + 1}:\n`;
        prompt += `Enunciado: ${ex.stem}\n`;
        prompt += `A) ${ex.options.a}\n`;
        prompt += `B) ${ex.options.b}\n`;
        prompt += `C) ${ex.options.c}\n`;
        prompt += `D) ${ex.options.d}\n`;
        prompt += `E) ${ex.options.e}\n`;
        prompt += `Resposta: ${ex.correct}\n`;
        prompt += `Habilidades: ${ex.skill_tag.join(', ')}\n`;
        prompt += `Dificuldade: ${ex.difficulty}\n`;
        prompt += '---\n';
      });
    }

    if (request.skill_tags?.length) {
      prompt += `\nFoque nas habilidades: ${request.skill_tags.join(', ')}\n`;
    }

    if (request.difficulty?.length) {
      prompt += `\nNíveis de dificuldade: ${request.difficulty.join(', ')}\n`;
    }

    if (request.years?.length) {
      prompt += `\nEstilo dos anos: ${request.years.join(', ')}\n`;
    }

    prompt += '\nRetorne apenas JSON válido.';
    return prompt;
  }

  private validateAndFormatQuestions(rawQuestions: any[], request: ENEMQuestionRequest): ENEMQuestion[] {
    return rawQuestions.map((q, index) => ({
      area: q.area || request.area,
      year: q.year || 2023,
      disciplina: q.disciplina || 'Geral',
      skill_tag: Array.isArray(q.skill_tag) ? q.skill_tag : ['geral'],
      stem: q.stem || `Questão ${index + 1}`,
      a: q.a || 'Alternativa A',
      b: q.b || 'Alternativa B',
      c: q.c || 'Alternativa C',
      d: q.d || 'Alternativa D',
      e: q.e || 'Alternativa E',
      correct: ['A', 'B', 'C', 'D', 'E'].includes(q.correct) ? q.correct : 'A',
      rationale: q.rationale || 'Explicação não disponível',
      difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty) ? q.difficulty : 'MEDIUM',
      source: 'AI' as const
    }));
  }

  private generateFallbackQuestions(request: ENEMQuestionRequest): ENEMQuestion[] {
    return Array(request.count).fill(null).map((_, index) => ({
      area: request.area,
      year: 2023,
      disciplina: 'Exemplo',
      skill_tag: ['exemplo'],
      stem: `Questão ${index + 1}: Esta é uma questão de exemplo para manter o fluxo do simulador. Qual é a resposta correta?`,
      a: 'Opção A',
      b: 'Opção B',
      c: 'Opção C',
      d: 'Opção D',
      e: 'Opção E',
      correct: 'A',
      rationale: 'Esta é uma questão de exemplo para manter o fluxo do simulador.',
      difficulty: 'MEDIUM' as const,
      source: 'FALLBACK' as const
    }));
  }

  private generateCacheKey(request: ENEMQuestionRequest): string {
    return JSON.stringify({
      area: request.area,
      count: request.count,
      skill_tags: request.skill_tags?.sort(),
      difficulty: request.difficulty?.sort(),
      years: request.years?.sort()
    });
  }

  // Batch processing with progress tracking
  async generateBatchWithProgress(
    request: ENEMQuestionRequest,
    batchSize: number = 3,
    onProgress?: (progress: { completed: number; total: number; currentBatch: ENEMQuestion[] }) => void
  ): Promise<ENEMQuestion[]> {
    const allQuestions: ENEMQuestion[] = [];
    const totalBatches = Math.ceil(request.count / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const currentBatchSize = Math.min(batchSize, request.count - allQuestions.length);
      const batchRequest = { ...request, count: currentBatchSize };
      
      const batchQuestions = await this.generateQuestions(batchRequest);
      allQuestions.push(...batchQuestions);

      if (onProgress) {
        onProgress({
          completed: allQuestions.length,
          total: request.count,
          currentBatch: batchQuestions
        });
      }

      // Small delay between batches to avoid rate limiting
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allQuestions;
  }
}

// Singleton instance
export const enemGenerator = new ENEMQuestionGenerator();
