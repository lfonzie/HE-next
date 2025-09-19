import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema para validação da saída do classificador
const ClassificationSchema = z.object({
  module: z.enum([
    'professor',
    'aula_expandida', 
    'enem_interativo',
    'aula_interativa',
    'enem',
    'ti_troubleshooting',
    'faq_escola',
    'financeiro',
    'rh',
    'coordenacao',
    'bem_estar',
    'social_media',
    'conteudo_midia',
    'atendimento'
  ]),
  complexity: z.enum(['simples', 'media', 'complexa']),
  confidence: z.number().min(0).max(1),
  scores: z.object({
    atendimento: z.number().min(0).max(1),
    professor: z.number().min(0).max(1),
    aula_expandida: z.number().min(0).max(1),
    enem_interativo: z.number().min(0).max(1),
    aula_interativa: z.number().min(0).max(1),
    enem: z.number().min(0).max(1),
    ti_troubleshooting: z.number().min(0).max(1),
    faq_escola: z.number().min(0).max(1),
    financeiro: z.number().min(0).max(1),
    rh: z.number().min(0).max(1),
    coordenacao: z.number().min(0).max(1),
    bem_estar: z.number().min(0).max(1),
    social_media: z.number().min(0).max(1),
    conteudo_midia: z.number().min(0).max(1)
  }),
  rationale: z.string(),
  provider_hint: z.enum(['openai', 'anthropic', 'gemini', 'groq']).optional()
});

type ClassificationResult = z.infer<typeof ClassificationSchema>;

// Constantes
const CLASSIFICATION_THRESHOLD = 0.65;

// Heurísticas de alta precisão em português
const PORTUGUESE_HEURISTICS = {
  enem: /\b(enem|simulado|tri|prova objetiva|redação|questões de múltipla escolha|gabarito)\b/i,
  professor: /\b(dúvida|explicação|conceito|matéria|disciplina|geometria|álgebra|física|química|biologia|história|geografia)\b/i,
  social_media: /\b(post|rede social|instagram|facebook|tiktok|youtube|conteúdo digital)\b/i,
  financeiro: /\b(pagamento|boleto|mensalidade|financeiro|valor|preço|custo)\b/i,
  quiz: /\b(quiz|acertos|percentual|pontuação|correção)\b/i,
  aula_interativa: /\b(aula interativa|slides|explicação passo a passo|atividade|demonstração)\b/i
};

function applyHeuristics(message: string): string | null {
  const messageLower = message.toLowerCase();
  
  for (const [module, pattern] of Object.entries(PORTUGUESE_HEURISTICS)) {
    if (pattern.test(messageLower)) {
      console.log(`🎯 [HEURISTIC] Matched module '${module}' for message: "${message.substring(0, 50)}..."`);
      return module;
    }
  }
  
  return null;
}

function calculateScoreAnalysis(scores: Record<string, number>) {
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a);
  
  const [topModule, topScore] = sortedScores[0];
  const [, secondScore] = sortedScores[1] || [null, 0];
  
  return {
    picked: topModule,
    confidence: topScore,
    deltaToSecond: topScore - secondScore,
    scores,
    isCloseCall: (topScore - secondScore) < 0.05
  };
}

// Cache simplificado
const classificationCache = new Map<string, { result: any; timestamp: number }>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let source = 'fallback';
  let confidence = 0;
  let scores = {};
  
  try {
    const { userMessage, history = [], currentModule = 'auto' } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'userMessage is required' },
        { status: 400 }
      );
    }

    // Calcular messageCount a partir do payload recebido
    const messageCount = history.length + 1; // +1 para a mensagem atual
    
    console.log(`🔍 [CLASSIFY] msg="${userMessage.substring(0, 30)}..." messageCount=${messageCount}`);

    // 1. Override do cliente (se veio com módulo explícito)
    if (currentModule && currentModule !== 'auto') {
      console.log(`🎯 [CLIENT_OVERRIDE] Using client module: ${currentModule}`);
      return NextResponse.json({
        success: true,
        classification: {
          module: currentModule.toUpperCase(),
          confidence: 1.0,
          scores: { [currentModule]: 1.0 },
          rationale: 'Client override',
          complexity: 'simples'
        },
        source: 'client_override',
        messageCount,
        timestamp: new Date().toISOString(),
        cached: false
      });
    }

    // Cache key incluindo messageCount
    const cacheKey = `${userMessage.toLowerCase().trim()}_${messageCount}`;
    const cached = classificationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min
      console.log(`🚀 [CACHE_HIT] Found cached classification`);
      return NextResponse.json({
        ...cached.result,
        cached: true
      });
    }

    // 2. Heurísticas de alta precisão
    const heuristicResult = applyHeuristics(userMessage);
    
    // 3. Classificador IA
    let aiResult: ClassificationResult | null = null;
    let aiError = null;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `Você é um classificador especializado em mensagens educacionais. Classifique cada mensagem no módulo mais específico e apropriado.

IMPORTANTE: Retorne um JSON com:
- module: o módulo escolhido
- confidence: número entre 0 e 1
- scores: objeto com score para TODOS os módulos (0-1, soma = 1)
- rationale: explicação da escolha
- complexity: 'simples', 'media', ou 'complexa'

MÓDULOS DISPONÍVEIS:

PROFESSOR: Para QUALQUER dúvida acadêmica, conceito, exercício, matéria escolar
- Matemática, física, química, biologia, história, geografia, português, inglês, artes
- Redação, literatura, gramática, interpretação de texto, produção textual
- Conceitos acadêmicos, teorias, fórmulas, exercícios, provas, simulados
- Exemplos: "como resolver equação", "história do Brasil", "redação ENEM", "fórmula de Bhaskara", "dúvida de geometria", "explicar conceito", "ajuda com exercício", "explique detalhadamente a revolução"

AULA_EXPANDIDA: Solicitações por aulas completas ou detalhadas
- Exemplos: "quero uma aula expandida sobre fotossíntese", "aula completa de matemática", "aula detalhada sobre"

ENEM_INTERATIVO: Solicitações por simulados ENEM interativos
- Exemplos: "quero um enem interativo", "simulado com explicações detalhadas", "simulado ENEM"

AULA_INTERATIVA: Solicitações por aulas interativas ou dinâmicas
- Exemplos: "aula interativa", "aula dinâmica", "aula participativa"

ENEM: Simulados rápidos ou questões ENEM simples
- Exemplos: "simulado rápido", "questões ENEM", "prova rápida"

BEM_ESTAR: Apoio emocional, ansiedade, conflitos, saúde mental
- Exemplos: "estou ansioso", "conflito com colega", "apoio emocional", "estresse"

TI_TROUBLESHOOTING: Problemas técnicos, equipamentos, sistemas
- Exemplos: "projetor não funciona", "internet lenta", "login não funciona"

FAQ_ESCOLA: Perguntas frequentes sobre a escola, documentos, procedimentos
- Exemplos: "horário de funcionamento", "como funciona a matrícula", "documentos necessários"

FINANCEIRO: Pagamentos de alunos/famílias
- Exemplos: "mensalidade", "boleto", "pagamento", "desconto"

RH: Questões de funcionários/colaboradores
- Exemplos: "benefícios disponíveis", "saldo de férias", "atestado médico", "salário"

COORDENACAO: Gestão pedagógica, calendário escolar
- Exemplos: "calendário de provas", "coordenador pedagógico", "gestão acadêmica"

SOCIAL_MEDIA: Criação de conteúdo para redes sociais
- Exemplos: "criar post", "post social media", "destacar conquistas", "instagram", "facebook"

CONTEUDO_MIDIA: Solicitações por conteúdo visual, imagens, diagramas
- Exemplos: "preciso de uma imagem", "diagrama de fotossíntese", "gráfico", "ilustração"

ATENDIMENTO: APENAS quando não se encaixa em nenhum módulo específico
- Exemplos: "informações gerais", "dúvidas básicas", "primeiro contato", "ajuda geral"

REGRAS CRÍTICAS:
1. PROFESSOR: Para QUALQUER dúvida acadêmica, conceito, exercício, matéria escolar
2. Se a mensagem contém palavras como "explique", "como funciona", "conceito", "dúvida", "exercício", "ajuda com", "como resolver", "fórmula", "geometria", "álgebra", "trigonometria", "cálculo", "derivada", "integral", "equação", "função", "teorema", "demonstração", "prova", "análise", "síntese", "comparar", "explicar detalhadamente", "processo complexo", "estatística", "probabilidade", "vetores", "matriz", "logaritmo", "exponencial", "limite", "continuidade" → SEMPRE PROFESSOR
3. Se a mensagem contém termos acadêmicos como "história", "matemática", "física", "química", "biologia", "geografia", "português", "literatura", "redação", "revolução", "guerra", "independência", "evolução", "fotossíntese" E também contém "explique", "como", "dúvida", "conceito" → PROFESSOR
4. ATENDIMENTO: APENAS quando não se encaixa em nenhum módulo específico

IMPORTANTE: Seja específico! Escolha o módulo mais adequado baseado no contexto completo da mensagem, não ATENDIMENTO.`
          },
          {
            role: "user",
            content: `Mensagem: "${userMessage}"\nHistórico: ${history.length} mensagens`
          }
        ],
        response_format: { type: "json_object" }
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);
      
      // Validar com Zod
      const validationResult = ClassificationSchema.safeParse(parsed);
      
      if (validationResult.success) {
        aiResult = validationResult.data;
        source = 'classifier';
        confidence = aiResult.confidence;
        scores = aiResult.scores;
        
        console.log(`🤖 [AI_SUCCESS] module=${aiResult.module} confidence=${aiResult.confidence}`);
      } else {
        console.warn(`⚠️ [SCHEMA_FAIL] AI returned invalid schema:`, validationResult.error.errors);
        aiError = 'schema_validation_failed';
      }
      
    } catch (error) {
      console.error(`❌ [AI_ERROR] OpenAI call failed:`, error);
      aiError = 'openai_failed';
    }

    // 4. Lógica de decisão com prioridade
    let finalModule = 'atendimento';
    let finalConfidence = 0.0;
    let finalScores = { atendimento: 1.0 };
    let finalRationale = 'Fallback default';
    
    if (aiResult && aiResult.confidence >= CLASSIFICATION_THRESHOLD) {
      // IA com confiança alta
      finalModule = aiResult.module;
      finalConfidence = aiResult.confidence;
      finalScores = aiResult.scores;
      finalRationale = aiResult.rationale;
      source = 'classifier';
    } else if (heuristicResult) {
      // Heurística quebra empate ou substitui IA com baixa confiança
      finalModule = heuristicResult;
      finalConfidence = 0.8;
      finalScores = { [heuristicResult]: 0.8, atendimento: 0.2 };
      finalRationale = 'Heuristic pattern match';
      source = 'heuristic';
    } else if (aiResult) {
      // IA com confiança baixa, mas melhor que fallback
      const analysis = calculateScoreAnalysis(aiResult.scores);
      if (analysis.isCloseCall) {
        finalModule = 'atendimento';
        finalConfidence = 0.5;
        finalScores = { atendimento: 0.5 };
        finalRationale = 'Low confidence, close call';
        source = 'fallback';
      } else {
        finalModule = aiResult.module;
        finalConfidence = aiResult.confidence;
        finalScores = aiResult.scores;
        finalRationale = aiResult.rationale;
        source = 'classifier_low_conf';
      }
    }

    const result = {
      success: true,
      classification: {
        module: finalModule.toUpperCase(),
        confidence: finalConfidence,
        scores: finalScores,
        rationale: finalRationale,
        complexity: aiResult?.complexity || 'simples'
      },
      source,
      messageCount,
      model: "gpt-4o-mini",
      timestamp: new Date().toISOString(),
      cached: false,
      latency: Date.now() - startTime
    };

    // Cache result
    classificationCache.set(cacheKey, { result, timestamp: Date.now() });

    // Telemetria compacta
    const scoreAnalysis = calculateScoreAnalysis(finalScores);
    console.log(`[CLASSIFY] msg=${userMessage.substring(0, 20)}... module=${finalModule} src=${source} conf=${finalConfidence.toFixed(2)} delta=${scoreAnalysis.deltaToSecond.toFixed(2)} msgCount=${messageCount} latency=${Date.now() - startTime}ms`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [CLASSIFY] Fatal error:', error);
    
    const fallbackResult = {
      success: false,
      classification: {
        module: "ATENDIMENTO",
        confidence: 0.0,
        scores: { atendimento: 1.0 },
        rationale: "Fatal error fallback",
        complexity: 'simples'
      },
      source: 'error_fallback',
      error: error.message,
      timestamp: new Date().toISOString(),
      cached: false
    };

    console.log(`[CLASSIFY] msg=ERROR module=atendimento src=error_fallback conf=0.00 msgCount=unknown latency=${Date.now() - startTime}ms`);

    return NextResponse.json(fallbackResult);
  }
}