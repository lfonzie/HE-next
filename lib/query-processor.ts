/**
 * Processador Inteligente de Queries com IA
 * 
 * ESTRATÉGIA: SEMPRE USA IA (Grok 4 Fast Reasoning)
 * - 3 tentativas automáticas com Grok antes de qualquer fallback
 * - Valida se a tradução está em inglês, retry se detectar português
 * - Fallback manual APENAS em caso de falha total da IA após múltiplas tentativas
 * - Confiança reduzida (40-50%) quando usa fallback vs IA (70-95%)
 * 
 * Funcionalidades:
 * ✅ Corrige erros de português automaticamente
 * ✅ Extrai tema principal removendo palavras desnecessárias
 * ✅ Traduz para inglês de forma precisa usando IA
 * ✅ Calcula confiança da extração (0-100)
 * ✅ Retry automático em caso de falhas temporárias
 * ✅ Validação de tradução para garantir inglês correto
 */

import { generateText } from 'ai';
import { grok } from '@/lib/providers/grok-ai-sdk';
import { openai } from '@ai-sdk/openai';

export interface ProcessedQuery {
  originalQuery: string;
  correctedQuery: string;
  extractedTheme: string;
  translatedTheme: string;
  confidence: number;
  corrections: string[];
  language: 'pt' | 'en' | 'mixed';
  usedProvider?: 'grok' | 'openai' | 'fallback';
}

export class IntelligentQueryProcessor {
  private grokModel = grok('grok-4-fast-reasoning');
  private openaiModel = openai('gpt-4o-mini');
  private maxRetries = 3; // Máximo de tentativas com Grok

  /**
   * Processa uma query usando IA para extrair o tema principal
   * SEMPRE usa IA (Grok primeiro, depois OpenAI) com múltiplas tentativas antes de fallback manual
   */
  async processQuery(query: string): Promise<ProcessedQuery> {
    console.log(`🧠 Processando query com IA (SEMPRE IA): "${query}"`);

    // 1. Tentar com Grok múltiplas vezes
    const grokResult = await this.tryWithGrok(query);
    if (grokResult) {
      return { ...grokResult, usedProvider: 'grok' };
    }

    // 2. Se Grok falhar, tentar com OpenAI GPT-4o-mini
    console.log(`🔄 Grok falhou após ${this.maxRetries} tentativas, tentando OpenAI GPT-4o-mini...`);
    const openaiResult = await this.tryWithOpenAI(query);
    if (openaiResult) {
      return { ...openaiResult, usedProvider: 'openai' };
    }

    // 3. Apenas como último recurso, usar fallback manual
    console.error('❌ TODAS as IAs falharam (Grok + OpenAI), usando fallback manual');
    return { ...this.createFallbackResponse(query), usedProvider: 'fallback' };
  }

  /**
   * Tenta processar query com Grok
   */
  private async tryWithGrok(query: string): Promise<ProcessedQuery | null> {
    console.log(`🧠 Tentando com Grok 4 Fast...`);
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa Grok ${attempt}/${this.maxRetries}...`);

        const prompt = this.buildProcessingPrompt(query);

        const result = await generateText({
          model: this.grokModel as any, // Type assertion for custom model
          prompt,
          temperature: 0.2,
          maxTokens: 500
        });

        // ✅ FIX: Verificar se result existe antes de acessar propriedades
        if (!result || !result.text) {
          console.error(`❌ Grok retornou resultado inválido na tentativa ${attempt}`);
          throw new Error('Resultado do Grok está vazio ou inválido');
        }

        const response = result.text.trim();
        console.log(`🤖 Resposta do Grok (tentativa ${attempt}): ${response.substring(0, 200)}...`);

        // Tentar extrair JSON da resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON não encontrado na resposta do Grok');
        }

        const processedData = JSON.parse(jsonMatch[0]);

        // Validar que a tradução está em inglês
        const translatedTheme = processedData.translatedTheme || '';
        const hasPortugueseChars = /[áàâãéèêíïóôõöúçñ]/i.test(translatedTheme);
        
        if (hasPortugueseChars) {
          console.warn(`⚠️ Tradução Grok ainda contém português: "${translatedTheme}", retry...`);
          if (attempt < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }

        const processedQuery: ProcessedQuery = {
          originalQuery: query,
          correctedQuery: processedData.correctedQuery || query,
          extractedTheme: processedData.extractedTheme || query,
          translatedTheme: translatedTheme || query,
          confidence: processedData.confidence || 85,
          corrections: processedData.corrections || [],
          language: processedData.language || 'pt'
        };

        console.log(`✅ Query processada com Grok (tentativa ${attempt}):`, {
          original: query,
          translated: processedQuery.translatedTheme,
          confidence: processedQuery.confidence
        });

        return processedQuery;

      } catch (error) {
        console.error(`❌ Erro Grok tentativa ${attempt}/${this.maxRetries}:`, error);
        
        if (attempt < this.maxRetries) {
          const waitTime = attempt * 1000;
          console.log(`⏳ Aguardando ${waitTime}ms antes de retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
    }

    console.error('❌ Grok falhou após todas as tentativas');
    return null;
  }

  /**
   * Tenta processar query com OpenAI GPT-4o-mini (fallback IA)
   */
  private async tryWithOpenAI(query: string): Promise<ProcessedQuery | null> {
    console.log(`🤖 Tentando com OpenAI GPT-4o-mini como fallback IA...`);
    
    for (let attempt = 1; attempt <= 2; attempt++) { // Menos tentativas com OpenAI
      try {
        console.log(`🔄 Tentativa OpenAI ${attempt}/2...`);

        const prompt = this.buildProcessingPrompt(query);

        const result = await generateText({
          model: this.openaiModel,
          prompt,
          temperature: 0.2,
          maxTokens: 500
        });

        // ✅ FIX: Verificar se result existe
        if (!result || !result.text) {
          console.error(`❌ OpenAI retornou resultado inválido na tentativa ${attempt}`);
          throw new Error('Resultado do OpenAI está vazio ou inválido');
        }

        const response = result.text.trim();
        console.log(`🤖 Resposta do OpenAI (tentativa ${attempt}): ${response.substring(0, 200)}...`);

        // Tentar extrair JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON não encontrado na resposta do OpenAI');
        }

        const processedData = JSON.parse(jsonMatch[0]);

        // Validar tradução em inglês
        const translatedTheme = processedData.translatedTheme || '';
        const hasPortugueseChars = /[áàâãéèêíïóôõöúçñ]/i.test(translatedTheme);
        
        if (hasPortugueseChars && attempt < 2) {
          console.warn(`⚠️ Tradução OpenAI ainda contém português: "${translatedTheme}", retry...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const processedQuery: ProcessedQuery = {
          originalQuery: query,
          correctedQuery: processedData.correctedQuery || query,
          extractedTheme: processedData.extractedTheme || query,
          translatedTheme: translatedTheme || query,
          confidence: processedData.confidence || 80,
          corrections: processedData.corrections || [],
          language: processedData.language || 'pt'
        };

        console.log(`✅ Query processada com OpenAI (tentativa ${attempt}):`, {
          original: query,
          translated: processedQuery.translatedTheme,
          confidence: processedQuery.confidence
        });

        return processedQuery;

      } catch (error) {
        console.error(`❌ Erro OpenAI tentativa ${attempt}/2:`, error);
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
      }
    }

    console.error('❌ OpenAI falhou após todas as tentativas');
    return null;
  }

  /**
   * Constrói o prompt de processamento (usado por ambos Grok e OpenAI)
   */
  private buildProcessingPrompt(query: string): string {
    return `
Analise esta pergunta educacional e extraia APENAS o tema principal para busca de imagens.

PERGUNTA: "${query}"

TAREFAS:
1. Corrija erros de português se houver
2. Extraia APENAS o tema/conceito principal (remova palavras como "como funciona", "o que é", "definição", etc.)
3. Traduza o tema para inglês (MUITO IMPORTANTE - deve ser em inglês perfeito)
4. Calcule confiança da extração (0-100)

EXEMPLOS:
- "como funciona a fotossíntese" → tema: "fotossíntese" → inglês: "photosynthesis"
- "o que é gravidade" → tema: "gravidade" → inglês: "gravity"
- "Causas da Revolução Francesa" → tema: "causas da revolução francesa" → inglês: "french revolution causes"
- "definição de matemática" → tema: "matemática" → inglês: "mathematics"
- "como funciona a fotosinste" → tema: "fotossíntese" → inglês: "photosynthesis"

CRÍTICO: O campo "translatedTheme" DEVE estar em inglês SEMPRE.

Responda APENAS em JSON válido:
{
  "correctedQuery": "query corrigida",
  "extractedTheme": "tema extraído",
  "translatedTheme": "tema em inglês",
  "confidence": 85,
  "corrections": ["lista de correções feitas"],
  "language": "pt"
}`;
  }

  /**
   * Cria resposta de fallback quando a IA falha
   * APENAS USADO EM EMERGÊNCIA - quando Grok falha após múltiplas tentativas
   */
  private createFallbackResponse(query: string): ProcessedQuery {
    console.warn('⚠️ FALLBACK MANUAL ATIVADO - IA não disponível após múltiplas tentativas');
    console.warn('⚠️ A tradução pode não ser tão precisa quanto com IA');
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Correções básicas de português
    const corrections: string[] = [];
    let correctedQuery = query;
    
    // Correções comuns
    const commonCorrections: { [key: string]: string } = {
      'fotosinste': 'fotossíntese',
      'fotossintese': 'fotossíntese',
      'matematica': 'matemática',
      'fisica': 'física',
      'quimica': 'química',
      'biologia': 'biologia',
      'historia': 'história',
      'geografia': 'geografia',
      'literatura': 'literatura',
      'arte': 'arte',
      'musica': 'música',
      'tecnologia': 'tecnologia'
    };

    // Aplicar correções
    for (const [wrong, correct] of Object.entries(commonCorrections)) {
      if (normalizedQuery.includes(wrong)) {
        correctedQuery = correctedQuery.replace(new RegExp(wrong, 'gi'), correct);
        corrections.push(`${wrong} → ${correct}`);
      }
    }

    // Extrair tema removendo palavras desnecessárias
    const stopWords = [
      'como funciona', 'como funciona a', 'como funciona o',
      'o que é', 'o que é a', 'o que é o',
      'definição de', 'definição da', 'definição do',
      'introdução a', 'introdução da', 'introdução do',
      'conceito de', 'conceito da', 'conceito do',
      'o que', 'como', 'definição', 'introdução', 'conceito'
    ];

    let extractedTheme = correctedQuery.toLowerCase();
    for (const stopWord of stopWords) {
      extractedTheme = extractedTheme.replace(new RegExp(stopWord, 'gi'), '').trim();
    }

    // Traduzir para inglês - dicionário expandido
    const translations: { [key: string]: string } = {
      'fotossíntese': 'photosynthesis',
      'gravidade': 'gravity',
      'matemática': 'mathematics',
      'física': 'physics',
      'química': 'chemistry',
      'biologia': 'biology',
      'história': 'history',
      'geografia': 'geography',
      'literatura': 'literature',
      'arte': 'art',
      'música': 'music',
      'tecnologia': 'technology',
      'revolução francesa': 'french revolution',
      'causas da revolução francesa': 'french revolution causes',
      'consequências da revolução francesa': 'french revolution consequences',
      'sistema solar': 'solar system',
      'dna': 'dna',
      'célula': 'cell',
      'átomo': 'atom',
      'molécula': 'molecule',
      'energia': 'energy',
      'força': 'force',
      'movimento': 'motion',
      'ondas': 'waves',
      'eletricidade': 'electricity',
      'magnetismo': 'magnetism',
      'água': 'water',
      'fogo': 'fire',
      'terra': 'earth',
      'ar': 'air'
    };

    // Tentar tradução direta primeiro
    let translatedTheme = translations[extractedTheme];
    
    // Se não encontrar, tentar traduzir palavras individualmente
    if (!translatedTheme) {
      const wordTranslations: { [key: string]: string } = {
        'causas': 'causes',
        'consequências': 'consequences',
        'efeitos': 'effects',
        'origem': 'origin',
        'história': 'history',
        'revolução': 'revolution',
        'francesa': 'french',
        'guerra': 'war',
        'mundial': 'world',
        'segunda': 'second',
        'primeira': 'first',
        'brasil': 'brazil',
        'brasileira': 'brazilian',
        'portuguesa': 'portuguese',
        'independência': 'independence',
        'descobrimento': 'discovery',
        'colonial': 'colonial',
        'império': 'empire',
        'república': 'republic'
      };
      
      // Traduzir palavra por palavra
      const words = extractedTheme.split(' ');
      const translatedWords = words.map(word => 
        wordTranslations[word.toLowerCase()] || word
      );
      translatedTheme = translatedWords.join(' ');
      
      console.log(`🔄 Tradução palavra-por-palavra: "${extractedTheme}" → "${translatedTheme}"`);
    }
    
    // Se ainda está igual ao original, pelo menos adicionar contexto em inglês
    if (translatedTheme === extractedTheme) {
      console.warn(`⚠️ Não foi possível traduzir "${extractedTheme}", usando tema como está`);
    }

    const fallbackResult = {
      originalQuery: query,
      correctedQuery,
      extractedTheme,
      translatedTheme,
      confidence: corrections.length > 0 ? 50 : 40, // Confiança reduzida para fallback
      corrections,
      language: 'pt' as const
    };

    console.warn('⚠️ FALLBACK usado:', {
      original: query,
      translated: translatedTheme,
      confidence: fallbackResult.confidence,
      method: 'manual_dictionary'
    });

    return fallbackResult;
  }

  /**
   * Processa múltiplas queries em lote
   */
  async processQueries(queries: string[]): Promise<ProcessedQuery[]> {
    const results: ProcessedQuery[] = [];
    
    for (const query of queries) {
      try {
        const result = await this.processQuery(query);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao processar query "${query}":`, error);
        results.push(this.createFallbackResponse(query));
      }
    }
    
    return results;
  }
}

/**
 * Função utilitária para processamento rápido
 */
export async function processQueryWithAI(query: string): Promise<ProcessedQuery> {
  const processor = new IntelligentQueryProcessor();
  return await processor.processQuery(query);
}

export default IntelligentQueryProcessor;
