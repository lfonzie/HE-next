import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, trimHistory } from "../chat-history";

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function toGeminiContent(history: ChatMessage[], input: string, systemPrompt?: string) {
  const trimmed = trimHistory(history);
  const contents = trimmed.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
  }));
  
  contents.push({ role: "user", parts: [{ text: input }] });
  
  // Gemini usa system instruction separada
  return { contents, systemInstruction: systemPrompt };
}

export async function callGemini(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: model === "gemini-2.5-flash" ? "gemini-2.0-flash-exp" : model, // Mapear para modelo disponível
    systemInstruction: systemPrompt
  });
  
  const { contents } = toGeminiContent(history, input, systemPrompt);
  const res = await modelClient.generateContent({ contents });
  
  const text = res.response.text();
  return { 
    text, 
    raw: res,
    usage: res.response.usageMetadata
  };
}

export async function streamGemini(
  model: string,
  history: ChatMessage[],
  input: string,
  systemPrompt?: string
) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: model === "gemini-2.5-flash" ? "gemini-2.0-flash-exp" : model, // Mapear para modelo disponível
    systemInstruction: systemPrompt
  });
  
  const { contents } = toGeminiContent(history, input, systemPrompt);
  const result = await modelClient.generateContentStream({ contents });
  
  return result;
}

export async function generateCuriosities(topic: string) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `Você é um assistente educacional especializado em criar curiosidades interessantes e educativas sobre diversos tópicos. 

Sua tarefa é gerar exatamente 10 curiosidades sobre o tópico fornecido. Cada curiosidade deve:

1. Ser interessante e envolvente
2. Ser educativa e informativa
3. Despertar curiosidade e interesse
4. Ser apropriada para ambiente educacional
5. Variar entre fatos científicos, históricos, culturais ou práticos
6. Ser concisa (máximo 2 frases por curiosidade)
7. Incluir um emoji relevante no início

Formato de resposta: Retorne apenas um JSON válido com a seguinte estrutura:
{
  "curiosities": [
    {
      "text": "emoji + texto da curiosidade",
      "category": "categoria (ex: científico, histórico, cultural, prático)"
    }
  ]
}

Exemplo:
{
  "curiosities": [
    {
      "text": "🧬 O DNA humano é 99.9% idêntico entre todas as pessoas",
      "category": "científico"
    }
  ]
}`
  });

  const prompt = `Gere 10 curiosidades interessantes e educativas sobre: "${topic}"

Certifique-se de que as curiosidades sejam:
- Relevantes ao tópico
- Educativas e informativas
- Apropriadas para ambiente escolar
- Variadas em categorias (científico, histórico, cultural, prático)
- Interessantes e envolventes

Retorne apenas o JSON válido conforme especificado.`;

  try {
    const result = await modelClient.generateContent(prompt);
    const responseText = result.response.text();
    
    // Tentar extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.curiosities || !Array.isArray(parsed.curiosities)) {
      throw new Error('Estrutura JSON inválida');
    }
    
    // Validar e limpar as curiosidades
    const validCuriosities = parsed.curiosities
      .filter((curiosity: any) => 
        curiosity.text && 
        typeof curiosity.text === 'string' && 
        curiosity.text.trim().length > 0
      )
      .map((curiosity: any) => ({
        text: curiosity.text.trim(),
        category: curiosity.category || 'geral'
      }));
    
    if (validCuriosities.length === 0) {
      throw new Error('Nenhuma curiosidade válida encontrada');
    }
    
    console.log(`✅ Geradas ${validCuriosities.length} curiosidades para "${topic}"`);
    return validCuriosities;
    
  } catch (error) {
    console.error('Erro ao gerar curiosidades:', error);
    
    // Fallback: curiosidades genéricas educativas
    const fallbackCuriosities = [
      {
        text: "🧠 O cérebro humano processa informações 200.000 vezes mais rápido que um computador",
        category: "científico"
      },
      {
        text: "📚 A leitura regular pode aumentar a expectativa de vida em até 2 anos",
        category: "científico"
      },
      {
        text: "🎯 Objetivos claros aumentam a probabilidade de sucesso em até 40%",
        category: "prático"
      },
      {
        text: "⚡ Aprendizagem ativa é 6 vezes mais eficaz que aprendizagem passiva",
        category: "científico"
      },
      {
        text: "🎨 Cores podem influenciar o humor e a produtividade no aprendizado",
        category: "científico"
      },
      {
        text: "🏆 Reconhecimento e feedback positivo aumentam a motivação intrínseca",
        category: "prático"
      },
      {
        text: "📊 Repetição espaçada é a técnica mais eficaz para memorização duradoura",
        category: "científico"
      },
      {
        text: "🌱 A curiosidade é o combustível natural do aprendizado e da descoberta",
        category: "prático"
      },
      {
        text: "🎮 Gamificação pode aumentar o engajamento em atividades educacionais em até 90%",
        category: "científico"
      },
      {
        text: "💡 Cada pessoa tem um estilo de aprendizado único - visual, auditivo ou cinestésico",
        category: "científico"
      }
    ];
    
    return fallbackCuriosities;
  }
}

export async function generateTopicIntroduction(topic: string) {
  const genAI = getGeminiClient();
  const modelClient = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `Você é um assistente educacional especializado em criar introduções envolventes e informativas sobre diversos tópicos educacionais.

Sua tarefa é criar uma introdução específica e personalizada sobre o tópico fornecido. A introdução deve:

1. Ser específica ao tópico mencionado
2. Ser envolvente e despertar interesse
3. Ser educativa e informativa
4. Ser apropriada para ambiente educacional
5. Ter entre 2-4 frases, concisa mas completa
6. Explicar a relevância e importância do tópico
7. Preparar o aluno para o aprendizado
8. Usar linguagem clara e acessível

Formato de resposta: Retorne apenas o texto da introdução, sem formatação adicional ou aspas.`
  });

  const prompt = `Crie uma introdução envolvente e específica sobre o tópico: "${topic}"

A introdução deve:
- Ser específica ao tópico mencionado
- Explicar por que este tópico é importante e interessante
- Preparar o aluno para uma experiência de aprendizado envolvente
- Ser concisa mas informativa (2-4 frases)
- Usar linguagem clara e acessível
- Ser apropriada para ambiente educacional

Retorne apenas o texto da introdução, sem formatação adicional.`;

  try {
    const result = await modelClient.generateContent(prompt);
    const introduction = result.response.text().trim();
    
    // Limpar possíveis aspas ou formatação extra
    const cleanIntroduction = introduction.replace(/^["']|["']$/g, '').trim();
    
    if (!cleanIntroduction || cleanIntroduction.length < 50) {
      throw new Error('Introdução muito curta ou inválida');
    }
    
    console.log(`✅ Gerada introdução para "${topic}"`);
    return cleanIntroduction;
    
  } catch (error) {
    console.error('Erro ao gerar introdução:', error);
    
    // Fallback: introdução genérica baseada no tópico
    const fallbackIntroduction = `Esta aula foi cuidadosamente elaborada para proporcionar uma compreensão completa e interativa sobre ${topic}. Você será guiado através de conceitos fundamentais, exemplos práticos e atividades que facilitam o aprendizado e a retenção do conhecimento. Prepare-se para uma experiência educacional envolvente e personalizada!`;
    
    return fallbackIntroduction;
  }
}
