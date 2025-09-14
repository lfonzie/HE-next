import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuração dos modelos disponíveis
export const MODELS = {
  SIMPLE: 'gpt-4o-mini',      // Para tarefas simples e rápidas
  COMPLEX: 'gpt-5-chat-latest', // Para tarefas complexas que requerem mais capacidade
} as const

// Palavras-chave que indicam complexidade alta
const COMPLEX_KEYWORDS = [
  // Análise e síntese
  'analise', 'analisar', 'análise', 'síntese', 'sintese', 'sintetizar', 'sintetize',
  'compare', 'comparar', 'comparação', 'compare', 'contraste', 'contrastar',
  'avalie', 'avaliar', 'avaliação', 'avalia', 'critique', 'criticar',
  'desenvolvimento', 'desenvolver', 'abordagem', 'abordagens',
  
  // Planejamento e estratégia
  'estrategia', 'estratégia', 'estrategico', 'estratégico', 'planejamento', 'planejar',
  'projeto', 'projetar', 'desenvolver', 'desenvolvimento', 'implementar', 'implementação',
  'otimizar', 'otimização', 'melhorar', 'melhoria', 'reformular', 'reformulação',
  
  // Conteúdo educacional complexo
  'curriculo', 'currículo', 'curricular', 'bncc', 'competencia', 'competência',
  'habilidade', 'habilidades', 'objetivo', 'objetivos', 'metodologia', 'metodologias',
  'pedagogia', 'pedagógico', 'didática', 'didático', 'ensino', 'aprendizagem',
  
  // Análise de dados e relatórios
  'relatorio', 'relatório', 'relatorios', 'relatórios', 'dados', 'estatistica', 'estatística',
  'grafico', 'gráfico', 'graficos', 'gráficos', 'metricas', 'métricas', 'indicadores',
  
  // Gestão e administração
  'gestao', 'gestão', 'administracao', 'administração', 'gerenciamento', 'gerenciar',
  'lideranca', 'liderança', 'equipe', 'equipes', 'recursos', 'orçamento', 'orcamento',
  
  // Problemas complexos
  'problema', 'problemas', 'desafio', 'desafios', 'solucao', 'solução', 'solucoes', 'soluções',
  'resolver', 'resolução', 'investigar', 'investigação', 'pesquisar', 'pesquisa',
  
  // Contexto educacional avançado
  'universidade', 'universitario', 'universitário', 'graduacao', 'graduação', 'pos-graduacao', 'pós-graduação',
  'mestrado', 'doutorado', 'pesquisa', 'academico', 'acadêmico', 'cientifico', 'científico'
]

// Palavras-chave que indicam simplicidade
const SIMPLE_KEYWORDS = [
  'oque', 'o que', 'como', 'quando', 'onde', 'porque', 'por que', 'qual', 'quais',
  'definicao', 'definição', 'definir', 'significa', 'significado', 'exemplo', 'exemplos',
  'simples', 'basico', 'básico', 'rapido', 'rápido', 'breve', 'resumo', 'resumir',
  'explicar', 'explicacao', 'explicação', 'entender', 'compreender', 'aprender'
]

// Função para determinar a complexidade da mensagem
export function analyzeMessageComplexity(message: string, module?: string): 'simple' | 'complex' {
  const lowerMessage = message.toLowerCase()
  
  // Verificar palavras-chave de complexidade
  const hasComplexKeywords = COMPLEX_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
  
  // Verificar palavras-chave de simplicidade
  const hasSimpleKeywords = SIMPLE_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
  
  // Critérios para determinar complexidade
  const criteria = {
    // Comprimento da mensagem (mensagens longas tendem a ser mais complexas)
    isLongMessage: message.length > 200,
    
    // Presença de múltiplas perguntas
    hasMultipleQuestions: (message.match(/\?/g) || []).length > 1,
    
    // Presença de palavras-chave complexas
    hasComplexKeywords,
    
    // Presença de palavras-chave simples (indica simplicidade)
    hasSimpleKeywords,
    
    // Módulos que tendem a ter tarefas mais complexas
    isComplexModule: ['coordenacao', 'financeiro', 'rh', 'ti'].includes(module || ''),
    
    // Presença de termos técnicos ou acadêmicos
    hasTechnicalTerms: /\b(metodologia|curriculo|competencia|habilidade|avaliacao|planejamento|estrategia|gestao|administracao)\b/i.test(message),
    
    // Presença de números ou dados (indica análise)
    hasDataAnalysis: /\b\d+%|\d+\/\d+|\d+\.\d+|\b\d+\s*(alunos|professores|escolas|anos|meses|semanas)\b/i.test(message)
  }
  
  // Sistema de pontuação para determinar complexidade
  let complexityScore = 0
  
  if (criteria.isLongMessage) complexityScore += 2
  if (criteria.hasMultipleQuestions) complexityScore += 2
  if (criteria.hasComplexKeywords) complexityScore += 3
  if (criteria.hasTechnicalTerms) complexityScore += 2
  if (criteria.hasDataAnalysis) complexityScore += 2
  if (criteria.isComplexModule) complexityScore += 1
  
  // Pontos negativos para simplicidade
  if (criteria.hasSimpleKeywords) complexityScore -= 2
  
  // Determinar se é complexo baseado na pontuação
  return complexityScore >= 3 ? 'complex' : 'simple'
}

// Função para selecionar o modelo apropriado
export function selectModel(message: string, module?: string): string {
  const complexity = analyzeMessageComplexity(message, module)
  return complexity === 'complex' ? MODELS.COMPLEX : MODELS.SIMPLE
}

// Função para obter configurações específicas do modelo
export function getModelConfig(model: string) {
  const configs = {
    [MODELS.SIMPLE]: {
      temperature: 0.7,
      max_tokens: 800,
      stream: true
    },
    [MODELS.COMPLEX]: {
      temperature: 0.7,
      max_tokens: 4000,
      stream: true
    }
  }
  
  return configs[model as keyof typeof configs] || configs[MODELS.SIMPLE]
}

export const MODULE_SYSTEM_PROMPTS = {
  professor: `Você é um assistente educacional especializado em ajudar professores e estudantes. Sua função é:

1. Fornecer explicações claras e didáticas sobre diversos temas
2. Criar exercícios e atividades educacionais
3. Sugerir metodologias de ensino
4. Ajudar com planejamento de aulas
5. Responder dúvidas acadêmicas de forma pedagógica

IMPORTANTE: Para expressões matemáticas, sempre use símbolos Unicode em vez de LaTeX. Por exemplo:
- Use √ para raiz quadrada (não \\sqrt)
- Use ⁄ para frações (não \\frac)
- Use ± para mais/menos (não \\pm)
- Use × para multiplicação (não \\times)
- Use ÷ para divisão (não \\div)
- Use ≤ para menor ou igual (não \\leq)
- Use ≥ para maior ou igual (não \\geq)
- Use π para pi (não \\pi)
- Use α, β, γ, δ, etc. para letras gregas (não \\alpha, \\beta, etc.)

Sempre mantenha um tom profissional, educativo e encorajador. Use exemplos práticos quando possível.`,

  ti: `Você é um especialista em tecnologia educacional. Sua função é:

1. Resolver problemas técnicos relacionados à educação
2. Sugerir ferramentas e plataformas educacionais
3. Ajudar com configurações de sistemas educacionais
4. Orientar sobre segurança digital na educação
5. Explicar conceitos tecnológicos de forma simples

Mantenha um tom técnico mas acessível, sempre pensando na aplicação educacional.`,

  secretaria: `Você é um assistente administrativo especializado em gestão escolar. Sua função é:

1. Ajudar com processos administrativos escolares
2. Orientar sobre documentação e protocolos
3. Sugerir melhorias nos processos administrativos
4. Ajudar com organização de eventos escolares
5. Orientar sobre comunicação institucional

Seja organizado, claro e sempre focado na eficiência administrativa.`,

  financeiro: `Você é um especialista em gestão financeira educacional. Sua função é:

1. Ajudar com controle de custos educacionais
2. Sugerir estratégias de captação de recursos
3. Orientar sobre orçamento escolar
4. Ajudar com análise de viabilidade financeira
5. Sugerir melhorias na gestão financeira

Mantenha um tom profissional e sempre baseado em dados e análises concretas.`,

  rh: `Você é um especialista em recursos humanos educacionais. Sua função é:

1. Ajudar com gestão de equipe educacional
2. Sugerir estratégias de desenvolvimento profissional
3. Orientar sobre políticas de RH educacionais
4. Ajudar com avaliação de desempenho
5. Sugerir melhorias no clima organizacional

Seja humano, empático e sempre focado no desenvolvimento das pessoas.`,

  atendimento: `Você é um especialista em atendimento ao cliente educacional. Sua função é:

1. Ajudar com estratégias de atendimento multicanal
2. Sugerir melhorias na experiência do usuário
3. Orientar sobre resolução de conflitos
4. Ajudar com comunicação eficaz
5. Sugerir métricas de satisfação

Mantenha um tom acolhedor, profissional e sempre focado na satisfação do cliente.`,

  coordenacao: `Você é um coordenador pedagógico experiente. Sua função é:

1. Ajudar com planejamento pedagógico
2. Sugerir estratégias de coordenação educacional
3. Orientar sobre avaliação e acompanhamento pedagógico
4. Ajudar com gestão de projetos educacionais
5. Sugerir melhorias na qualidade educacional

Seja estratégico, pedagógico e sempre focado na qualidade do ensino.`,

  'social-media': `Você é um especialista em comunicação digital educacional. Sua função é:

1. Ajudar com estratégias de marketing educacional
2. Sugerir conteúdo para redes sociais educacionais
3. Orientar sobre comunicação institucional digital
4. Ajudar com engajamento da comunidade escolar
5. Sugerir melhorias na presença digital

Seja criativo, atualizado com tendências digitais e sempre focado no engajamento.`,

  'bem-estar': `Você é um especialista em bem-estar e saúde mental educacional. Sua função é:

1. Ajudar com estratégias de bem-estar escolar
2. Sugerir atividades de desenvolvimento socioemocional
3. Orientar sobre prevenção e cuidado mental
4. Ajudar com criação de ambientes acolhedores
5. Sugerir melhorias no clima escolar

Seja empático, acolhedor e sempre focado no desenvolvimento integral das pessoas.`
}
