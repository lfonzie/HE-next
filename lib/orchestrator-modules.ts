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
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'AULA_EXPANDIDA') {
          return { 
            intent: 'lesson_request', 
            module: 'aula_interativa', 
            confidence: data.classification.confidence || 0.8, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'lesson_request', module: 'aula_interativa', confidence: 0.3, slots: {} }
  },
  async execute({ slots }): Promise<OrchestratorResponse> {
    const tema = slots.tema || 'assunto'
    const disciplina = slots.disciplina || 'geral'
    return {
      text: `📚 **Aula Interativa Ativada**\n\nPreparei uma aula interativa sobre ${tema} (${disciplina}). Podemos começar pelos fundamentos e depois avançar.\n\n**Estrutura da aula:**\n• Slide 1: Introdução\n• Slide 2: Conceitos fundamentais\n• Slide 3: Desenvolvimento\n• Slide 4: Pergunta interativa\n• Slide 5: Aplicações práticas\n• Slide 6: Exemplos\n• Slide 7: Pergunta interativa\n• Slide 8: Resumo\n\nDigite "começar aula" para iniciar!`,
      blocks: [
        { type: 'lesson_interactive', lesson_id: `lesson_${Date.now()}`, meta: { tema, disciplina, passos: 8 } }
      ],
      actions: [
        { type: 'cta', label: 'Começar Aula', module: 'aula_interativa', args: { tema, disciplina } },
        { type: 'cta', label: 'Adicionar quiz de 5 questões', module: 'enem', args: { quantidade_questoes: 5 } }
      ]
    }
  }
})

// aula-expandida module (alias for aula_interativa)
registerModule({
  id: 'aula-expandida',
  name: 'Aula Expandida',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 1000, latency_ms: 1500 },
  async detect({ text }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'AULA_EXPANDIDA') {
          return { 
            intent: 'lesson_request', 
            module: 'aula-expandida', 
            confidence: data.classification.confidence || 0.9, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'lesson_request', module: 'aula-expandida', confidence: 0.3, slots: {} }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    const tema = slots.tema || message || 'assunto'
    const disciplina = slots.disciplina || 'geral'
    
    return {
      text: `🎓 **Aula Expandida Ativada**\n\nCriando uma aula completa e detalhada sobre ${tema}.\n\n**Esta aula incluirá:**\n• Explicações detalhadas\n• Exemplos práticos\n• Exercícios interativos\n• Resumo completo\n• Material de apoio\n\nDigite "começar aula expandida" para iniciar!`,
      blocks: [
        { type: 'lesson_interactive', lesson_id: `lesson_expanded_${Date.now()}`, meta: { tema, disciplina, passos: 8, mode: 'expanded' } }
      ],
      actions: [
        { type: 'cta', label: 'Começar Aula Expandida', module: 'aula-expandida', args: { tema, disciplina } },
        { type: 'cta', label: 'Simulado Relacionado', module: 'enem', args: { quantidade_questoes: 5 } }
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
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && (data.classification?.module === 'ENEM_INTERATIVO' || data.classification?.module === 'PROFESSOR')) {
          return { 
            intent: 'quiz_request', 
            module: 'enem', 
            confidence: data.classification.confidence || 0.85, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'quiz_request', module: 'enem', confidence: 0.25, slots: {} }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    const area = slots.area || 'CN'
    const quantidade = Math.min(Math.max(Number(slots.quantidade_questoes || 5), 1), 50)
    
    return {
      text: `🎯 **Simulador ENEM Ativado**\n\nIniciando simulado com ${quantidade} questões de ${area}.\n\n**Áreas disponíveis:**\n• CN - Ciências da Natureza\n• CH - Ciências Humanas\n• LC - Linguagens e Códigos\n• MT - Matemática\n\nDigite "começar simulado" para iniciar ou me diga qual área você quer praticar!`,
      blocks: [
        { 
          type: 'quiz', 
          questions: [], 
          meta: { 
            area, 
            quantidade, 
            session_id: `enem_${Date.now()}`,
            mode: 'interactive',
            ready_to_start: false
          } 
        }
      ],
      actions: [
        { type: 'cta', label: 'Começar Simulado CN', module: 'enem', args: { area: 'CN', quantidade_questoes: 5 } },
        { type: 'cta', label: 'Começar Simulado CH', module: 'enem', args: { area: 'CH', quantidade_questoes: 5 } },
        { type: 'cta', label: 'Começar Simulado LC', module: 'enem', args: { area: 'LC', quantidade_questoes: 5 } },
        { type: 'cta', label: 'Começar Simulado MT', module: 'enem', args: { area: 'MT', quantidade_questoes: 5 } }
      ],
      trace: { module: 'enem', confidence: 0.85 }
    }
  }
})

// enem-interativo module (alias for enem with enhanced features)
registerModule({
  id: 'enem-interativo',
  name: 'ENEM Interativo',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 1000, latency_ms: 1500 },
  async detect({ text }): Promise<DetectedIntent> {
    const t = text.toLowerCase()
    const hit = /(enem interativo|simulado interativo|questões interativas|prova interativa|enem com explicações)/.test(t)
    return { intent: 'quiz_request', module: 'enem-interativo', confidence: hit ? 0.9 : 0.3, slots: {} }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    const area = slots.area || 'CN'
    const quantidade = Math.min(Math.max(Number(slots.quantidade_questoes || 5), 1), 50)
    
    return {
      text: `🎯 **ENEM Interativo Ativado**\n\nModo interativo com explicações detalhadas e feedback em tempo real!\n\n**Recursos especiais:**\n• Explicações detalhadas de cada questão\n• Feedback imediato\n• Análise de performance\n• Sugestões de estudo\n• Relatório personalizado\n\n**Áreas disponíveis:**\n• CN - Ciências da Natureza\n• CH - Ciências Humanas\n• LC - Linguagens e Códigos\n• MT - Matemática\n\nDigite "começar enem interativo" para iniciar!`,
      blocks: [
        { 
          type: 'quiz', 
          questions: [], 
          meta: { 
            area, 
            quantidade, 
            session_id: `enem_interactive_${Date.now()}`,
            mode: 'interactive',
            enhanced: true,
            ready_to_start: false
          } 
        }
      ],
      actions: [
        { type: 'cta', label: 'ENEM Interativo CN', module: 'enem-interativo', args: { area: 'CN', quantidade_questoes: 5 } },
        { type: 'cta', label: 'ENEM Interativo CH', module: 'enem-interativo', args: { area: 'CH', quantidade_questoes: 5 } },
        { type: 'cta', label: 'ENEM Interativo LC', module: 'enem-interativo', args: { area: 'LC', quantidade_questoes: 5 } },
        { type: 'cta', label: 'ENEM Interativo MT', module: 'enem-interativo', args: { area: 'MT', quantidade_questoes: 5 } }
      ],
      trace: { module: 'enem-interativo', confidence: 0.9 }
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
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'PROFESSOR') {
          return { 
            intent: 'educational_support', 
            module: 'professor', 
            confidence: data.classification.confidence || 0.9, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'educational_support', module: 'professor', confidence: 0.3, slots: {} }
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
      const subject = getSubjectName(message)
      
      // Respostas específicas para cada matéria
      let specificResponse = ''
      let specificActions = []
      
      switch (subject) {
        case 'trigonometria':
          specificResponse = `📐 **Trigonometria - Guia Completo**\n\nA trigonometria é uma das áreas mais importantes da matemática, estudando as relações entre ângulos e lados de triângulos. É essencial para entender fenômenos periódicos e resolver problemas geométricos.\n\n## **Conceitos Fundamentais**\n\n**As três funções principais:**\n• **Seno (sin)**: Relação entre o cateto oposto e a hipotenusa\n• **Cosseno (cos)**: Relação entre o cateto adjacente e a hipotenusa\n• **Tangente (tan)**: Relação entre o cateto oposto e o adjacente\n\n## **Aplicações Práticas**\n\n• **Engenharia**: Cálculo de estruturas, pontes, edifícios\n• **Física**: Ondas, oscilações, movimento harmônico\n• **Astronomia**: Cálculo de distâncias entre corpos celestes\n• **Navegação**: GPS, sistemas de localização\n• **Arquitetura**: Projetos de construção\n\n## **Conceitos Avançados**\n\n• **Círculo trigonométrico**: Visualização das funções\n• **Identidades trigonométricas**: Relações matemáticas importantes\n• **Lei dos senos e cossenos**: Resolução de triângulos\n• **Funções inversas**: Arco-seno, arco-cosseno, arco-tangente\n\n**💡 Dica**: A trigonometria é muito visual! Sempre desenhe triângulos e use o círculo trigonométrico para entender melhor os conceitos.\n\n**O que você gostaria de explorar primeiro?**`
          specificActions = [
            { type: 'cta' as const, label: 'Conceitos básicos', module: 'professor', args: { topic: 'trigonometria_basica' } },
            { type: 'cta' as const, label: 'Círculo trigonométrico', module: 'professor', args: { topic: 'circulo_trigonometrico' } },
            { type: 'cta' as const, label: 'Aula interativa completa', module: 'aula_interativa', args: { tema: 'trigonometria' } }
          ]
          break
          
        case 'geometria':
          specificResponse = `📏 **Geometria - A Arte das Formas**\n\nA geometria é uma das áreas mais antigas e fascinantes da matemática, estudando as formas, tamanhos e propriedades do espaço. É a base para entender o mundo ao nosso redor!\n\n## **Principais Áreas da Geometria**\n\n### **Geometria Plana**\n• **Triângulos**: Propriedades, classificação, teoremas importantes\n• **Quadriláteros**: Retângulos, quadrados, paralelogramos\n• **Círculos**: Circunferência, área, propriedades especiais\n• **Polígonos**: Regulares e irregulares\n\n### **Geometria Espacial**\n• **Sólidos**: Cubos, esferas, cilindros, cones\n• **Volumes**: Cálculo de capacidade\n• **Áreas**: Superfície de sólidos\n• **Projeções**: Visualização 3D\n\n### **Geometria Analítica**\n• **Coordenadas**: Sistema cartesiano\n• **Equações**: Retas, círculos, parábolas\n• **Distâncias**: Entre pontos e figuras\n• **Transformações**: Translação, rotação, reflexão\n\n## **Aplicações no Dia a Dia**\n\n• **Arquitetura**: Projetos de casas e edifícios\n• **Design**: Logotipos, layouts, interfaces\n• **Engenharia**: Construção de pontes e estradas\n• **Arte**: Perspectiva, composição visual\n• **Tecnologia**: Gráficos computacionais, GPS\n\n**💡 Dica**: A geometria é muito visual! Use desenhos, modelos e exemplos práticos para entender melhor os conceitos.\n\n**Por onde você gostaria de começar?**`
          specificActions = [
            { type: 'cta' as const, label: 'Geometria plana', module: 'professor', args: { topic: 'geometria_plana' } },
            { type: 'cta' as const, label: 'Triângulos', module: 'professor', args: { topic: 'triangulos' } },
            { type: 'cta' as const, label: 'Aula completa', module: 'aula_interativa', args: { tema: 'geometria' } }
          ]
          break
          
        case 'matemática':
          specificResponse = `🔢 **Matemática - A Linguagem Universal**\n\nA matemática é muito mais que números! É a linguagem que descreve o universo, desde as menores partículas até as maiores galáxias. É uma ferramenta poderosa para resolver problemas e entender o mundo ao nosso redor.\n\n## **Principais Áreas da Matemática**\n\n### **Álgebra**\n• **Equações**: Resolução de problemas matemáticos\n• **Funções**: Relações entre variáveis\n• **Gráficos**: Visualização de dados\n• **Polinômios**: Expressões algébricas complexas\n\n### **Geometria**\n• **Formas**: Triângulos, círculos, polígonos\n• **Espaço**: Geometria 3D e sólidos\n• **Medidas**: Área, perímetro, volume\n• **Transformações**: Movimentos geométricos\n\n### **Trigonometria**\n• **Funções**: Seno, cosseno, tangente\n• **Triângulos**: Resolução de problemas\n• **Ondas**: Fenômenos periódicos\n• **Aplicações**: Engenharia, física\n\n### **Cálculo**\n• **Limites**: Comportamento de funções\n• **Derivadas**: Taxa de variação\n• **Integrais**: Área sob curvas\n• **Aplicações**: Otimização, modelagem\n\n### **Estatística**\n• **Análise de dados**: Interpretação de informações\n• **Probabilidade**: Chances e possibilidades\n• **Gráficos**: Visualização estatística\n• **Aplicações**: Pesquisa, medicina, economia\n\n## **Por que a Matemática é Importante?**\n\n• **Desenvolvimento do raciocínio lógico**\n• **Resolução de problemas complexos**\n• **Base para outras ciências**\n• **Aplicações práticas no dia a dia**\n• **Desenvolvimento de habilidades analíticas**\n\n**💡 Dica**: A matemática não é sobre decorar fórmulas, mas sobre entender conceitos e desenvolver o pensamento lógico!\n\n**Qual área você gostaria de explorar?**`
          specificActions = [
            { type: 'cta' as const, label: 'Álgebra', module: 'professor', args: { topic: 'algebra' } },
            { type: 'cta' as const, label: 'Geometria', module: 'professor', args: { topic: 'geometria' } },
            { type: 'cta' as const, label: 'Trigonometria', module: 'professor', args: { topic: 'trigonometria' } }
          ]
          break
          
        case 'física':
          specificResponse = `⚡ **Física - Desvendando os Mistérios do Universo**\n\nA física é a ciência que estuda a natureza e os fenômenos que ocorrem no universo. É através dela que entendemos desde o movimento de uma bola até os segredos das estrelas!\n\n## **Principais Áreas da Física**\n\n### **Mecânica**\n• **Cinemática**: Estudo do movimento\n• **Dinâmica**: Forças e suas causas\n• **Energia**: Conservação e transformação\n• **Gravitação**: Atração entre corpos\n\n### **Termodinâmica**\n• **Calor**: Transferência de energia térmica\n• **Temperatura**: Medida da energia cinética\n• **Leis da termodinâmica**: Princípios fundamentais\n• **Máquinas térmicas**: Motores e refrigeradores\n\n### **Eletromagnetismo**\n• **Eletricidade**: Cargas e correntes\n• **Magnetismo**: Campos magnéticos\n• **Ondas eletromagnéticas**: Luz, rádio, raios X\n• **Circuitos**: Componentes elétricos\n\n### **Óptica**\n• **Luz**: Natureza e comportamento\n• **Reflexão**: Espelhos e superfícies\n• **Refração**: Lentes e prismas\n• **Cores**: Espectro e percepção\n\n### **Física Moderna**\n• **Relatividade**: Espaço e tempo\n• **Física quântica**: Mundo subatômico\n• **Física nuclear**: Energia atômica\n• **Astrofísica**: Estrelas e galáxias\n\n## **Aplicações Práticas**\n\n• **Tecnologia**: Smartphones, computadores, GPS\n• **Medicina**: Raios X, ressonância magnética\n• **Energia**: Usinas, painéis solares\n• **Transporte**: Aviões, carros, foguetes\n• **Comunicação**: Internet, satélites\n\n**💡 Dica**: A física está em tudo! Observe o mundo ao seu redor e tente entender os fenômenos que acontecem diariamente.\n\n**Qual área da física te interessa mais?**`
          specificActions = [
            { type: 'cta' as const, label: 'Mecânica', module: 'professor', args: { topic: 'mecanica' } },
            { type: 'cta' as const, label: 'Eletricidade', module: 'professor', args: { topic: 'eletricidade' } },
            { type: 'cta' as const, label: 'Aula completa', module: 'aula_interativa', args: { tema: 'fisica' } }
          ]
          break
          
        case 'química':
          specificResponse = `🧪 **Química - A Ciência das Transformações**\n\nA química é a ciência que estuda a matéria, suas propriedades, composição e as transformações que ela sofre. É através da química que entendemos como os materiais se comportam e como podemos criar novos produtos!\n\n## **Principais Áreas da Química**\n\n### **Química Geral**\n• **Átomos**: Estrutura e propriedades\n• **Moléculas**: Ligações químicas\n• **Tabela periódica**: Organização dos elementos\n• **Reações**: Transformações químicas\n\n### **Química Orgânica**\n• **Compostos de carbono**: Base da vida\n• **Hidrocarbonetos**: Petróleo e derivados\n• **Funções orgânicas**: Álcool, ácido, éter\n• **Polímeros**: Plásticos e fibras\n\n### **Química Inorgânica**\n• **Elementos**: Metais e não-metais\n• **Ácidos e bases**: pH e neutralização\n• **Sais**: Compostos iônicos\n• **Minerais**: Recursos naturais\n\n### **Físico-Química**\n• **Termodinâmica**: Energia nas reações\n• **Cinética**: Velocidade das reações\n• **Equilíbrio**: Estado de balanço\n• **Eletroquímica**: Reações com eletricidade\n\n## **Aplicações no Dia a Dia**\n\n• **Medicina**: Medicamentos e tratamentos\n• **Alimentação**: Conservantes e aditivos\n• **Cosméticos**: Produtos de beleza\n• **Limpeza**: Detergentes e sabões\n• **Tecnologia**: Baterias e semicondutores\n• **Agricultura**: Fertilizantes e pesticidas\n\n## **Importância da Química**\n\n• **Desenvolvimento de novos materiais**\n• **Soluções para problemas ambientais**\n• **Melhoria da qualidade de vida**\n• **Inovação tecnológica**\n• **Compreensão dos processos naturais**\n\n**💡 Dica**: A química está em tudo ao nosso redor! Desde o ar que respiramos até os alimentos que comemos.\n\n**Qual área da química você gostaria de explorar?**`
          specificActions = [
            { type: 'cta' as const, label: 'Conceitos básicos', module: 'professor', args: { topic: 'quimica_basica' } },
            { type: 'cta' as const, label: 'Química orgânica', module: 'professor', args: { topic: 'quimica_organica' } },
            { type: 'cta' as const, label: 'Aula completa', module: 'aula_interativa', args: { tema: 'quimica' } }
          ]
          break
          
        case 'biologia':
          specificResponse = `🧬 **Biologia - A Ciência da Vida**\n\nA biologia é a ciência que estuda a vida em todas suas formas e manifestações. É através dela que entendemos como os seres vivos funcionam, se relacionam e evoluem ao longo do tempo!\n\n## **Principais Áreas da Biologia**\n\n### **Biologia Celular**\n• **Células**: Unidade básica da vida\n• **Organelas**: Estruturas celulares\n• **Metabolismo**: Processos químicos\n• **Divisão celular**: Reprodução e crescimento\n\n### **Genética**\n• **DNA**: Código genético\n• **Genes**: Unidades hereditárias\n• **Hereditariedade**: Transmissão de características\n• **Mutação**: Variações genéticas\n\n### **Ecologia**\n• **Ecossistemas**: Relações ambientais\n• **Biodiversidade**: Variedade de vida\n• **Cadeias alimentares**: Fluxo de energia\n• **Conservação**: Preservação da natureza\n\n### **Evolução**\n• **Seleção natural**: Adaptação ao ambiente\n• **Especiação**: Formação de novas espécies\n• **Fósseis**: Evidências evolutivas\n• **Árvore da vida**: Relacionamento entre espécies\n\n### **Fisiologia**\n• **Sistemas**: Digestivo, circulatório, nervoso\n• **Órgãos**: Funções específicas\n• **Homeostase**: Equilíbrio interno\n• **Adaptações**: Sobrevivência e reprodução\n\n## **Aplicações Práticas**\n\n• **Medicina**: Diagnóstico e tratamento\n• **Agricultura**: Melhoramento de culturas\n• **Biotecnologia**: Produção de medicamentos\n• **Conservação**: Proteção de espécies\n• **Pesquisa**: Descobertas científicas\n\n## **Importância da Biologia**\n\n• **Compreensão da vida humana**\n• **Preservação do meio ambiente**\n• **Desenvolvimento de tecnologias**\n• **Melhoria da saúde**\n• **Sustentabilidade planetária**\n\n**💡 Dica**: A biologia conecta tudo! Desde as menores bactérias até os maiores ecossistemas, tudo está interligado.\n\n**Qual área da biologia te interessa mais?**`
          specificActions = [
            { type: 'cta' as const, label: 'Biologia celular', module: 'professor', args: { topic: 'biologia_celular' } },
            { type: 'cta' as const, label: 'Genética', module: 'professor', args: { topic: 'genetica' } },
            { type: 'cta' as const, label: 'Aula completa', module: 'aula_interativa', args: { tema: 'biologia' } }
          ]
          break
          
        default:
          specificResponse = `📚 **${subject.charAt(0).toUpperCase() + subject.slice(1)} - Seu Guia de Estudos**\n\nÓtimo! Vou te ajudar com suas dúvidas sobre ${subject}. Como seu professor virtual, estou aqui para tornar o aprendizado mais fácil e interessante!\n\n## **Como Posso Te Ajudar?**\n\n### **Explicações Detalhadas**\n• Conceitos fundamentais\n• Exemplos práticos\n• Aplicações no dia a dia\n• Conexões com outras matérias\n\n### **Resolução de Exercícios**\n• Passo a passo detalhado\n• Dicas e macetes\n• Métodos alternativos\n• Verificação de respostas\n\n### **Material de Apoio**\n• Resumos organizados\n• Fórmulas importantes\n• Conceitos-chave\n• Exercícios práticos\n\n## **Para Começar, Me Conte:**\n\n1. **Qual é sua dúvida específica?**\n2. **Em que nível você está estudando?** (Fundamental, Médio, Superior)\n3. **Você tem algum exercício ou problema em mente?**\n4. **Há algum tópico que você gostaria de revisar?**\n\n**💡 Dica**: Quanto mais específica for sua pergunta, melhor posso te ajudar! Não tenha medo de perguntar - estou aqui para esclarecer todas as suas dúvidas.\n\n**Vamos começar? Me conte sua dúvida!**`
          specificActions = [
            { type: 'cta' as const, label: 'Criar aula interativa', module: 'aula_interativa', args: { tema: message } },
            { type: 'cta' as const, label: 'Continuar conversa', module: 'professor', args: { action: 'continue' } }
          ]
      }
      
      return {
        text: specificResponse,
        blocks: [
          { 
            type: 'notice', 
            title: `Professor IA - ${subject.charAt(0).toUpperCase() + subject.slice(1)}`, 
            body: `Estou aqui para te ajudar com ${subject}. Escolha uma opção abaixo ou me conte sua dúvida específica!` 
          }
        ],
        actions: specificActions
      }
    }
    
    return {
      text: '🎓 **Professor IA - Seu Assistente de Estudos Pessoal**\n\nOlá! Sou seu professor virtual e estou aqui para tornar o aprendizado mais fácil, interessante e eficiente. Posso te ajudar com qualquer dúvida acadêmica!\n\n## **Matérias que Posso Ensinar:**\n\n### **Exatas**\n• **Matemática**: Álgebra, geometria, trigonometria, cálculo\n• **Física**: Mecânica, eletricidade, óptica, termodinâmica\n• **Química**: Geral, orgânica, inorgânica, físico-química\n\n### **Biológicas**\n• **Biologia**: Celular, genética, ecologia, evolução\n• **Ciências**: Meio ambiente, saúde, anatomia\n\n### **Humanas**\n• **História**: Geral, do Brasil, mundial\n• **Geografia**: Física, humana, política\n• **Português**: Gramática, literatura, redação\n• **Filosofia**: Ética, lógica, história da filosofia\n• **Sociologia**: Sociedade, cultura, política\n\n## **Como Posso Te Ajudar:**\n\n✅ **Explicações detalhadas e didáticas**\n✅ **Resolução de exercícios passo a passo**\n✅ **Criação de aulas interativas**\n✅ **Simulados e provas**\n✅ **Dicas de estudo e memorização**\n✅ **Material de apoio personalizado**\n\n**💡 Dica**: Quanto mais específica for sua pergunta, melhor posso te ajudar! Não tenha medo de perguntar - estou aqui para esclarecer todas as suas dúvidas.\n\n**Me conte: qual é sua dúvida ou o que você gostaria de aprender hoje?**',
      blocks: [
        { 
          type: 'notice', 
          title: '🎯 Professor IA Ativo', 
          body: 'Estou pronto para te ajudar com qualquer matéria! Escolha uma opção abaixo ou me conte sua dúvida específica.' 
        }
      ],
      actions: [
        { type: 'cta', label: '📚 Criar aula interativa', module: 'aula_interativa', args: {} },
        { type: 'cta', label: '🎯 Simulado rápido (5 questões)', module: 'enem', args: { quantidade_questoes: 5 } },
        { type: 'cta', label: '📖 Aula expandida completa', module: 'aula-expandida', args: {} }
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
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'ATENDIMENTO') {
          return { 
            intent: 'general', 
            module: 'atendimento', 
            confidence: data.classification.confidence || 0.4, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
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


