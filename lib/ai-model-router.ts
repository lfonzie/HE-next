import { 
  ProviderType, 
  PROVIDER_MODELS, 
  AI_PROVIDERS,
  getAvailableProviders
} from './ai-providers'

// Tipos de complexidade e casos de uso
export type ComplexityType = 'simple' | 'complex' | 'fast' | 'creative' | 'analytical'
export type UseCaseType = 'chat' | 'education' | 'analysis' | 'creative' | 'technical' | 'research'

// Configuração de roteamento por caso de uso
export const USE_CASE_ROUTING = {
  chat: {
    preferred: ['google', 'openai', 'anthropic'],
    complexity: 'simple' as ComplexityType,
    description: 'Conversação geral e atendimento'
  },
  education: {
    preferred: ['google', 'openai', 'anthropic'],
    complexity: 'complex' as ComplexityType,
    description: 'Conteúdo educacional e explicações'
  },
  analysis: {
    preferred: ['google', 'anthropic', 'openai'],
    complexity: 'analytical' as ComplexityType,
    description: 'Análise de dados e raciocínio complexo'
  },
  creative: {
    preferred: ['openai', 'mistral'],
    complexity: 'creative' as ComplexityType,
    description: 'Conteúdo criativo e inovador'
  },
  technical: {
    preferred: ['google', 'openai', 'anthropic'],
    complexity: 'complex' as ComplexityType,
    description: 'Suporte técnico e resolução de problemas'
  },
  research: {
    preferred: ['google', 'anthropic'],
    complexity: 'analytical' as ComplexityType,
    description: 'Pesquisa e síntese de informações'
  }
} as const

// Configuração de modelos por complexidade - GPT-4o-mini como padrão
export const COMPLEXITY_MODELS = {
  simple: {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-2.0-flash-exp',
    mistral: 'mistral-small-latest',
    groq: 'llama-3.1-8b-instant'
  },
  complex: {
    openai: 'gpt-5',
    anthropic: 'claude-3-sonnet-20240229',
    google: 'gemini-2.0-flash-exp',
    mistral: 'mistral-large-latest',
    groq: 'llama-3.1-70b-versatile'
  },
  fast: {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-2.0-flash-exp',
    mistral: 'mistral-small-latest',
    groq: 'llama-3.1-8b-instant'
  },
  creative: {
    openai: 'gpt-4o-chat-latest',
    anthropic: 'claude-3-sonnet-20240229',
    google: 'gemini-2.0-flash-exp',
    mistral: 'mistral-large-latest',
    groq: 'llama-3.1-70b-versatile'
  },
  analytical: {
    openai: 'gpt-4o-chat-latest',
    anthropic: 'claude-3-sonnet-20240229',
    google: 'gemini-2.0-flash-exp',
    mistral: 'mistral-large-latest',
    groq: 'llama-3.1-70b-versatile'
  }
} as const

// Configurações específicas por modelo
export const MODEL_CONFIGS = {
  // OpenAI Models
  'gpt-4o-chat-latest': {
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
    cost: 'high',
    speed: 'medium',
    quality: 'very-high'
  },
  'gpt-4o-mini': {
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 20000,
    cost: 'low',
    speed: 'fast',
    quality: 'good'
  },
  'gpt-5': {
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
    cost: 'high',
    speed: 'medium',
    quality: 'very-high'
  },
  'gpt-3.5-turbo': {
    temperature: 0.7,
    maxTokens: 1500,
    timeout: 15000,
    cost: 'very-low',
    speed: 'very-fast',
    quality: 'good'
  },
  
  // Anthropic Models
  'claude-3-sonnet-20240229': {
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
    cost: 'high',
    speed: 'medium',
    quality: 'very-high'
  },
  'claude-3-haiku-20240307': {
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 20000,
    cost: 'low',
    speed: 'fast',
    quality: 'high'
  },
  
  // Google Models
  'gemini-2.0-flash-exp': {
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
    cost: 'low',
    speed: 'very-fast',
    quality: 'high'
  },
  
  // Mistral Models
  'mistral-large-latest': {
    temperature: 0.7,
    maxTokens: 3000,
    timeout: 25000,
    cost: 'medium',
    speed: 'medium',
    quality: 'good'
  },
  'mistral-small-latest': {
    temperature: 0.7,
    maxTokens: 1500,
    timeout: 15000,
    cost: 'low',
    speed: 'fast',
    quality: 'good'
  },
  
  // Groq Models
  'llama-3.1-70b-versatile': {
    temperature: 0.7,
    maxTokens: 3000,
    timeout: 20000,
    cost: 'low',
    speed: 'very-fast',
    quality: 'good'
  },
  'llama-3.1-8b-instant': {
    temperature: 0.7,
    maxTokens: 1500,
    timeout: 10000,
    cost: 'very-low',
    speed: 'ultra-fast',
    quality: 'good'
  }
} as const

// Função para criar modelo baseado no provedor e complexidade
export function createModel(provider: ProviderType, complexity: ComplexityType = 'simple') {
  const providerInstance = AI_PROVIDERS[provider]
  const modelName = COMPLEXITY_MODELS[complexity][provider]
  
  // Para cada provedor, usar a função correta
  switch (provider) {
    case 'openai':
      return providerInstance(modelName)
    case 'anthropic':
      return providerInstance(modelName)
    case 'google':
      return providerInstance(modelName)
    case 'mistral':
      return providerInstance(modelName)
    case 'groq':
      return providerInstance(modelName)
    default:
      throw new Error(`Provider ${provider} not supported`)
  }
}

// Interface para resultado do roteamento
export interface RoutingResult {
  provider: ProviderType
  model: string
  complexity: ComplexityType
  useCase: UseCaseType
  config: {
    temperature: number
    maxTokens: number
    timeout: number
  }
  metadata: {
    cost: string
    speed: string
    quality: string
    reasoning: string
  }
}

// Função principal de roteamento inteligente
export async function routeAIModel(
  message: string,
  useCase?: UseCaseType,
  preferredProvider?: ProviderType,
  preferredComplexity?: ComplexityType
): Promise<RoutingResult> {
  
  // 1. Detectar caso de uso automaticamente se não especificado
  const detectedUseCase = useCase || detectUseCase(message)
  
  // 2. Detectar complexidade via API de IA se não especificada
  let detectedComplexity: ComplexityType
  if (preferredComplexity) {
    detectedComplexity = preferredComplexity
  } else {
    try {
      // Chamar API de classificação de complexidade
      const response = await fetch('/api/router/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiClassification = data.classification?.toLowerCase()
        
        // Mapear classificação da IA para nossos tipos
        if (aiClassification === 'complexa') {
          detectedComplexity = 'complex'
        } else if (aiClassification === 'simples') {
          // Para mensagens simples, verificar se são triviais (curtas) para usar Gemini
          if (message.length < 50 && !message.includes('explicar') && !message.includes('como')) {
            detectedComplexity = 'fast' // Usar Gemini para triviais
          } else {
            detectedComplexity = 'simple' // Usar GPT-4o-mini para simples
          }
        } else {
          // Fallback para detecção local
          detectedComplexity = detectComplexity(message, detectedUseCase)
        }
      } else {
        // Fallback para detecção local se API falhar
        detectedComplexity = detectComplexity(message, detectedUseCase)
      }
    } catch (error) {
      console.warn('Erro na classificação via IA, usando detecção local:', error)
      // Fallback para detecção local
      detectedComplexity = detectComplexity(message, detectedUseCase)
    }
  }
  
  // 3. Selecionar provedor baseado no caso de uso, complexidade e disponibilidade
  const selectedProvider = selectProviderForUseCase(detectedUseCase, preferredProvider, detectedComplexity)
  
  // 4. Selecionar modelo baseado na complexidade
  const selectedModel = COMPLEXITY_MODELS[detectedComplexity][selectedProvider]
  
  // 5. Obter configuração do modelo
  const modelConfig = MODEL_CONFIGS[selectedModel as keyof typeof MODEL_CONFIGS]
  
  // 6. Gerar explicação do roteamento
  const reasoning = generateRoutingReasoning(
    detectedUseCase,
    detectedComplexity,
    selectedProvider,
    selectedModel,
    modelConfig
  )
  
  return {
    provider: selectedProvider,
    model: selectedModel,
    complexity: detectedComplexity,
    useCase: detectedUseCase,
    config: {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
      timeout: modelConfig.timeout
    },
    metadata: {
      cost: modelConfig.cost,
      speed: modelConfig.speed,
      quality: modelConfig.quality,
      reasoning
    }
  }
}

// Função para detectar caso de uso baseado na mensagem
function detectUseCase(message: string): UseCaseType {
  const lowerMessage = message.toLowerCase()
  
  // Palavras-chave para cada caso de uso
  const useCaseKeywords = {
    education: [
      'aula', 'lição', 'ensinar', 'aprender', 'estudar', 'escola', 'professor',
      'aluno', 'matéria', 'disciplina', 'conteúdo', 'explicar', 'entender',
      'fotossíntese', 'matemática', 'história', 'geografia', 'ciências'
    ],
    analysis: [
      'analisar', 'análise', 'avaliar', 'avaliação', 'comparar', 'comparação',
      'estudar', 'pesquisar', 'investigar', 'examinar', 'revisar', 'crítica'
    ],
    creative: [
      'criar', 'inventar', 'imaginar', 'desenhar', 'escrever', 'compor',
      'desenvolver', 'inovador', 'criativo', 'artístico', 'original'
    ],
    technical: [
      'problema', 'erro', 'bug', 'configurar', 'instalar', 'tecnologia',
      'sistema', 'software', 'hardware', 'programação', 'código'
    ],
    research: [
      'pesquisar', 'pesquisa', 'informações', 'dados', 'estatísticas',
      'estudo', 'investigação', 'descoberta', 'encontrar', 'buscar'
    ]
  }
  
  // Contar ocorrências de palavras-chave
  const scores: Record<UseCaseType, number> = {
    chat: 0,
    education: 0,
    analysis: 0,
    creative: 0,
    technical: 0,
    research: 0
  }
  
  // Calcular scores
  for (const [useCase, keywords] of Object.entries(useCaseKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        scores[useCase as UseCaseType]++
      }
    }
  }
  
  // Encontrar caso de uso com maior score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'chat' // Default para chat
  
  const detectedUseCase = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as UseCaseType
  return detectedUseCase || 'chat'
}

// Função para detectar complexidade baseada na mensagem e caso de uso
function detectComplexity(message: string, useCase: UseCaseType): ComplexityType {
  const lowerMessage = message.toLowerCase()
  
  // Palavras-chave que indicam complexidade alta
  const complexKeywords = [
    'complexo', 'complexa', 'detalhado', 'detalhada', 'profundo', 'profunda',
    'análise', 'analisar', 'avaliação', 'avaliar', 'comparação', 'comparar',
    'estratégia', 'metodologia', 'metodológico', 'sistemático', 'sistemática',
    'impactos', 'socioeconômicos', 'socioeconômico', 'revolução', 'industrial',
    'científica', 'teoria', 'evolução', 'darwin', 'pedagógicas', 'construtivismo',
    'behaviorismo', 'estratégia', 'completa', 'matemática', 'avançada', 'criticamente',
    'fatores', 'império', 'romano', 'metodologia', 'científica', 'abordagens'
  ]
  
  // Palavras-chave que indicam simplicidade
  const simpleKeywords = [
    'simples', 'básico', 'básica', 'rápido', 'rápida', 'breve', 'resumo',
    'explicar', 'entender', 'o que é', 'como funciona', 'definição'
  ]
  
  // Palavras-chave que indicam velocidade
  const fastKeywords = [
    'rápido', 'rápida', 'urgente', 'imediato', 'agora', 'já', 'breve'
  ]
  
  // Palavras-chave que indicam criatividade
  const creativeKeywords = [
    'criativo', 'criativa', 'inovador', 'inovadora', 'original', 'único',
    'imaginativo', 'artístico', 'artística', 'criar', 'inventar'
  ]
  
  // Contar ocorrências
  const complexCount = complexKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  const simpleCount = simpleKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  const fastCount = fastKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  const creativeCount = creativeKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  
  // Critérios adicionais
  const isLongMessage = message.length > 150  // Reduzido para capturar mais mensagens
  const hasMultipleQuestions = (message.match(/\?/g) || []).length > 1
  const hasTechnicalTerms = /\b(metodologia|curriculo|competencia|habilidade|avaliacao|planejamento|estrategia|gestao|administracao|socioeconômicos|revolução|industrial|científica|teoria|evolução|pedagógicas|construtivismo|behaviorismo|matemática|avançada|império|romano)\b/i.test(message)
  const hasComplexPhrases = /\b(faça uma análise|análise detalhada|compare e analise|desenvolva uma estratégia|analise criticamente|metodologia científica|abordagens pedagógicas)\b/i.test(message)
  
  // Determinar complexidade baseada nos critérios
  if (fastCount > 0) return 'fast'
  if (creativeCount > 0) return 'creative'
  if (complexCount > 0 || isLongMessage || hasMultipleQuestions || hasTechnicalTerms || hasComplexPhrases) return 'complex'
  if (simpleCount > 0) return 'simple'
  
  // Default baseado no caso de uso
  switch (useCase) {
    case 'analysis':
    case 'research':
      return 'analytical'
    case 'creative':
      return 'creative'
    case 'education':
      return 'complex'
    default:
      return 'simple'
  }
}

// Função para selecionar provedor baseado no caso de uso e complexidade
function selectProviderForUseCase(useCase: UseCaseType, preferredProvider?: ProviderType, complexity?: ComplexityType): ProviderType {
  const availableProviders = getAvailableProviders()
  
  // Se há um provedor preferido e ele está disponível
  if (preferredProvider && availableProviders.includes(preferredProvider)) {
    return preferredProvider
  }
  
  // Seleção baseada na complexidade primeiro
  if (complexity) {
    const complexityProviders = {
      simple: ['openai'],               // GPT-4o-mini para simples
      complex: ['openai'],              // GPT-5 para complexas
      fast: ['google'],                 // Gemini para rápidas/triviais
      creative: ['openai'],             // GPT-4o/GPT-5 para criativas
      analytical: ['openai']            // GPT-5 para analíticas
    }
    
    const preferredForComplexity = complexityProviders[complexity] || ['openai']
    
    // Encontrar o primeiro provedor preferido para a complexidade que está disponível
    for (const provider of preferredForComplexity) {
      if (availableProviders.includes(provider as ProviderType)) {
        return provider as ProviderType
      }
    }
  }
  
  // Fallback: obter provedores preferidos para o caso de uso
  const preferredProviders = USE_CASE_ROUTING[useCase].preferred
  
  // Encontrar o primeiro provedor preferido que está disponível
  for (const provider of preferredProviders) {
    if (availableProviders.includes(provider as ProviderType)) {
      return provider as ProviderType
    }
  }
  
  // Fallback para o primeiro provedor disponível
  return availableProviders[0] || 'openai'
}

// Função para gerar explicação do roteamento
function generateRoutingReasoning(
  useCase: UseCaseType,
  complexity: ComplexityType,
  provider: ProviderType,
  model: string,
  config: any
): string {
  const useCaseDesc = USE_CASE_ROUTING[useCase].description
  const providerInfo = {
    openai: 'OpenAI (GPT)',
    anthropic: 'Anthropic (Claude)',
    google: 'Google (Gemini)',
    mistral: 'Mistral',
    groq: 'Groq (Llama)'
  }[provider]
  
  return `Selecionado ${providerInfo} com modelo ${model} para ${useCaseDesc} (${complexity}). Configuração: temp=${config.temperature}, tokens=${config.maxTokens}, timeout=${config.timeout}ms.`
}

// Função para obter estatísticas de roteamento
export function getRoutingStats(): {
  availableProviders: ProviderType[]
  totalModels: number
  useCases: UseCaseType[]
  complexities: ComplexityType[]
} {
  const availableProviders = getAvailableProviders()
  const totalModels = availableProviders.reduce((total, provider) => {
    return total + Object.keys(COMPLEXITY_MODELS.simple).length
  }, 0)
  
  return {
    availableProviders,
    totalModels,
    useCases: Object.keys(USE_CASE_ROUTING) as UseCaseType[],
    complexities: Object.keys(COMPLEXITY_MODELS) as ComplexityType[]
  }
}

// Função para validar configuração de roteamento
export function validateRoutingConfig(): {
  isValid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Verificar se há pelo menos um provedor disponível
  const availableProviders = getAvailableProviders()
  if (availableProviders.length === 0) {
    issues.push('Nenhum provedor de IA configurado')
    recommendations.push('Configure pelo menos uma chave de API no arquivo .env.local')
  }
  
  // Verificar se OpenAI está disponível (recomendado)
  if (!availableProviders.includes('openai')) {
    recommendations.push('Configure OPENAI_API_KEY para melhor compatibilidade')
  }
  
  // Verificar configurações de ambiente
  if (!process.env.OPENAI_API_KEY) {
    recommendations.push('Configure OPENAI_API_KEY no .env.local')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}
