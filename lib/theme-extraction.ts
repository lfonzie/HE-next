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
 * Traduz o tema principal para inglês usando AI e expande com termos relacionados
 */
export async function translateThemeToEnglish(mainTheme: string): Promise<string> {
  try {
    const prompt = `
Traduza o seguinte tema científico/educacional do português para inglês e inclua termos relacionados e sinônimos.

Para cada tema, inclua:
1. O termo principal em inglês
2. Termos relacionados cientificamente
3. Sinônimos técnicos
4. Conceitos associados

Exemplos:
- "respiração" → "respiration breathing lungs oxygen carbon dioxide respiratory system"
- "fotossíntese" → "photosynthesis plants chlorophyll sunlight carbon dioxide oxygen"
- "célula" → "cell cellular biology membrane nucleus cytoplasm"
- "matemática" → "mathematics math algebra geometry calculus numbers"

Tema: "${mainTheme}"

Responda APENAS com os termos em inglês separados por espaço, sem explicações.
`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.1
    });

    return result.text.trim().toLowerCase();

  } catch (error) {
    console.error('Erro ao traduzir tema:', error);
    
    // Fallback: tradução manual com expansão
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
 * Fallback para tradução manual com expansão semântica
 */
function translateThemeFallback(theme: string): string {
  const translations: Record<string, string> = {
    'respiração': 'respiration breathing lungs oxygen carbon dioxide respiratory system',
    'respiração celular': 'cellular respiration mitochondria atp energy metabolism',
    'respiração aeróbica': 'aerobic respiration oxygen mitochondria atp',
    'fotossíntese': 'photosynthesis plants chlorophyll sunlight carbon dioxide oxygen',
    'independência': 'independence freedom liberation autonomy',
    'brasil': 'brazil brazilian south america portuguese colony',
    'inteligência artificial': 'artificial intelligence ai machine learning neural networks',
    'matemática': 'mathematics math algebra geometry calculus numbers',
    'física': 'physics mechanics energy motion force',
    'química': 'chemistry chemical reactions molecules atoms elements',
    'biologia': 'biology living organisms cells evolution genetics',
    'história': 'history historical events past civilizations',
    'geografia': 'geography earth continents countries landscapes',
    'português': 'portuguese language grammar literature',
    'literatura': 'literature books poetry novels writing',
    'arte': 'art painting drawing sculpture creativity',
    'música': 'music sound rhythm melody harmony',
    'sistema imunológico': 'immune system antibodies white blood cells defense',
    'célula': 'cell cellular biology membrane nucleus cytoplasm',
    'dna': 'dna genetics chromosomes genes heredity',
    'genética': 'genetics genes heredity chromosomes dna',
    'evolução': 'evolution natural selection adaptation species',
    'clima': 'climate weather temperature precipitation atmosphere',
    'relevo': 'relief topography mountains valleys landscapes',
    'paisagem': 'landscape scenery nature environment',
    'continente': 'continent landmass geography earth',
    'oceano': 'ocean sea water marine life',
    'floresta': 'forest trees nature ecosystem wildlife',
    'deserto': 'desert arid dry climate sand',
    'montanha': 'mountain peak elevation geology',
    'rio': 'river water flow stream aquatic',
    'lago': 'lake water body freshwater aquatic',
    'eletricidade': 'electricity electrical current voltage power energy',
    'corrente elétrica': 'electric current flow electrons circuit',
    'voltagem': 'voltage electrical potential difference power',
    'resistência': 'resistance electrical opposition current flow',
    'circuito': 'circuit electrical path components',
    'pulmão': 'lung respiratory breathing oxygen carbon dioxide',
    'coração': 'heart cardiac circulation blood vessels',
    'cérebro': 'brain nervous system neurons thinking',
    'sangue': 'blood circulation red cells white cells plasma',
    'ossos': 'bones skeleton structure calcium',
    'músculos': 'muscles muscular system movement contraction',
    'digestão': 'digestion digestive system stomach intestines',
    'excreção': 'excretion kidneys urinary system waste',
    'reprodução': 'reproduction reproductive system genetics',
    'nutrição': 'nutrition food nutrients vitamins minerals',
    'crescimento': 'growth development increase size',
    'desenvolvimento': 'development growth evolution progress',
    'adaptação': 'adaptation evolution survival environment',
    'ecossistema': 'ecosystem environment organisms interactions',
    'biodiversidade': 'biodiversity species variety life',
    'sustentabilidade': 'sustainability environment conservation future',
    'poluição': 'pollution contamination environment waste',
    'reciclagem': 'recycling waste reuse environment',
    'energia renovável': 'renewable energy solar wind sustainable',
    'aquecimento global': 'global warming climate change temperature',
    'efeito estufa': 'greenhouse effect atmosphere temperature',
    'camada de ozônio': 'ozone layer atmosphere protection',
    'deforestation': 'deforestation trees forest destruction',
    'extinção': 'extinction species disappearance biodiversity',
    'conservação': 'conservation protection preservation environment'
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

