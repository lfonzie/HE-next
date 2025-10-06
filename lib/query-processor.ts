/**
 * Processador Inteligente de Queries com IA
 * Corrige erros de português, extrai tema principal e traduz para inglês
 */

import { generateText } from 'ai';
import { grok } from '@/lib/providers/grok-ai-sdk';

export interface ProcessedQuery {
  originalQuery: string;
  correctedQuery: string;
  extractedTheme: string;
  translatedTheme: string;
  confidence: number;
  corrections: string[];
  language: 'pt' | 'en' | 'mixed';
}

export class IntelligentQueryProcessor {
  private grokModel = grok('grok-4-fast-reasoning');

  /**
   * Processa uma query usando IA para extrair o tema principal
   */
  async processQuery(query: string): Promise<ProcessedQuery> {
    try {
      console.log(`🧠 Processando query com Grok 4 Fast: "${query}"`);

      const prompt = `
Analise esta pergunta educacional e extraia APENAS o tema principal para busca de imagens.

PERGUNTA: "${query}"

TAREFAS:
1. Corrija erros de português se houver
2. Extraia APENAS o tema/conceito principal (remova palavras como "como funciona", "o que é", "definição", etc.)
3. Traduza o tema para inglês
4. Calcule confiança da extração (0-100)

EXEMPLOS:
- "como funciona a fotossíntese" → tema: "fotossíntese" → inglês: "photosynthesis"
- "o que é gravidade" → tema: "gravidade" → inglês: "gravity"
- "definição de matemática" → tema: "matemática" → inglês: "mathematics"
- "como funciona a fotosinste" → tema: "fotossíntese" → inglês: "photosynthesis"

Responda APENAS em JSON:
{
  "correctedQuery": "query corrigida",
  "extractedTheme": "tema extraído",
  "translatedTheme": "tema em inglês",
  "confidence": 85,
  "corrections": ["lista de correções feitas"],
  "language": "pt"
}`;

      const result = await generateText({
        model: this.grokModel,
        prompt,
        temperature: 0.3
      });

      const response = result.text.trim();
      console.log(`🤖 Resposta do Grok 4 Fast: ${response}`);

      // Tentar extrair JSON da resposta
      let processedData: any;
      try {
        // Limpar a resposta e extrair JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          processedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.warn('Erro ao fazer parse do JSON, usando fallback:', parseError);
        processedData = this.createFallbackResponse(query);
      }

      const processedQuery: ProcessedQuery = {
        originalQuery: query,
        correctedQuery: processedData.correctedQuery || query,
        extractedTheme: processedData.extractedTheme || query,
        translatedTheme: processedData.translatedTheme || query,
        confidence: processedData.confidence || 70,
        corrections: processedData.corrections || [],
        language: processedData.language || 'pt'
      };

      console.log(`✅ Query processada:`, {
        original: query,
        extracted: processedQuery.extractedTheme,
        translated: processedQuery.translatedTheme,
        confidence: processedQuery.confidence
      });

      return processedQuery;

    } catch (error) {
      console.error('Erro no processamento com IA:', error);
      return this.createFallbackResponse(query);
    }
  }

  /**
   * Cria resposta de fallback quando a IA falha
   */
  private createFallbackResponse(query: string): ProcessedQuery {
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

    // Traduzir para inglês
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
      'magnetismo': 'magnetism'
    };

    const translatedTheme = translations[extractedTheme] || extractedTheme;

    return {
      originalQuery: query,
      correctedQuery,
      extractedTheme,
      translatedTheme,
      confidence: corrections.length > 0 ? 75 : 60,
      corrections,
      language: 'pt'
    };
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
