import { OrchestratorResponse } from '@/types'
import { registerModule, DetectedIntent } from './orchestrator'

// aula_interativa module
registerModule({
  id: 'aula_interativa',
  name: 'Aula Interativa',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 1000, latency_ms: 1500 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(aula|entender|explique|fotoss(í|i)n(t)?ese|fatora(ç|c)ao|revolu(ç|c)ao)/.test(t)
    return { intent: 'lesson_request', module: 'aula_interativa', confidence: hit ? 0.8 : 0.3, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    const tema = slots.tema || 'assunto'
    const disciplina = slots.disciplina || 'geral'
    return {
      text: `Preparei uma aula interativa sobre ${tema} (${disciplina}). Podemos começar pelos fundamentos e depois avançar.`,
      blocks: [
        { type: 'lesson_interactive', lesson_id: `lesson_${Date.now()}`, meta: { tema, disciplina, passos: 9 } }
      ],
      actions: [
        { type: 'cta', label: 'Adicionar quiz de 5 questões', module: 'enem', args: { quantidade_questoes: 5 } }
      ]
    }
  }
})

// enem module
registerModule({
  id: 'enem',
  name: 'ENEM Simulado',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 800, latency_ms: 1200 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(simulado|quest(ã|a)o|questoes|enem|prova)/.test(t)
    return { intent: 'quiz_request', module: 'enem', confidence: hit ? 0.85 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    const area = slots.area || 'CN'
    const quantidade = Math.min(Math.max(Number(slots.quantidade_questoes || 5), 1), 50)
    return {
      text: `Iniciei um simulado do ENEM em ${area} com ${quantidade} questões.`,
      blocks: [
        { type: 'quiz', questions: [], meta: { area, quantidade, session_id: `enem_${Date.now()}` } }
      ],
      actions: [
        { type: 'cta', label: 'Ver relatório ao final', module: 'enem', args: { action: 'report' } }
      ],
      trace: { module: 'enem', confidence: 0.85 }
    }
  }
})

// ti_troubleshooting module
registerModule({
  id: 'ti_troubleshooting',
  name: 'TI Troubleshooting',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 600, latency_ms: 800 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(wifi|internet|computador|impressora|problema técnico|erro|bug|travou)/.test(t)
    return { intent: 'ti_support', module: 'ti_troubleshooting', confidence: hit ? 0.8 : 0.3, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou te ajudar com esse problema técnico. Vamos resolver passo a passo.',
      blocks: [
        { 
          type: 'checklist', 
          items: [
            { text: 'Verificar conexão de rede', done: false },
            { text: 'Reiniciar o equipamento', done: false },
            { text: 'Verificar configurações', done: false },
            { text: 'Contatar suporte técnico se necessário', done: false }
          ],
          meta: { category: 'troubleshooting' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Continuar diagnóstico', module: 'ti_troubleshooting', args: { step: 'next' } },
        { type: 'link', label: 'Manual técnico', href: '/docs/ti-troubleshooting' }
      ]
    }
  }
})

// faq_escola module
registerModule({
  id: 'faq_escola',
  name: 'FAQ Escola',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 400, latency_ms: 500 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(matr(í|i)cula|documentos|hor(á|a)rios|secretaria|boleto)/.test(t)
    return { intent: 'faq_request', module: 'faq_escola', confidence: hit ? 0.75 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Aqui estão as informações que você precisa sobre procedimentos escolares.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Informações da Secretaria', 
          body: 'Horário de funcionamento: Segunda a Sexta, 8h às 17h. Telefone: (11) 1234-5678',
          meta: { department: 'secretaria' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Falar com secretaria', module: 'faq_escola', args: { action: 'contact' } },
        { type: 'link', label: 'Portal do aluno', href: '/portal-aluno' }
      ]
    }
  }
})

// bem_estar module
registerModule({
  id: 'bem_estar',
  name: 'Bem-Estar',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 700, latency_ms: 1000 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(ansiedade|estresse|bem-estar|saúde mental|conflito|bullying)/.test(t)
    return { intent: 'wellbeing_support', module: 'bem_estar', confidence: hit ? 0.85 : 0.3, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Estou aqui para te apoiar. Vamos trabalhar juntos para melhorar seu bem-estar.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Suporte Emocional Disponível', 
          body: 'Nossa equipe de psicologia está disponível para conversar. Você não está sozinho(a).',
          meta: { support_type: 'emotional' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Agendar conversa com psicólogo', module: 'bem_estar', args: { action: 'schedule' } },
        { type: 'link', label: 'Exercícios de relaxamento', href: '/wellness/exercises' }
      ]
    }
  }
})

// financeiro module
registerModule({
  id: 'financeiro',
  name: 'Financeiro',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 500, latency_ms: 600 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(pagamento|mensalidade|boleto|financeiro|valor)/.test(t)
    return { intent: 'financial_support', module: 'financeiro', confidence: hit ? 0.8 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou te ajudar com questões financeiras. Aqui estão as informações sobre pagamentos.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Informações Financeiras', 
          body: 'Para questões de pagamento, entre em contato com nossa equipe financeira.',
          meta: { department: 'financeiro' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Falar com financeiro', module: 'financeiro', args: { action: 'contact' } },
        { type: 'link', label: 'Portal de pagamentos', href: '/payments' }
      ]
    }
  }
})

// rh module
registerModule({
  id: 'rh',
  name: 'Recursos Humanos',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 600, latency_ms: 700 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(funcionário|professor|rh|salário|benefício|férias)/.test(t)
    return { intent: 'hr_support', module: 'rh', confidence: hit ? 0.75 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou te ajudar com questões de recursos humanos e questões trabalhistas.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Recursos Humanos', 
          body: 'Nossa equipe de RH está disponível para esclarecer dúvidas sobre benefícios, férias e questões trabalhistas.',
          meta: { department: 'rh' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Falar com RH', module: 'rh', args: { action: 'contact' } },
        { type: 'link', label: 'Portal do funcionário', href: '/employee-portal' }
      ]
    }
  }
})

// coordenacao module
registerModule({
  id: 'coordenacao',
  name: 'Coordenação Pedagógica',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 600, latency_ms: 800 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(coordenação|pedagógico|currículo|disciplina|avaliação)/.test(t)
    return { intent: 'coordination_support', module: 'coordenacao', confidence: hit ? 0.75 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou te ajudar com questões pedagógicas e de coordenação acadêmica.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Coordenação Pedagógica', 
          body: 'Nossa equipe pedagógica está disponível para esclarecer dúvidas sobre currículo, avaliações e metodologias.',
          meta: { department: 'coordenacao' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Falar com coordenação', module: 'coordenacao', args: { action: 'contact' } },
        { type: 'link', label: 'Calendário acadêmico', href: '/academic-calendar' }
      ]
    }
  }
})

// social_media module
registerModule({
  id: 'social_media',
  name: 'Social Media',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 500, latency_ms: 600 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(rede social|instagram|facebook|marketing|comunicação)/.test(t)
    return { intent: 'social_media_support', module: 'social_media', confidence: hit ? 0.7 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou te ajudar com estratégias de marketing digital e comunicação nas redes sociais.',
      blocks: [
        { 
          type: 'notice', 
          title: 'Marketing Digital', 
          body: 'Nossa equipe de comunicação está disponível para ajudar com posts, eventos e divulgação.',
          meta: { department: 'social_media' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Falar com marketing', module: 'social_media', args: { action: 'contact' } },
        { type: 'link', label: 'Nossas redes sociais', href: '/social-media' }
      ]
    }
  }
})

// conteudo_midia module
registerModule({
  id: 'conteudo_midia',
  name: 'Conteúdo & Mídia',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 800, latency_ms: 1000 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(imagem|diagrama|figura|foto|gr(a|á)fico|visual)/.test(t)
    return { intent: 'media_request', module: 'conteudo_midia', confidence: hit ? 0.7 : 0.25, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Vou buscar conteúdo visual relevante para você.',
      blocks: [
        { 
          type: 'media', 
          items: [
            { url: '/images/placeholder1.jpg', title: 'Imagem relacionada', caption: 'Conteúdo visual encontrado' },
            { url: '/images/placeholder2.jpg', title: 'Diagrama explicativo', caption: 'Esquema visual' }
          ],
          meta: { source: 'curated' }
        }
      ],
      actions: [
        { type: 'cta', label: 'Buscar mais imagens', module: 'conteudo_midia', args: { action: 'search_more' } },
        { type: 'link', label: 'Galeria completa', href: '/media-gallery' }
      ]
    }
  }
})

// Função para identificar o nome da matéria
function getSubjectName(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('geometria')) return 'geometria'
  if (lowerMessage.includes('matemática') || lowerMessage.includes('matematica')) return 'matemática'
  if (lowerMessage.includes('álgebra') || lowerMessage.includes('algebra')) return 'álgebra'
  if (lowerMessage.includes('cálculo') || lowerMessage.includes('calculo')) return 'cálculo'
  if (lowerMessage.includes('trigonometria') || lowerMessage.includes('trigonomteria') || lowerMessage.includes('trigonom')) return 'trigonometria'
  if (lowerMessage.includes('física') || lowerMessage.includes('fisica')) return 'física'
  if (lowerMessage.includes('química') || lowerMessage.includes('quimica')) return 'química'
  if (lowerMessage.includes('fotossíntese') || lowerMessage.includes('fotossintese')) return 'fotossíntese'
  if (lowerMessage.includes('mitose')) return 'mitose'
  if (lowerMessage.includes('meiose')) return 'meiose'
  if (lowerMessage.includes('genética') || lowerMessage.includes('genetica')) return 'genética'
  if (lowerMessage.includes('evolução') || lowerMessage.includes('evolucao')) return 'evolução'
  if (lowerMessage.includes('ecossistema')) return 'ecossistema'
  if (lowerMessage.includes('biologia')) return 'biologia'
  if (lowerMessage.includes('história') || lowerMessage.includes('historia')) return 'história'
  if (lowerMessage.includes('português') || lowerMessage.includes('portugues')) return 'português'
  if (lowerMessage.includes('literatura')) return 'literatura'
  if (lowerMessage.includes('gramática') || lowerMessage.includes('gramatica')) return 'gramática'
  
  return 'essa matéria'
}

// professor module
registerModule({
  id: 'professor',
  name: 'Professor IA',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 800, latency_ms: 1000 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(historia|matematica|portugues|fisica|quimica|biologia|geografia|sociologia|filosofia|educacao|estudo|aprender|ensinar|aula|conteudo|materia|disciplina|geometria|algebra|calculo|trigonometria|dúvida|questão|exercicio)/.test(t)
    return { intent: 'educational_support', module: 'professor', confidence: hit ? 0.9 : 0.3, slots: {} }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    
    // Debug: Log para ver o que está acontecendo
    console.log('Professor module execute:', {
      message,
      context,
      slots,
      hasGeometria: message.includes('geometria'),
      hasMatematica: message.includes('matematica'),
      testResult: /(geometria|matemática|matematica|álgebra|algebra|cálculo|calculo|trigonometria|física|fisica|química|quimica|biologia|história|historia|português|portugues|dúvida|duvida|questão|questao|exercício|exercicio)/i.test(message)
    })
    
    // Se for uma pergunta específica sobre geometria ou outras matérias, responder diretamente
    if (/(geometria|matemática|matematica|álgebra|algebra|cálculo|calculo|trigonometria|trigonomteria|trigonom|física|fisica|química|quimica|biologia|fotossíntese|fotossintese|mitose|meiose|genética|genetica|evolução|evolucao|ecossistema|história|historia|português|portugues|literatura|gramática|gramatica|dúvida|duvida|questão|questao|exercício|exercicio)/i.test(message)) {
      return {
        text: `Professor IA\nAssistente de estudos\n\nVou te ajudar com sua dúvida sobre ${getSubjectName(message)}!\n\nPara te dar a melhor explicação, preciso saber:\n\n1. Qual é sua dúvida específica?\n2. Em que nível você está estudando? (Ensino Fundamental, Médio, Superior)\n3. Você tem algum exercício ou problema específico em mente?\n\nCom essas informações, posso criar uma explicação personalizada e didática para você!`,
        blocks: [
          { 
            type: 'notice', 
            title: 'Professor IA', 
            body: 'Estou aqui para te ajudar com suas dúvidas acadêmicas. Me conte mais detalhes sobre sua pergunta!' 
          }
        ],
        actions: [
          { type: 'cta', label: 'Criar aula interativa', module: 'aula_interativa', args: { tema: message } },
          { type: 'cta', label: 'Continuar conversa', module: 'professor', args: { action: 'continue' } }
        ]
      }
    }
    
    return {
      text: 'Professor IA\nAssistente de estudos\n\nComo posso ajudar você hoje? Posso te ajudar com:\n\n• Dúvidas de matemática, geometria, álgebra\n• Explicações de física, química, biologia\n• Aulas de história, português, geografia\n• Criação de aulas interativas\n• Resolução de exercícios\n\nMe conte qual é sua dúvida específica!',
      blocks: [],
      actions: [
        { type: 'cta', label: 'Criar aula interativa', module: 'aula_interativa', args: {} },
        { type: 'cta', label: 'Simulado rápido', module: 'enem', args: { quantidade_questoes: 5 } }
      ]
    }
  }
})

// atendimento module (fallback)
registerModule({
  id: 'atendimento',
  name: 'Atendimento Geral',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 400, latency_ms: 500 },
  async detect({ text }): Promise<DetectedIntent> {
    return { intent: 'general', module: 'atendimento', confidence: 0.4, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    return {
      text: 'Como posso ajudar você hoje? Posso direcionar você para o setor mais adequado.',
      blocks: [],
      actions: [
        { type: 'cta', label: 'Falar com atendimento', module: 'atendimento', args: { action: 'contact' } },
        { type: 'link', label: 'Central de ajuda', href: '/help' }
      ]
    }
  }
})


