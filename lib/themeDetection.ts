// lib/themeDetection.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ThemeDetectionResult {
  theme: string;
  englishTheme: string;
  confidence: number;
  category: string;
}

/**
 * Detecta o tema principal de uma consulta educacional
 */
export async function detectTheme(query: string, subject?: string): Promise<ThemeDetectionResult> {
  try {
    const prompt = `Analise a seguinte consulta educacional e extraia o tema principal:

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL

Consulta: "${query}"
Disciplina: ${subject || 'Não especificada'}

Extraia APENAS o tema principal em português e sua tradução para inglês. Responda em formato JSON:

{
  "theme": "tema em português",
  "englishTheme": "theme in english",
  "confidence": 0.95,
  "category": "categoria (ciencias, matematica, historia, etc)"
}

Exemplos:
- "Aula sobre fotossíntese" → {"theme": "fotossíntese", "englishTheme": "photosynthesis", "confidence": 0.98, "category": "ciencias"}
- "Como funciona a divisão celular?" → {"theme": "divisão celular", "englishTheme": "cell division", "confidence": 0.95, "category": "ciencias"}
- "Explicar equações de segundo grau" → {"theme": "equações de segundo grau", "englishTheme": "quadratic equations", "confidence": 0.92, "category": "matematica"}

IMPORTANTE: Responda APENAS com JSON válido, sem formatação markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um especialista em análise de conteúdo educacional. Extraia temas de forma precisa e consistente." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Limpar possível formatação markdown
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(cleanedResponse);
    
    // Validar resultado
    if (!result.theme || !result.englishTheme) {
      throw new Error('Resultado inválido da detecção de tema');
    }

    return {
      theme: result.theme,
      englishTheme: result.englishTheme,
      confidence: result.confidence || 0.8,
      category: result.category || 'geral'
    };

  } catch (error) {
    console.error('Erro na detecção de tema:', error);
    
    // Fallback: extrair tema simples da query
    const fallbackTheme = extractSimpleTheme(query);
    return {
      theme: fallbackTheme,
      englishTheme: fallbackTheme,
      confidence: 0.5,
      category: subject || 'geral'
    };
  }
}

/**
 * Extrai tema simples da query como fallback
 */
function extractSimpleTheme(query: string): string {
  // Remover palavras comuns e extrair palavras-chave
  const commonWords = ['aula', 'sobre', 'explicar', 'como', 'funciona', 'o que é', 'definição', 'conceito'];
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  return words.slice(0, 3).join(' ') || query.slice(0, 20);
}

/**
 * Traduz tema para inglês usando OpenAI
 */
export async function translateThemeToEnglish(theme: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `Você é um tradutor especializado em termos educacionais. Traduza apenas o termo principal para inglês, sem explicações.

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL` 
        },
        { 
          role: "user", 
          content: `Traduza este tema educacional para inglês: "${theme}". Responda apenas com a tradução.` 
        }
      ],
      temperature: 0.1,
      max_tokens: 50,
    });

    const translation = completion.choices[0]?.message?.content?.trim();
    return translation || theme;

  } catch (error) {
    console.error('Erro na tradução:', error);
    return theme;
  }
}
