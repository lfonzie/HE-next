import { OrchestratorResponse, OrchestratorTrace } from '@/types'

export interface DetectedIntent {
  intent: string
  module: string
  confidence: number
  slots: Record<string, any>
  rationale?: string
}

export interface ModuleMetadata {
  id: string
  name: string
  version: string
  permissions?: { admin_only?: boolean; requires_auth?: boolean }
  cost_estimate?: { tokens?: number; latency_ms?: number }
}

export interface RegisteredModule extends ModuleMetadata {
  detect: (input: { text: string; context?: Record<string, any> }) => Promise<DetectedIntent>
  execute: (input: { slots: Record<string, any>; context?: Record<string, any> }) => Promise<OrchestratorResponse>
}

const registry = new Map<string, RegisteredModule>()

export function registerModule(module: RegisteredModule) {
  registry.set(`${module.id}@${module.version}`, module)
}

export function getModule(id: string, version?: string): RegisteredModule | undefined {
  if (version) return registry.get(`${id}@${version}`)
  const candidates = Array.from(registry.keys())
    .filter(k => k.startsWith(`${id}@`))
    .sort()
  const latestKey = candidates[candidates.length - 1]
  return latestKey ? registry.get(latestKey) : undefined
}

export function listModules(): ModuleMetadata[] {
  return Array.from(registry.values()).map(({ id, name, version, permissions, cost_estimate }) => ({
    id, name, version, permissions, cost_estimate
  }))
}

export function heuristicDetect(text: string): DetectedIntent {
  const t = text.toLowerCase()
  
  // ENEM - Simulados e questões
  if (/(simulado|quest(ã|a)o|questoes|prova|enem|tri|acertos|gabarito|exame nacional)/.test(t)) {
    return { intent: 'quiz_request', module: 'enem', confidence: 0.72, slots: {} }
  }
  
  // Aula Interativa - Conceitos e explicações
  if (/(aula|entender|explique|explicar|passo a passo|fotoss(í|i)n(t)?ese|fatora(ç|c)ao|revolu(ç|c)ao|como funciona|o que é)/.test(t)) {
    return { intent: 'lesson_request', module: 'aula_interativa', confidence: 0.68, slots: {} }
  }
  
  // TI Troubleshooting - Problemas técnicos
  if (/(wifi|wi-fi|lento|internet|rede|conectar|impressora|bloqueada|conta bloqueada|computador|notebook|tablet|projetor|som|microfone|câmera|webcam|software|sistema|login|senha|acesso|erro|bug|travou|não funciona|problema técnico)/.test(t)) {
    return { intent: 'ti_support', module: 'ti_troubleshooting', confidence: 0.75, slots: {} }
  }
  
  // FAQ Escola - Documentos e procedimentos administrativos
  if (/(matr(í|i)cula|documentos|hor(á|a)rios|secretaria|boleto|mensalidade|declaração|atestado|histórico|transferência|rematrícula|calendário|feriado|recesso|férias|prova|nota|boletim|diário|frequência|falta|justificativa)/.test(t)) {
    return { intent: 'faq_request', module: 'faq_escola', confidence: 0.7, slots: {} }
  }
  
  // Bem-Estar - Suporte emocional e saúde mental
  if (/(ansiedade|estresse|depressão|tristeza|medo|preocupação|nervoso|calmo|relaxar|respirar|meditação|yoga|bem-estar|saúde mental|psicológico|terapia|conselho|ajuda emocional|suporte|conflito|briga|bullying|isolamento|solidão|autoestima|confiança)/.test(t)) {
    return { intent: 'wellbeing_support', module: 'bem_estar', confidence: 0.8, slots: {} }
  }
  
  // Financeiro - Questões de pagamento e mensalidades
  if (/(pagamento|mensalidade|boleto|cartão|débito|crédito|parcelamento|desconto|bolsa|financiamento|empréstimo|conta|fatura|vencimento|multa|juros|valor|preço|custo|taxa|financeiro|dinheiro|reembolso|estorno)/.test(t)) {
    return { intent: 'financial_support', module: 'financeiro', confidence: 0.75, slots: {} }
  }
  
  // RH - Recursos humanos e questões trabalhistas
  if (/(funcionário|professor|coordenador|diretor|rh|recursos humanos|salário|benefício|férias|licença|afastamento|treinamento|capacitação|contrato|demissão|admissão|folha|ponto|hora extra|vale|plano de saúde|aposentadoria|fgts|inss)/.test(t)) {
    return { intent: 'hr_support', module: 'rh', confidence: 0.7, slots: {} }
  }
  
  // Coordenação - Gestão pedagógica
  if (/(coordenação|pedagógico|currículo|grade|disciplina|matéria|conteúdo|plano de aula|avaliação|prova|trabalho|projeto|atividade|extraclasse|evento|reunião|pais|responsável|reunião pedagógica|planejamento|metodologia|didática)/.test(t)) {
    return { intent: 'coordination_support', module: 'coordenacao', confidence: 0.7, slots: {} }
  }
  
  // Social Media - Marketing e comunicação
  if (/(rede social|instagram|facebook|whatsapp|telegram|post|story|reels|marketing|comunicação|divulgação|evento|festa|formatura|comemoração|conquista|resultado|ranking|premiação|foto|vídeo|conteúdo digital|influencer|seguidor|curtida|compartilhamento)/.test(t)) {
    return { intent: 'social_media_support', module: 'social_media', confidence: 0.65, slots: {} }
  }
  
  // Conteúdo & Mídia - Imagens e diagramas
  if (/(imagem|diagrama|figura|foto|gr(a|á)fico|ilustração|desenho|esquema|mapa|tabela|infográfico|visual|mídia|conteúdo visual|apresentação|slide|poster|banner)/.test(t)) {
    return { intent: 'media_request', module: 'conteudo_midia', confidence: 0.6, slots: {} }
  }
  
  // Atendimento geral - Fallback
  return { intent: 'general', module: 'atendimento', confidence: 0.4, slots: {} }
}

export async function classifyIntent(input: { text: string; context?: Record<string, any> }): Promise<DetectedIntent> {
  const h = heuristicDetect(input.text)
  return h
}

export interface OrchestratorPolicyDecision {
  primary: { id: string; version?: string; slots: Record<string, any> } | null
  secondary?: { id: string; version?: string; slots: Record<string, any> } | null
}

export function decideModules(det: DetectedIntent): OrchestratorPolicyDecision {
  const conf = det.confidence
  const id = det.module
  
  // Política de decisão com ordem de preferência
  if (id === 'aula_interativa' && conf >= 0.5) return { primary: { id: 'aula_interativa', slots: det.slots } }
  if (id === 'enem' && conf >= 0.5) return { primary: { id: 'enem', slots: det.slots } }
  if (id === 'ti_troubleshooting' && conf >= 0.5) return { primary: { id: 'ti_troubleshooting', slots: det.slots } }
  if (id === 'faq_escola' && conf >= 0.5) return { primary: { id: 'faq_escola', slots: det.slots } }
  if (id === 'bem_estar' && conf >= 0.5) return { primary: { id: 'bem_estar', slots: det.slots } }
  if (id === 'financeiro' && conf >= 0.5) return { primary: { id: 'financeiro', slots: det.slots } }
  if (id === 'rh' && conf >= 0.5) return { primary: { id: 'rh', slots: det.slots } }
  if (id === 'coordenacao' && conf >= 0.5) return { primary: { id: 'coordenacao', slots: det.slots } }
  if (id === 'social_media' && conf >= 0.5) return { primary: { id: 'social_media', slots: det.slots } }
  if (id === 'conteudo_midia' && conf >= 0.5) return { primary: { id: 'conteudo_midia', slots: det.slots } }
  if (id === 'atendimento' && conf >= 0.4) return { primary: { id: 'atendimento', slots: det.slots } }
  
  return { primary: null }
}

export interface OrchestrateInput {
  text: string
  context?: Record<string, any>
}

export async function orchestrate(input: OrchestrateInput): Promise<OrchestratorResponse> {
  const t0 = Date.now()
  
  // Se já temos um módulo no contexto, use-o diretamente
  if (input.context?.module && input.context.module !== 'atendimento') {
    const module = getModule(input.context.module)
    if (module) {
      const result = await module.execute({ 
        slots: {}, 
        context: { 
          text: input.text, 
          ...input.context 
        } 
      })
      const trace: OrchestratorTrace = {
        ...(result.trace || {}),
        module: input.context.module,
        confidence: 1.0,
        intent: 'direct_module',
        slots: {},
        latencyMs: Date.now() - t0
      }
      return { ...result, trace }
    }
  }
  
  const det = await classifyIntent({ text: input.text, context: input.context })
  const decision = decideModules(det)

  if (!decision.primary) {
    const trace: OrchestratorTrace = { module: 'chat', confidence: det.confidence, intent: det.intent, slots: det.slots, latencyMs: Date.now() - t0 }
    return {
      text: input.text.length > 0 ? 'Vamos conversar sobre isso! Posso também gerar uma aula ou um quiz rápido se quiser.' : 'Como posso ajudar? Posso gerar uma aula guiada ou um simulado rápido.',
      blocks: [],
      actions: [
        { type: 'cta', label: 'Gerar aula completa', module: 'aula_interativa', args: {} },
        { type: 'cta', label: 'Simulado rápido (5 questões)', module: 'enem', args: { quantidade_questoes: 5 } }
      ],
      trace
    }
  }

  const primaryModule = getModule(decision.primary.id)
  if (!primaryModule) {
    const trace: OrchestratorTrace = { module: decision.primary.id, confidence: det.confidence, intent: det.intent, slots: det.slots, latencyMs: Date.now() - t0, errors: ['module_not_found'] }
    return { text: 'No momento não consegui iniciar o módulo. Quer seguir no chat mesmo?', blocks: [], actions: [{ type: 'cta', label: 'Continuar no chat', module: 'chat' }], trace }
  }

  const requiredSlotsByModule: Record<string, string[]> = {
    enem: ['area', 'quantidade_questoes'],
    aula_interativa: ['tema']
  }
  const required = requiredSlotsByModule[decision.primary.id] || []
  const missing = required.filter(k => decision.primary!.slots[k] == null)
  if (missing.length > 0) {
    const trace: OrchestratorTrace = { module: decision.primary.id, confidence: det.confidence, intent: det.intent, slots: det.slots, latencyMs: Date.now() - t0 }
    return {
      text: `Antes de começar, só preciso de uma informação: ${missing[0]}. Pode me dizer?`,
      blocks: [ { type: 'notice', title: 'Quase lá!', body: `Informe ${missing[0]} para prosseguirmos.` } ],
      actions: [],
      trace
    }
  }

  const result = await primaryModule.execute({ slots: decision.primary.slots, context: input.context })
  const trace: OrchestratorTrace = {
    ...(result.trace || {}),
    module: decision.primary.id,
    confidence: det.confidence,
    intent: det.intent,
    slots: det.slots,
    latencyMs: Date.now() - t0
  }
  return { ...result, trace }
}


