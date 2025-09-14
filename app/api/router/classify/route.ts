import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Type definitions
interface Module {
  module_id: string;
  name: string;
  description: string;
  keywords: string[];
  entities: string[];
  blocklist: string[];
}

interface Catalog {
  version: string;
  modules: Module[];
}

// Load catalog (cached in memory)
const catalogPath = join(process.cwd(), 'catalog.json');
const catalog: Module[] = (JSON.parse(readFileSync(catalogPath, 'utf-8')) as Catalog).modules;

// Fast rules regex patterns
const rules: { [key: string]: RegExp } = {
  enem: /(enem|simulad[oa]|quest(ao|ões)|gabarito|linguagens|ciencias|matem(á|a)tica)/i,
  resultados_bolsas: /(prova de bolsas|resultado|gabarito.*ose|percentual)/i,
  secretaria: /(matr(í|i)cula|documentos|hor(á|a)rio|secretaria|whats)/i,
  ti_suporte: /(build|deploy|render|porta|log|404|405|nextauth|rota|api|falhou|erro)/i,
  financeiro: /(mensalidade|13 parcelas|valor|pagamento|boleto)/i,
  professor_interativo: /(aula|quiz|explicar|tema)/i,
  aula_expandida: /(roteiro|avaliar|imagens|graficos)/i,
  juridico_contratos: /(contrato|juridico|termo)/i,
  marketing_design: /(marketing|design|campanha)/i
};

// Mock LLM router (replace with actual LLM integration if available)
function mockLLMRouter(text: string, context: string | null, catalog: Module[]): { module_id: string, intent: string, entities: string[], confidence: number } {
  let maxScore = 0;
  let selectedModule = 'chat_geral';
  let intent = 'general';
  let entities: string[] = [];
  let confidence = 0.5;

  for (const mod of catalog) {
    let score = 0;
    const keywords = mod.keywords || [];
    const modEntities = mod.entities || [];

    // Keyword matching
    keywords.forEach((kw: string) => {
      if (new RegExp(kw, 'i').test(text)) score += 0.3;
    });

    // Entity extraction (simplified)
    modEntities.forEach((entity: string) => {
      if (text.toLowerCase().includes(entity)) {
        entities.push(entity);
        score += 0.5;
      }
    });

    // Intent detection (simplified)
    if (mod.module_id === 'enem' && /quest(ao|ões)/i.test(text)) intent = 'buscar_questoes';
    else if (mod.module_id === 'ti_suporte' && /404|405/.test(text)) intent = 'bug_ui';
    else if (mod.module_id === 'resultados_bolsas' && /mensalidade|percentual/i.test(text)) intent = 'calcular_mensalidade';
    else if (mod.module_id === 'secretaria' && /matr(í|i)cula/i.test(text)) intent = 'processar_matricula';
    else if (mod.module_id === 'professor_interativo' && /aula/i.test(text)) intent = 'criar_aula';

    if (score > maxScore) {
      maxScore = score;
      selectedModule = mod.module_id;
      confidence = Math.min(0.9, 0.5 + score / Math.max(keywords.length + modEntities.length, 1));
    }
  }

  return { module_id: selectedModule, intent, entities, confidence };
}

// API route handler
export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Stage 1: Fast rules
    const ruleScores: { [key: string]: number } = {};
    for (const mod of catalog) {
      ruleScores[mod.module_id] = 0;
      if (rules[mod.module_id] && rules[mod.module_id].test(text)) {
        ruleScores[mod.module_id] += 0.3;
      }
      (mod.keywords || []).forEach((kw: string) => {
        if (new RegExp(kw, 'i').test(text)) ruleScores[mod.module_id] += 0.3;
      });
      (mod.blocklist || []).forEach((block: string) => {
        if (new RegExp(block, 'i').test(text)) ruleScores[mod.module_id] -= 0.4;
      });
    }

    // Normalize rule scores
    const maxRuleScore = Math.max(...Object.values(ruleScores), 1);
    const normalizedRuleScores = Object.fromEntries(
      Object.entries(ruleScores).map(([k, v]) => [k, v / maxRuleScore])
    );

    // Stage 2: LLM Router (mocked)
    const llmResult = mockLLMRouter(text, context, catalog);

    // Fusion: Combine scores
    const finalScores = catalog.map(mod => ({
      module_id: mod.module_id,
      score: 0.6 * (llmResult.module_id === mod.module_id ? llmResult.confidence : 0) + 0.4 * normalizedRuleScores[mod.module_id]
    }));

    // Decision
    const bestModule = finalScores.reduce((prev, curr) => curr.score > prev.score ? curr : prev);
    const response = {
      module_id: bestModule.score >= 0.5 ? bestModule.module_id : 'chat_geral',
      intent: llmResult.intent,
      entities: llmResult.entities,
      confidence: bestModule.score,
      rationale: bestModule.score >= 0.5 ? 'palavras-chave + LLM' : 'baixo score, fallback para chat_geral',
      trace_id: `router-${new Date().toISOString()}`
    };

    // Log for telemetry (simplified, replace with actual logging)
    console.log({
      text,
      module_id: response.module_id,
      confidence: response.confidence,
      trace_id: response.trace_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(response);
  } catch (error) {
    // Circuit breaker: Fallback to chat_geral if anything fails
    console.error('Router error:', error);
    return NextResponse.json({
      module_id: 'chat_geral',
      intent: 'general',
      entities: [],
      confidence: 0.1,
      rationale: 'Erro no router, fallback para chat_geral',
      trace_id: `router-${new Date().toISOString()}`
    });
  }
}
