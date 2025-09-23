/**
 * Sistema Inteligente de Extração e Tradução de Temas
 * Extrai o tema principal da pergunta do usuário e traduz para inglês
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface ThemeExtractionResult {
  mainTheme: string;
  translatedTheme: string;
  confidence: number;
  context: string;
}

/**
 * Extrai o tema principal de uma pergunta em português
 * Exemplo: "Como funciona a respiração?" → "respiração"
 */
export async function extractMainTheme(userQuery: string): Promise<ThemeExtractionResult> {
  try {
    const prompt = `
Analise a pergunta do usuário e extraia APENAS o tema principal, sem palavras de conexão.

Exemplos:
- "Como funciona a respiração?" → respiração
- "O que é fotossíntese?" → fotossíntese  
- "Causas da Independência do Brasil" → independência do brasil
- "Como funciona a inteligência artificial?" → inteligência artificial
- "O que é matemática?" → matemática

Pergunta do usuário: "${userQuery}"

Responda APENAS com o tema principal em português, sem explicações.
`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      maxTokens: 50,
      temperature: 0.1
    });

    const mainTheme = result.text.trim().toLowerCase();
    
    return {
      mainTheme,
      translatedTheme: '', // Será preenchido na próxima função
      confidence: 0.9,
      context: userQuery
    };

  } catch (error) {
    console.error('Erro ao extrair tema principal:', error);
    
    // Fallback: extrair manualmente
    const fallbackTheme = extractThemeFallback(userQuery);
    
    return {
      mainTheme: fallbackTheme,
      translatedTheme: '',
      confidence: 0.5,
      context: userQuery
    };
  }
}

/**
 * Traduz o tema principal para inglês usando AI
 */
export async function translateThemeToEnglish(mainTheme: string): Promise<string> {
  try {
    const prompt = `
Traduza o seguinte tema científico/educacional do português para inglês.
Use termos técnicos precisos e comuns em conteúdo educacional.

Tema: "${mainTheme}"

Responda APENAS com a tradução em inglês, sem explicações.
`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      maxTokens: 30,
      temperature: 0.1
    });

    return result.text.trim().toLowerCase();

  } catch (error) {
    console.error('Erro ao traduzir tema:', error);
    
    // Fallback: tradução manual
    return translateThemeFallback(mainTheme);
  }
}

/**
 * Função principal: extrai tema e traduz para inglês
 */
export async function extractAndTranslateTheme(userQuery: string): Promise<ThemeExtractionResult> {
  console.log(`🎯 Extraindo tema de: "${userQuery}"`);
  
  // 1. Extrair tema principal
  const extraction = await extractMainTheme(userQuery);
  console.log(`📝 Tema extraído: "${extraction.mainTheme}"`);
  
  // 2. Traduzir para inglês
  const translatedTheme = await translateThemeToEnglish(extraction.mainTheme);
  console.log(`🌍 Tema traduzido: "${translatedTheme}"`);
  
  return {
    ...extraction,
    translatedTheme
  };
}

/**
 * Fallback para extração manual de tema
 */
function extractThemeFallback(query: string): string {
  // Remover palavras de conexão comuns
  const stopWords = [
    'como', 'funciona', 'o', 'que', 'é', 'são', 'da', 'do', 'das', 'dos',
    'para', 'com', 'em', 'sobre', 'acerca', 'relacionado', 'sobre',
    'causas', 'consequências', 'efeitos', 'tipos', 'exemplos'
  ];
  
  const words = query
    .toLowerCase()
    .replace(/[?¿!¡.,;:]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Retornar as 2-3 palavras mais relevantes
  return words.slice(0, 3).join(' ');
}

/**
 * Fallback para tradução manual
 */
function translateThemeFallback(theme: string): string {
  const translations: Record<string, string> = {
    'respiração': 'respiration',
    'fotossíntese': 'photosynthesis',
    'independência': 'independence',
    'brasil': 'brazil',
    'inteligência artificial': 'artificial intelligence',
    'matemática': 'mathematics',
    'física': 'physics',
    'química': 'chemistry',
    'biologia': 'biology',
    'história': 'history',
    'geografia': 'geography',
    'português': 'portuguese',
    'literatura': 'literature',
    'arte': 'art',
    'música': 'music',
    'sistema imunológico': 'immune system',
    'célula': 'cell',
    'dna': 'dna',
    'genética': 'genetics',
    'evolução': 'evolution',
    'clima': 'climate',
    'relevo': 'relief',
    'paisagem': 'landscape',
    'continente': 'continent',
    'oceano': 'ocean',
    'floresta': 'forest',
    'deserto': 'desert',
    'montanha': 'mountain',
    'rio': 'river',
    'lago': 'lake'
  };
  
  const lowerTheme = theme.toLowerCase();
  
  // Buscar tradução exata
  if (translations[lowerTheme]) {
    return translations[lowerTheme];
  }
  
  // Buscar tradução parcial
  for (const [pt, en] of Object.entries(translations)) {
    if (lowerTheme.includes(pt)) {
      return lowerTheme.replace(pt, en);
    }
  }
  
  // Se não encontrar, retornar o tema original (pode funcionar em alguns casos)
  return lowerTheme;
}

export default {
  extractMainTheme,
  translateThemeToEnglish,
  extractAndTranslateTheme
};

