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

// Função removida - agora usamos sempre OpenAI para classificação
// export function heuristicDetect(text: string): DetectedIntent { ... }

// Cache simples para classificações no orchestrator
const orchestratorCache = new Map<string, { result: DetectedIntent; timestamp: number }>();

// Função para limpar cache (útil para debug)
export function clearOrchestratorCache() {
  orchestratorCache.clear();
  console.log('🧹 [ORCHESTRATOR] Cache limpo');
}

export async function classifyIntent(input: { text: string; context?: Record<string, any> }): Promise<DetectedIntent> {
  // Verificar cache primeiro - incluir contexto na chave
  const historyLength = input.context?.history?.length || 0;
  const cacheKey = `${input.text.toLowerCase().trim()}_${historyLength}`;
  const cached = orchestratorCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutos
    console.log(`🚀 [ORCHESTRATOR CACHE] Usando classificação em cache para: "${input.text.substring(0, 30)}..." (histórico: ${historyLength}) -> ${cached.result.module}`);
    return cached.result;
  }

  // Sempre usar OpenAI para classificação - maior certeza
  try {
    // Construir URL absoluta para server-side requests
    let baseUrl: string;
    
    if (typeof window !== 'undefined') {
      // Client-side: usar window.location.origin
      baseUrl = window.location.origin;
    } else {
      // Server-side: usar variáveis de ambiente ou localhost
      baseUrl = process.env.NEXTAUTH_URL || 
                process.env.NEXT_PUBLIC_APP_URL || 
                'http://localhost:3000';
    }
    
    const classifyUrl = `${baseUrl}/api/classify`;
    
    // Preparar contexto com histórico para melhor classificação
    const classificationContext = {
      userMessage: input.text,
      history: input.context?.history || [],
      currentModule: input.context?.module || 'atendimento'
    };

    const response = await fetch(classifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classificationContext),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.classification) {
        const classification = data.classification;
        
        // Mapear módulos da API para módulos internos
        const moduleMapping: Record<string, string> = {
          'PROFESSOR': 'professor',
          'AULA_EXPANDIDA': 'aula-expandida',
          'ENEM_INTERATIVO': 'enem-interativo',
          'TI': 'ti_troubleshooting',
          'SECRETARIA': 'faq_escola',
          'FINANCEIRO': 'financeiro',
          'RH': 'rh',
          'COORDENACAO': 'coordenacao',
          'BEM_ESTAR': 'bem-estar',
          'SOCIAL_MEDIA': 'social-media',
          'ATENDIMENTO': 'atendimento'
        };

        const mappedModule = moduleMapping[classification.module] || 'atendimento';
        
        const result = {
          intent: classification.module.toLowerCase(),
          module: mappedModule,
          confidence: classification.confidence || 0.8,
          slots: {},
          rationale: classification.rationale
        };

        // Salvar no cache
        orchestratorCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });

        // Limitar tamanho do cache
        if (orchestratorCache.size > 50) {
          const firstKey = orchestratorCache.keys().next().value;
          if (firstKey) {
            orchestratorCache.delete(firstKey);
          }
        }
        
        return result;
      }
    }
  } catch (error) {
    console.error('Erro na classificação OpenAI:', error);
  }

  // Fallback apenas em caso de erro
  return { 
    intent: 'general', 
    module: 'atendimento', 
    confidence: 0.4, 
    slots: {},
    rationale: 'fallback_erro_openai'
  };
}

export interface OrchestratorPolicyDecision {
  primary: { id: string; version?: string; slots: Record<string, any> } | null
  secondary?: { id: string; version?: string; slots: Record<string, any> } | null
}

export function decideModules(det: DetectedIntent): OrchestratorPolicyDecision {
  const conf = det.confidence
  const id = det.module
  
  // Política de decisão com ordem de preferência
  if (id === 'aula-expandida' && conf >= 0.5) return { primary: { id: 'aula-expandida', slots: det.slots } }
  if (id === 'enem-interativo' && conf >= 0.5) return { primary: { id: 'enem-interativo', slots: det.slots } }
  if (id === 'aula_interativa' && conf >= 0.5) return { primary: { id: 'aula_interativa', slots: det.slots } }
  if (id === 'enem' && conf >= 0.5) return { primary: { id: 'enem', slots: det.slots } }
  if (id === 'professor' && conf >= 0.5) return { primary: { id: 'professor', slots: det.slots } }
  if (id === 'ti_troubleshooting' && conf >= 0.5) return { primary: { id: 'ti_troubleshooting', slots: det.slots } }
  if (id === 'faq_escola' && conf >= 0.5) return { primary: { id: 'faq_escola', slots: det.slots } }
  if (id === 'bem-estar' && conf >= 0.5) return { primary: { id: 'bem-estar', slots: det.slots } }
  if (id === 'financeiro' && conf >= 0.5) return { primary: { id: 'financeiro', slots: det.slots } }
  if (id === 'rh' && conf >= 0.5) return { primary: { id: 'rh', slots: det.slots } }
  if (id === 'coordenacao' && conf >= 0.5) return { primary: { id: 'coordenacao', slots: det.slots } }
  if (id === 'social-media' && conf >= 0.5) return { primary: { id: 'social-media', slots: det.slots } }
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
    const selectedModule = getModule(input.context.module)
    if (selectedModule) {
      // Verificar se o usuário está respondendo a uma pergunta sobre slots
      const isSlotResponse = input.context?.waitingForSlot
      let slots = {}
      
      if (isSlotResponse) {
        // Extrair tema da resposta do usuário
        const tema = input.text.trim()
        if (tema) {
          slots = { tema }
        }
      }
      
      const result = await selectedModule.execute({ 
        slots, 
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
        slots,
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
    aula_interativa: ['tema'],
    'aula-expandida': ['tema']
  }
  const required = requiredSlotsByModule[decision.primary.id] || []
  const missing = required.filter(k => decision.primary!.slots[k] == null)
  
  // Se há slots faltando, mas o usuário pode estar respondendo a uma pergunta anterior
  if (missing.length > 0) {
    // Verificar se o usuário está respondendo a uma pergunta sobre slots
    const isShortResponse = input.text.trim().length < 50 && !input.text.includes('?') && !input.text.includes('!')
    const hasThemeKeywords = /(fotossíntese|fotossintese|mitose|meiose|genética|genetica|evolução|evolucao|ecossistema|biologia|história|historia|matemática|matematica|geometria|álgebra|algebra|cálculo|calculo|trigonometria|física|fisica|química|quimica|português|portugues|literatura|gramática|gramatica|geografia|sociologia|filosofia)/i.test(input.text)
    
    if (missing[0] === 'tema' && hasThemeKeywords) {
      // Extrair tema automaticamente da mensagem
      let tema = '';
      
      if (isShortResponse) {
        // Resposta curta: usar toda a mensagem
        tema = input.text.trim();
      } else {
        // Mensagem longa: extrair palavra-chave específica
        const themeMatch = input.text.match(/(fotossíntese|fotossintese|mitose|meiose|genética|genetica|evolução|evolucao|ecossistema|biologia|história|historia|matemática|matematica|geometria|álgebra|algebra|cálculo|calculo|trigonometria|física|fisica|química|quimica|português|portugues|literatura|gramática|gramatica|geografia|sociologia|filosofia)/i);
        tema = themeMatch ? themeMatch[1] : input.text.trim();
      }
      
      if (tema) {
        const updatedSlots = { ...decision.primary.slots, tema }
        const result = await primaryModule.execute({ 
          slots: updatedSlots, 
          context: { 
            text: input.text, 
            ...input.context 
          } 
        })
        const trace: OrchestratorTrace = {
          ...(result.trace || {}),
          module: decision.primary.id,
          confidence: det.confidence,
          intent: det.intent,
          slots: updatedSlots,
          latencyMs: Date.now() - t0
        }
        return { ...result, trace }
      }
    }
    
    const trace: OrchestratorTrace = { module: decision.primary.id, confidence: det.confidence, intent: det.intent, slots: det.slots, latencyMs: Date.now() - t0 }
    return {
      text: `Antes de começar, só preciso de uma informação: ${missing[0]}. Pode me dizer?`,
      blocks: [ { type: 'notice', title: 'Quase lá!', body: `Informe ${missing[0]} para prosseguirmos.` } ],
      actions: [],
      trace
    }
  }

  const result = await primaryModule.execute({ 
    slots: decision.primary.slots, 
    context: { 
      text: input.text, 
      ...input.context 
    } 
  })
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


