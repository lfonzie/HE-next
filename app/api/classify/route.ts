import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Initialize Google AI client via Vercel AI SDK
const googleModel = google('gemini-1.5-flash');

// Schema para validação da saída do classificador
const ClassificationSchema = z.object({
  module: z.enum([
    'professor',
    'aula_expandida', 
    'enem_interactive',
    'enem',
    'professor_interativo',
    'aula_interativa',
    'ti',
    'ti_suporte',
    'rh',
    'financeiro',
    'coordenacao',
    'bem_estar',
    'social_media',
    'conteudo_midia',
    'atendimento',
    'secretaria',
    'resultados_bolsas',
    'juridico_contratos',
    'marketing_design',
    'pesquisa_tempo_real'
  ]),
  complexity: z.enum(['simples', 'media', 'complexa']),
  confidence: z.number().min(0).max(1),
  scores: z.object({
    atendimento: z.number().min(0).max(1),
    professor: z.number().min(0).max(1),
    aula_expandida: z.number().min(0).max(1),
    enem_interactive: z.number().min(0).max(1),
    enem: z.number().min(0).max(1),
    professor_interativo: z.number().min(0).max(1),
    aula_interativa: z.number().min(0).max(1),
    ti: z.number().min(0).max(1),
    ti_suporte: z.number().min(0).max(1),
    rh: z.number().min(0).max(1),
    financeiro: z.number().min(0).max(1),
    coordenacao: z.number().min(0).max(1),
    bem_estar: z.number().min(0).max(1),
    social_media: z.number().min(0).max(1),
    conteudo_midia: z.number().min(0).max(1),
    secretaria: z.number().min(0).max(1),
    resultados_bolsas: z.number().min(0).max(1),
    juridico_contratos: z.number().min(0).max(1),
    marketing_design: z.number().min(0).max(1),
    pesquisa_tempo_real: z.number().min(0).max(1)
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
  professor: /\b(dúvida|explicação|conceito|matéria|disciplina|geometria|álgebra|física|química|biologia|história|geografia|me ajude com.*dúvida|tirar uma dúvida|ajuda com.*exercício|como resolver|fórmula|teorema|demonstração|prova|análise|síntese|comparar|explicar detalhadamente|processo complexo|estatística|probabilidade|vetores|matriz|logaritmo|exponencial|limite|continuidade)\b/i,
  social_media: /\b(post|rede social|instagram|facebook|tiktok|youtube|conteúdo digital|marketing digital|postagem|compartilhar nas redes)\b/i,
  financeiro: /\b(pagamento|boleto|mensalidade|financeiro|valor|preço|custo|desconto|parcelamento|taxa de matrícula)\b/i,
  aula_interativa: /\b(aula interativa|slides|explicação passo a passo|atividade|demonstração)\b/i,
  ti: /\b(projetor|internet|lenta|login|não funciona|configurar|impressora|bug|sistema|computador|travou|build|deploy|render|porta|log|404|405|nextauth|rota|api)\b/i,
  rh: /\b(benefícios|férias|atestado|médico|salário|treinamento|carreira|promoção|recursos humanos|colaboradores|funcionários)\b/i,
  coordenacao: /\b(calendário|provas|coordenador|pedagógico|gestão|acadêmica|planejamento|pedagógico|metodologia|ensino)\b/i,
  bem_estar: /\b(ansioso|conflito|colega|apoio|emocional|estresse|depressão|bullying|conflito|familiar|saúde|mental)\b/i,
  secretaria: /\b(matrícula|matrícula|documentos|horário|horário|secretaria|whats|procedimentos|administrativos)\b/i,
  resultados_bolsas: /\b(prova de bolsas|resultado|percentual|bolsa|bolsas|cálculo|desconto|bolsa de estudo)\b/i,
  juridico_contratos: /\b(contrato|jurídico|termo|legal|documentos|legais|acordo|cláusula|contratação)\b/i,
  marketing_design: /\b(marketing|design|campanha|publicidade|branding|identidade|visual|material|promocional)\b/i,
  conteudo_midia: /\b(preciso de uma imagem|diagrama|gráfico|ilustração|infográfico|conteúdo visual|material visual)\b/i
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
  const timestamp = new Date().toISOString();
  let source = 'fallback';
  let confidence = 0;
  let scores = {};
  
  console.log(`🚀 [CLASSIFY] START - ${timestamp}`);
  
  try {
    const parseStart = Date.now();
    const { userMessage, history = [], currentModule = 'auto' } = await request.json();
    const parseTime = Date.now() - parseStart;
    console.log(`⏱️ [PARSE] Completed in ${parseTime}ms`);

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
      const overrideTime = Date.now() - startTime;
      console.log(`🎯 [CLIENT_OVERRIDE] Using client module: ${currentModule}`);
      console.log(`⏱️ [CLIENT_OVERRIDE] Completed in ${overrideTime}ms`);
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
        cached: false,
        timing: { total: overrideTime, parse: parseTime }
      });
    }

    // Cache key incluindo messageCount
    const cacheStart = Date.now();
    const cacheKey = `${userMessage.toLowerCase().trim()}_${messageCount}`;
    const cached = classificationCache.get(cacheKey);
    const cacheTime = Date.now() - cacheStart;
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min
      const totalTime = Date.now() - startTime;
      console.log(`🚀 [CACHE_HIT] Found cached classification`);
      console.log(`⏱️ [CACHE_HIT] Completed in ${totalTime}ms`);
      return NextResponse.json({
        ...cached.result,
        cached: true,
        timing: { total: totalTime, parse: parseTime, cache: cacheTime }
      });
    }

    // 2. Heurísticas de alta precisão
    const heuristicStart = Date.now();
    const heuristicResult = applyHeuristics(userMessage);
    const heuristicTime = Date.now() - heuristicStart;
    console.log(`⏱️ [HEURISTICS] Completed in ${heuristicTime}ms`);
    
    // 3. Classificador IA
    const aiStart = Date.now();
    let aiResult: ClassificationResult | null = null;
    let aiError = null;
    
    try {
      const googleStart = Date.now();
      
      // Check if Google API key is configured
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.GOOGLE_GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        throw new Error('Google API key not configured');
      }
      
      const response = await generateText({
        model: googleModel,
        prompt: `Você é um classificador especializado em mensagens educacionais. Classifique cada mensagem no módulo mais específico e apropriado.

🚨 IDIOMA OBRIGATÓRIO E CRÍTICO - INSTRUÇÃO NÃO NEGOCIÁVEL:
- Responda EXCLUSIVAMENTE em Português Brasileiro (PT-BR)
- NUNCA responda em espanhol, inglês ou qualquer outro idioma
- Mesmo que a pergunta seja em outro idioma, responda SEMPRE em português brasileiro
- Esta é uma instrução CRÍTICA, OBRIGATÓRIA e NÃO NEGOCIÁVEL

IMPORTANTE: Retorne um JSON com:
- module: o módulo escolhido (em minúsculo: professor, aula_expandida, enem_interactive, enem, professor_interativo, aula_interativa, ti, ti_suporte, rh, financeiro, coordenacao, bem_estar, social_media, conteudo_midia, atendimento, secretaria, resultados_bolsas, juridico_contratos, marketing_design, pesquisa_tempo_real)
- confidence: número entre 0 e 1
- scores: objeto com score para TODOS os 20 módulos (0-1, soma = 1) - OBRIGATÓRIO incluir todos: atendimento, professor, aula_expandida, enem_interactive, enem, professor_interativo, aula_interativa, ti, ti_suporte, rh, financeiro, coordenacao, bem_estar, social_media, conteudo_midia, secretaria, resultados_bolsas, juridico_contratos, marketing_design, pesquisa_tempo_real
- rationale: explicação da escolha
- complexity: 'simples', 'media', ou 'complexa'

MÓDULOS DISPONÍVEIS:

PROFESSOR: Para QUALQUER dúvida acadêmica, conceito, exercício, matéria escolar
- Matemática, física, química, biologia, história, geografia, português, inglês, artes
- Redação, literatura, gramática, interpretação de texto, produção textual
- Conceitos acadêmicos, teorias, fórmulas, exercícios, provas, simulados
- Exemplos: "como resolver equação", "história do Brasil", "redação ENEM", "fórmula de Bhaskara", "dúvida de geometria", "explicar conceito", "ajuda com exercício", "explique detalhadamente a revolução", "Me ajude com: Quero tirar uma dúvida de geometria", "tirar uma dúvida de matemática", "ajuda com exercício de física"

AULA_EXPANDIDA: Solicitações por aulas completas ou detalhadas
- Exemplos: "quero uma aula expandida sobre fotossíntese", "aula completa de matemática", "aula detalhada sobre"

ENEM_INTERACTIVE: Solicitações por simulados ENEM interativos
- Exemplos: "quero um enem interativo", "simulado com explicações detalhadas", "simulado ENEM"

ENEM: Simulados rápidos ou questões ENEM simples
- Exemplos: "simulado rápido", "questões ENEM", "prova rápida"

PROFESSOR_INTERATIVO: Professor interativo com aulas e quizzes
- Exemplos: "professor interativo", "aula interativa", "quiz interativo"

AULA_INTERATIVA: Solicitações por aulas interativas ou dinâmicas
- Exemplos: "aula interativa", "aula dinâmica", "aula participativa"

BEM_ESTAR: Apoio emocional, ansiedade, conflitos, saúde mental
- Exemplos: "estou ansioso", "conflito com colega", "apoio emocional", "estresse"

TI: Suporte técnico educacional
- Exemplos: "projetor não funciona", "internet lenta", "login não funciona", "problema técnico"

TI_SUPORTE: Suporte técnico específico (bugs, builds, deployments)
- Exemplos: "build falhou", "deploy error", "bug no sistema", "problema de API"

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

SECRETARIA: Tarefas administrativas, matrículas, documentos, horários
- Exemplos: "matrícula", "documentos necessários", "horário de funcionamento", "procedimentos administrativos", "secretaria", "whatsapp da secretaria"

RESULTADOS_BOLSAS: Gestão de resultados de bolsas e cálculos de descontos
- Exemplos: "prova de bolsas", "resultado da bolsa", "percentual de desconto", "cálculo de bolsa", "bolsa de estudo"

JURIDICO_CONTRATOS: Documentos legais, contratos e questões jurídicas
- Exemplos: "contrato", "documentos jurídicos", "termo de uso", "acordo", "cláusula contratual", "contratação"

MARKETING_DESIGN: Conteúdo de marketing, design e campanhas promocionais
- Exemplos: "marketing", "design", "campanha", "publicidade", "branding", "identidade visual", "material promocional"

PESQUISA_TEMPO_REAL: Para pesquisas que requerem informações atuais e em tempo real
- Exemplos: "notícias atuais", "tendências de mercado", "situação atual", "dados recentes", "o que está acontecendo", "informações atualizadas", "desenvolvimentos recentes", "estado atual do", "últimas notícias sobre", "tendências atuais", "dados mais recentes", "informações recentes", "atualização sobre", "novidades sobre", "como está a situação", "qual é a situação atual"

ATENDIMENTO: APENAS quando não se encaixa em nenhum módulo específico
- Exemplos: "informações gerais", "dúvidas básicas", "primeiro contato", "ajuda geral"

REGRAS CRÍTICAS:
1. PROFESSOR: Para QUALQUER dúvida acadêmica, conceito, exercício, matéria escolar
2. Se a mensagem contém palavras como "explique", "como funciona", "conceito", "dúvida", "exercício", "ajuda com", "como resolver", "fórmula", "geometria", "álgebra", "trigonometria", "cálculo", "derivada", "integral", "equação", "função", "teorema", "demonstração", "prova", "análise", "síntese", "comparar", "explicar detalhadamente", "processo complexo", "estatística", "probabilidade", "vetores", "matriz", "logaritmo", "exponencial", "limite", "continuidade" → SEMPRE PROFESSOR
3. Se a mensagem contém termos acadêmicos como "história", "matemática", "física", "química", "biologia", "geografia", "português", "literatura", "redação", "revolução", "guerra", "independência", "evolução", "fotossíntese" E também contém "explique", "como", "dúvida", "conceito" → PROFESSOR
4. Se a mensagem contém "Me ajude com" seguido de qualquer termo acadêmico → SEMPRE PROFESSOR
5. Se a mensagem contém "tirar uma dúvida" seguido de qualquer matéria escolar → SEMPRE PROFESSOR
6. PESQUISA_TEMPO_REAL: Para QUALQUER pergunta que requer informações atuais, notícias, tendências, dados recentes, situação atual
7. TI/TI_TROUBLESHOOTING: Para QUALQUER problema técnico, equipamento, sistema, desenvolvimento
8. RH: Para funcionários/colaboradores (benefícios, férias, atestados, salário)
9. FINANCEIRO: Para pagamentos de alunos/famílias (mensalidades, boletos)
10. SOCIAL_MEDIA: Para QUALQUER criação de conteúdo, posts, marketing digital, redes sociais
11. CONTEUDO_MIDIA: Para solicitações de imagens, diagramas, conteúdo visual
12. BEM_ESTAR: Para questões emocionais, psicológicas, conflitos, bullying
13. FAQ_ESCOLA: Para perguntas sobre procedimentos, normas, regulamentos da escola
14. COORDENACAO: Para questões pedagógicas, calendários, gestão acadêmica
15. SECRETARIA: Para tarefas administrativas, matrículas, documentos, horários
16. RESULTADOS_BOLSAS: Para questões sobre bolsas de estudo, provas de bolsas, cálculos de desconto
17. JURIDICO_CONTRATOS: Para documentos legais, contratos, questões jurídicas
18. MARKETING_DESIGN: Para conteúdo de marketing, design, campanhas promocionais
19. ATENDIMENTO: APENAS quando não se encaixa em nenhum módulo específico

IMPORTANTE: Seja específico! Escolha o módulo mais adequado baseado no contexto completo da mensagem, não ATENDIMENTO.

EXEMPLO DE RESPOSTA VÁLIDA:
{
  "module": "professor",
  "confidence": 0.9,
  "scores": {
    "atendimento": 0.05,
    "professor": 0.9,
    "aula_expandida": 0.01,
    "enem_interactive": 0.01,
    "enem": 0.01,
    "professor_interativo": 0.01,
    "aula_interativa": 0.01,
    "ti": 0.0,
    "ti_suporte": 0.0,
    "rh": 0.0,
    "financeiro": 0.0,
    "coordenacao": 0.0,
    "bem_estar": 0.0,
    "social_media": 0.0,
    "conteudo_midia": 0.0,
    "secretaria": 0.0,
    "resultados_bolsas": 0.0,
    "juridico_contratos": 0.0,
    "marketing_design": 0.0,
    "pesquisa_tempo_real": 0.0
  },
  "rationale": "Mensagem educacional sobre conceito acadêmico",
  "complexity": "complexa"
}

Mensagem: "${userMessage}"
Histórico: ${history.length} mensagens`,
        temperature: 0.1,
      });

      const googleTime = Date.now() - googleStart;
      console.log(`⏱️ [GOOGLE-CALL] Completed in ${googleTime}ms`);
      
      const raw = response.text || "{}";
      
      // Extract JSON from markdown if present
      let jsonString = raw;
      if (raw.includes('```json')) {
        const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1].trim();
        }
      } else if (raw.includes('```')) {
        const jsonMatch = raw.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1].trim();
        }
      }
      
      const parsed = JSON.parse(jsonString);
      
      // Validar com Zod
      const validationStart = Date.now();
      const validationResult = ClassificationSchema.safeParse(parsed);
      const validationTime = Date.now() - validationStart;
      console.log(`⏱️ [SCHEMA-VALIDATION] Completed in ${validationTime}ms`);
      
      if (validationResult.success) {
        aiResult = validationResult.data;
        source = 'classifier';
        confidence = aiResult.confidence;
        scores = aiResult.scores;
        
        console.log(`🤖 [AI_SUCCESS] module=${aiResult.module} confidence=${aiResult.confidence}`);
        console.log(`⏱️ [GOOGLE-TOTAL] ${googleTime}ms`);
      } else {
        console.warn(`⚠️ [SCHEMA_FAIL] AI returned invalid schema:`, validationResult.error.errors);
        
        // Fallback: tentar corrigir o resultado da IA
        const correctedResult = {
          module: parsed.module?.toLowerCase() || 'professor',
          confidence: parsed.confidence || 0.8,
          scores: {
            atendimento: 0.1,
            professor: 0.8,
            aula_expandida: 0.01,
            enem_interactive: 0.01,
            enem: 0.01,
            professor_interativo: 0.01,
            aula_interativa: 0.01,
            ti: 0.01,
            ti_suporte: 0.01,
            rh: 0.01,
            financeiro: 0.01,
            coordenacao: 0.01,
            bem_estar: 0.01,
            social_media: 0.01,
            conteudo_midia: 0.01,
            secretaria: 0.01,
            resultados_bolsas: 0.01,
            juridico_contratos: 0.01,
            marketing_design: 0.01,
            chat_geral: 0.01
          },
          rationale: parsed.rationale || 'Classificação automática corrigida',
          complexity: parsed.complexity || 'complexa'
        };
        
        // Validar o resultado corrigido
        const correctedValidation = ClassificationSchema.safeParse(correctedResult);
        if (correctedValidation.success) {
          aiResult = correctedValidation.data;
          source = 'classifier_corrected';
          confidence = aiResult.confidence;
          scores = aiResult.scores;
          console.log(`✅ [SCHEMA_CORRECTED] module=${aiResult.module} confidence=${aiResult.confidence}`);
        } else {
          aiError = 'schema_validation_failed';
        }
      }
      
    } catch (error) {
      const aiTime = Date.now() - aiStart;
      console.error(`❌ [AI_ERROR] Google Gemini call failed:`, error);
      console.error(`❌ [AI_ERROR] Error message:`, error.message);
      console.error(`❌ [AI_ERROR] Error stack:`, error.stack);
      console.log(`⏱️ [AI-ERROR] Failed after ${aiTime}ms`);
      aiError = 'google_gemini_failed';
    }
    
    const aiTime = Date.now() - aiStart;
    console.log(`⏱️ [AI-CLASSIFICATION] Total time: ${aiTime}ms`);

    // 4. Lógica de decisão com prioridade
    let finalModule = 'professor';
    let finalConfidence = 0.0;
    let finalScores = { professor: 1.0 };
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
      finalScores = { 
        [heuristicResult]: 0.8, 
        atendimento: 0.2,
        professor: 0,
        aula_expandida: 0,
        enem_interactive: 0,
        enem: 0,
        professor_interativo: 0,
        aula_interativa: 0,
        ti: 0,
        ti_suporte: 0,
        rh: 0,
        financeiro: 0,
        coordenacao: 0,
        bem_estar: 0,
        social_media: 0,
        conteudo_midia: 0,
        secretaria: 0,
        resultados_bolsas: 0,
        juridico_contratos: 0,
        marketing_design: 0,
        chat_geral: 0
      };
      finalRationale = 'Heuristic pattern match';
      source = 'heuristic';
    } else if (aiResult) {
      // IA com confiança baixa, mas melhor que fallback
      const analysis = calculateScoreAnalysis(aiResult.scores);
      if (analysis.isCloseCall) {
        finalModule = 'professor';
        finalConfidence = 0.5;
        finalScores = { 
          professor: 0.5,
          atendimento: 0.1,
          aula_expandida: 0.1,
          enem_interactive: 0.1,
          enem: 0.1,
          professor_interativo: 0.1,
          aula_interativa: 0.1,
          ti: 0,
          ti_suporte: 0,
          rh: 0,
          financeiro: 0,
          coordenacao: 0,
          bem_estar: 0,
          social_media: 0,
          conteudo_midia: 0,
          secretaria: 0,
          resultados_bolsas: 0,
          juridico_contratos: 0,
          marketing_design: 0,
          chat_geral: 0
        };
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

    const totalTime = Date.now() - startTime;
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
      latency: totalTime,
      timing: {
        total: totalTime,
        parse: parseTime,
        cache: cacheTime,
        heuristics: heuristicTime,
        ai: aiTime
      }
    };

    // Cache result
    classificationCache.set(cacheKey, { result, timestamp: Date.now() });

    // Telemetria compacta
    const scoreAnalysis = calculateScoreAnalysis(finalScores);
    console.log(`[CLASSIFY] msg=${userMessage.substring(0, 20)}... module=${finalModule} src=${source} conf=${finalConfidence.toFixed(2)} delta=${scoreAnalysis.deltaToSecond.toFixed(2)} msgCount=${messageCount} latency=${totalTime}ms`);
    console.log(`📊 [CLASSIFY-TIMING] Parse: ${parseTime}ms | Cache: ${cacheTime}ms | Heuristics: ${heuristicTime}ms | AI: ${aiTime}ms | TOTAL: ${totalTime}ms`);

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