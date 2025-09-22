import { OrchestratorResponse } from '@/types'
import { registerModule, DetectedIntent } from './orchestrator'

// Helper function to get the correct classify URL
function getClassifyUrl(): string {
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
  
  return `${baseUrl}/api/classify`;
}

// aula_interativa module
registerModule({
  id: 'aula_interativa',
  name: 'Aula Interativa',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 1000, latency_ms: 1500 },
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
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
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    const tema = slots.tema || extractThemeFromMessage(message) || 'assunto'
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
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
    const tema = slots.tema || extractThemeFromMessage(message) || 'assunto'
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'ENEM_INTERATIVO') {
          return { 
            intent: 'quiz_request', 
            module: 'enem-interativo', 
            confidence: data.classification.confidence || 0.9, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'quiz_request', module: 'enem-interativo', confidence: 0.3, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'TI') {
          return { 
            intent: 'ti_support', 
            module: 'ti_troubleshooting', 
            confidence: data.classification.confidence || 0.8, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'ti_support', module: 'ti_troubleshooting', confidence: 0.3, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'SECRETARIA') {
          return { 
            intent: 'faq_request', 
            module: 'faq_escola', 
            confidence: data.classification.confidence || 0.75, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'faq_request', module: 'faq_escola', confidence: 0.25, slots: {} }
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

// bem-estar module
registerModule({
  id: 'bem-estar',
  name: 'Bem-Estar',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 700, latency_ms: 1000 },
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'BEM_ESTAR') {
          return { 
            intent: 'wellbeing_support', 
            module: 'bem-estar', 
            confidence: data.classification.confidence || 0.85, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'wellbeing_support', module: 'bem-estar', confidence: 0.3, slots: {} }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const message = context?.text || ''
    const lowerMessage = message.toLowerCase()
    
    // Detectar estado emocional específico
    let emotionalState = 'geral'
    let specificResponse = ''
    let specificActions = []
    
    if (lowerMessage.includes('triste') || lowerMessage.includes('tristeza') || lowerMessage.includes('deprimido') || lowerMessage.includes('depressão')) {
      emotionalState = 'tristeza'
      specificResponse = `💙 **Você não está sozinho(a)**\n\nEntendo que você está passando por um momento difícil. É completamente normal sentir tristeza às vezes, e é importante reconhecer esses sentimentos.\n\n## **Lembre-se:**\n\n• **Suas emoções são válidas** - não há problema em se sentir triste\n• **Este momento vai passar** - sentimentos são temporários\n• **Você é mais forte do que imagina** - já superou desafios antes\n• **É corajoso pedir ajuda** - reconhecer que precisa de apoio é um ato de força\n\n## **O que pode ajudar agora:**\n\n🌱 **Respire fundo** - Inspire por 4 segundos, segure por 4, expire por 6\n🌱 **Faça algo gentil por você** - tome um banho quente, ouça música que gosta\n🌱 **Conecte-se com alguém** - um amigo, familiar ou profissional\n🌱 **Movimente-se** - mesmo uma caminhada curta pode ajudar\n🌱 **Expresse-se** - escreva, desenhe, ou simplesmente chore se precisar\n\n## **Recursos de Apoio:**\n\n• **CVV (Centro de Valorização da Vida)**: 188 (24h, gratuito)\n• **Psicólogos escolares**: Disponíveis na escola\n• **Profissionais de saúde mental**: Sempre disponíveis\n\n**💡 Dica**: Pequenos passos são grandes conquistas. Não precisa resolver tudo de uma vez.`
      
      specificActions = [
        { type: 'cta', label: 'Falar com psicólogo da escola', module: 'bem-estar', args: { action: 'school_psychologist' } },
        { type: 'cta', label: 'Técnicas de respiração', module: 'bem-estar', args: { action: 'breathing_exercises' } },
        { type: 'cta', label: 'Atividades de autocuidado', module: 'bem-estar', args: { action: 'self_care' } }
      ]
    } else if (lowerMessage.includes('ansiedade') || lowerMessage.includes('nervoso') || lowerMessage.includes('preocupado') || lowerMessage.includes('medo')) {
      emotionalState = 'ansiedade'
      specificResponse = `🧘 **Respire e se acalme**\n\nEntendo que você está se sentindo ansioso(a) ou preocupado(a). A ansiedade é uma resposta natural do nosso corpo, mas podemos aprender a gerenciá-la.\n\n## **Técnicas Rápidas para Agora:**\n\n### **Respiração 4-7-8**\n• Inspire pelo nariz por 4 segundos\n• Segure a respiração por 7 segundos\n• Expire pela boca por 8 segundos\n• Repita 3-4 vezes\n\n### **Grounding (Técnica 5-4-3-2-1)**\n• **5 coisas** que você pode ver\n• **4 coisas** que você pode tocar\n• **3 coisas** que você pode ouvir\n• **2 coisas** que você pode cheirar\n• **1 coisa** que você pode saborear\n\n## **Lembre-se:**\n\n✅ **A ansiedade é temporária** - vai diminuir\n✅ **Você está seguro(a)** - este momento vai passar\n✅ **Respire fundo** - seu corpo sabe como se acalmar\n✅ **Você não está sozinho(a)** - muitas pessoas sentem isso\n\n## **Quando Buscar Ajuda:**\n\n• Se a ansiedade está interferindo na sua vida diária\n• Se você está evitando atividades que gostava\n• Se os sintomas físicos são intensos\n• Se você tem pensamentos preocupantes\n\n**💡 Dica**: A ansiedade é como uma onda - ela cresce, atinge o pico e depois diminui. Você pode surfar essa onda!`
      
      specificActions = [
        { type: 'cta', label: 'Exercício de respiração guiado', module: 'bem-estar', args: { action: 'guided_breathing' } },
        { type: 'cta', label: 'Técnica de grounding', module: 'bem-estar', args: { action: 'grounding' } },
        { type: 'cta', label: 'Falar com psicólogo', module: 'bem-estar', args: { action: 'psychologist' } }
      ]
    } else if (lowerMessage.includes('raiva') || lowerMessage.includes('irritado') || lowerMessage.includes('frustrado')) {
      emotionalState = 'raiva'
      specificResponse = `🔥 **Vamos acalmar essa energia**\n\nEntendo que você está se sentindo irritado(a) ou com raiva. Esses sentimentos são normais e válidos - o importante é como lidamos com eles.\n\n## **Técnicas para Agora:**\n\n### **Pausa e Respire**\n• Pare por 10 segundos antes de reagir\n• Respire fundo 3 vezes\n• Conte até 10 lentamente\n\n### **Libere a Energia**\n• Bata em uma almofada\n• Faça exercícios físicos\n• Dance ou movimente-se\n• Escreva sobre seus sentimentos\n\n### **Reflita**\n• O que realmente está te incomodando?\n• É algo que você pode controlar?\n• Como você gostaria de resolver isso?\n\n## **Lembre-se:**\n\n✅ **A raiva é uma emoção válida** - não há problema em senti-la\n✅ **Você pode escolher como reagir** - você tem controle\n✅ **Comunicação é chave** - falar sobre seus sentimentos ajuda\n✅ **Buscar soluções** é melhor que ficar preso no problema\n\n## **Quando Buscar Ajuda:**\n\n• Se a raiva está afetando seus relacionamentos\n• Se você está tendo explosões frequentes\n• Se está se machucando ou machucando outros\n• Se a raiva está durando muito tempo\n\n**💡 Dica**: A raiva muitas vezes esconde outros sentimentos como tristeza, medo ou frustração. Que tal explorar o que realmente está acontecendo?`
      
      specificActions = [
        { type: 'cta', label: 'Técnicas de relaxamento', module: 'bem-estar', args: { action: 'relaxation' } },
        { type: 'cta', label: 'Exercícios físicos', module: 'bem-estar', args: { action: 'physical_exercise' } },
        { type: 'cta', label: 'Conversar sobre sentimentos', module: 'bem-estar', args: { action: 'talk_about_feelings' } }
      ]
    } else {
      // Resposta geral para outros casos
      specificResponse = `🤗 **Estou aqui para te apoiar**\n\nVejo que você está passando por um momento difícil. É corajoso da sua parte compartilhar isso comigo.\n\n## **Você não está sozinho(a)**\n\n• **Suas emoções são importantes** - todos os sentimentos são válidos\n• **É normal ter altos e baixos** - faz parte da vida\n• **Buscar ajuda é um sinal de força** - não de fraqueza\n• **Você é capaz de superar isso** - já enfrentou desafios antes\n\n## **Recursos Disponíveis:**\n\n### **Suporte Imediato**\n• **CVV**: 188 (24h, gratuito)\n• **Psicólogos da escola**: Sempre disponíveis\n• **Profissionais de saúde mental**: Para apoio especializado\n\n### **Autocuidado**\n• **Respire fundo** - técnicas de respiração\n• **Movimente-se** - exercícios leves\n• **Conecte-se** - com pessoas que você confia\n• **Expresse-se** - escreva, desenhe, converse\n\n## **Lembre-se:**\n\n✅ **Este momento vai passar** - sentimentos são temporários\n✅ **Você tem recursos internos** - força e resiliência\n✅ **Há pessoas que se importam** - você não está sozinho(a)\n✅ **É okay não estar okay** - todos temos dias difíceis\n\n**💡 Dica**: Pequenos passos diários podem fazer uma grande diferença. Que tal começar com algo simples que te faça bem?`
      
      specificActions = [
        { type: 'cta', label: 'Falar com psicólogo da escola', module: 'bem-estar', args: { action: 'school_psychologist' } },
        { type: 'cta', label: 'Técnicas de autocuidado', module: 'bem-estar', args: { action: 'self_care_techniques' } },
        { type: 'cta', label: 'Exercícios de relaxamento', module: 'bem-estar', args: { action: 'relaxation_exercises' } }
      ]
    }
    
    return {
      text: specificResponse,
      blocks: [
        { 
          type: 'notice', 
          title: '💙 Suporte Emocional Disponível', 
          body: `Nossa equipe de psicologia está sempre disponível para conversar. Você não está sozinho(a) neste momento.`,
          meta: { 
            support_type: 'emotional',
            emotional_state: emotionalState,
            timestamp: new Date().toISOString()
          }
        }
      ],
      actions: specificActions
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'FINANCEIRO') {
          return { 
            intent: 'financial_support', 
            module: 'financeiro', 
            confidence: data.classification.confidence || 0.8, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'financial_support', module: 'financeiro', confidence: 0.25, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'RH') {
          return { 
            intent: 'hr_support', 
            module: 'rh', 
            confidence: data.classification.confidence || 0.75, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'hr_support', module: 'rh', confidence: 0.25, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'COORDENACAO') {
          return { 
            intent: 'coordination_support', 
            module: 'coordenacao', 
            confidence: data.classification.confidence || 0.75, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'coordination_support', module: 'coordenacao', confidence: 0.25, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'SOCIAL_MEDIA') {
          return { 
            intent: 'social_media_support', 
            module: 'social_media', 
            confidence: data.classification.confidence || 0.7, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'social_media_support', module: 'social_media', confidence: 0.25, slots: {} }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'CONTEUDO_MIDIA') {
          return { 
            intent: 'media_request', 
            module: 'conteudo_midia', 
            confidence: data.classification.confidence || 0.7, 
            slots: {} 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'media_request', module: 'conteudo_midia', confidence: 0.25, slots: {} }
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
  
  // Matemática e suas áreas
  if (lowerMessage.includes('eq') || lowerMessage.includes('equação') || lowerMessage.includes('equacao') || 
      lowerMessage.includes('grau') || lowerMessage.includes('bhaskara') || lowerMessage.includes('delta') ||
      lowerMessage.includes('raiz') || lowerMessage.includes('função') || lowerMessage.includes('funcao') ||
      lowerMessage.includes('polinômio') || lowerMessage.includes('polinomio')) return 'matemática'
  if (lowerMessage.includes('geometria') || lowerMessage.includes('triângulo') || lowerMessage.includes('triangulo') ||
      lowerMessage.includes('círculo') || lowerMessage.includes('circulo') || lowerMessage.includes('área') ||
      lowerMessage.includes('area') || lowerMessage.includes('perímetro') || lowerMessage.includes('perimetro') ||
      lowerMessage.includes('volume')) return 'geometria'
  if (lowerMessage.includes('trigonometria') || lowerMessage.includes('trigonomteria') || lowerMessage.includes('trigonom') ||
      lowerMessage.includes('seno') || lowerMessage.includes('coseno') || lowerMessage.includes('tangente')) return 'trigonometria'
  if (lowerMessage.includes('álgebra') || lowerMessage.includes('algebra')) return 'álgebra'
  if (lowerMessage.includes('cálculo') || lowerMessage.includes('calculo') || lowerMessage.includes('derivada') ||
      lowerMessage.includes('integral') || lowerMessage.includes('limite')) return 'cálculo'
  if (lowerMessage.includes('logaritmo') || lowerMessage.includes('exponencial')) return 'matemática'
  if (lowerMessage.includes('probabilidade') || lowerMessage.includes('estatística') || lowerMessage.includes('estatistica')) return 'matemática'
  if (lowerMessage.includes('matemática') || lowerMessage.includes('matematica')) return 'matemática'
  
  // Outras matérias
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

function extractThemeFromMessage(message: string): string {
  if (!message || message.trim().length === 0) return '';
  
  const lowerMessage = message.toLowerCase().trim();
  
  // Remover palavras comuns que não são temas
  const commonWords = [
    'aula', 'sobre', 'explicar', 'explica', 'como', 'funciona', 'o que é', 'definição', 'conceito',
    'quero', 'preciso', 'gostaria', 'me ajude', 'ajuda', 'ajude', 'dúvida', 'duvida', 'questão', 'questao',
    'exercício', 'exercicio', 'problema', 'resolver', 'entender', 'aprender', 'estudar',
    'uma', 'um', 'de', 'da', 'do', 'das', 'dos', 'com', 'para', 'por', 'em', 'na', 'no', 'nas', 'nos',
    'detalhadamente', 'detalhada', 'detalhado'
  ];
  
  // Extrair palavras-chave principais (mantendo acentos)
  const words = lowerMessage
    .replace(/[?!.,;:]/g, '') // Remove apenas pontuação, mantém acentos
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  // Se há palavras específicas, usar as primeiras 2-3 como tema
  if (words.length > 0) {
    return words.slice(0, 3).join(' ');
  }
  
  // Se não há palavras específicas, usar parte da mensagem original
  return message.trim().substring(0, 50);
}

// professor module
registerModule({
  id: 'professor',
  name: 'Professor IA',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 800, latency_ms: 1000 },
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
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
    const testPattern = /(geometria|matemática|matematica|álgebra|algebra|cálculo|calculo|trigonometria|física|fisica|química|quimica|biologia|história|historia|português|portugues|dúvida|duvida|questão|questao|exercício|exercicio)/i;
    const testResult = testPattern.test(message);
    
    console.log('🔍 [PROFESSOR DEBUG]', {
      message: message.substring(0, 50) + '...',
      messageLength: message.length,
      hasGeometria: message.includes('geometria'),
      hasMatematica: message.includes('matematica'),
      testResult,
      pattern: testPattern.toString(),
      subject: getSubjectName(message)
    })
    
    // Se for uma pergunta específica sobre geometria ou outras matérias, responder diretamente
    if (/(geometria|matemática|matematica|álgebra|algebra|cálculo|calculo|trigonometria|trigonomteria|trigonom|física|fisica|química|quimica|biologia|fotossíntese|fotossintese|mitose|meiose|genética|genetica|evolução|evolucao|ecossistema|história|historia|português|portugues|literatura|gramática|gramatica|dúvida|duvida|questão|questao|exercício|exercicio|eq|equação|equacao|grau|segundo grau|primeiro grau|bhaskara|delta|raiz|função|funcao|polinômio|polinomio|geometria|triângulo|triangulo|círculo|circulo|área|area|perímetro|perimetro|volume|seno|coseno|tangente|logaritmo|exponencial|derivada|integral|limite|probabilidade|estatística|estatistica)/i.test(message)) {
      const subject = getSubjectName(message)
      
      console.log('🎯 [PROFESSOR] Subject detected:', subject, 'for message:', message.substring(0, 50))
      
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
          // Check if it's specifically about equations of second degree
          if (lowerMessage.includes('eq') && lowerMessage.includes('grau')) {
            specificResponse = `📐 **Equações do Segundo Grau - Guia Completo**\n\nAs equações do segundo grau são fundamentais na matemática! Elas aparecem em muitos problemas práticos e são a base para entender funções quadráticas.\n\n## **Forma Geral da Equação**\n\n**ax² + bx + c = 0**\n\nOnde:\n• **a ≠ 0** (coeficiente do termo quadrático)\n• **b** (coeficiente do termo linear)\n• **c** (termo independente)\n\n## **Como Resolver**\n\n### **1. Fórmula de Bhaskara**\n\n**x = (-b ± √Δ) / 2a**\n\nOnde **Δ = b² - 4ac** (discriminante)\n\n### **2. Análise do Discriminante**\n\n• **Δ > 0**: Duas raízes reais diferentes\n• **Δ = 0**: Uma raiz real (dupla)\n• **Δ < 0**: Duas raízes complexas\n\n## **Exemplo Prático**\n\n**Resolva: x² - 5x + 6 = 0**\n\n1. **Identifique os coeficientes**:\n   • a = 1, b = -5, c = 6\n\n2. **Calcule o discriminante**:\n   • Δ = (-5)² - 4(1)(6) = 25 - 24 = 1\n\n3. **Aplique a fórmula**:\n   • x = (5 ± √1) / 2\n   • x₁ = (5 + 1) / 2 = 3\n   • x₂ = (5 - 1) / 2 = 2\n\n## **Aplicações Práticas**\n\n• **Física**: Movimento de projéteis\n• **Engenharia**: Cálculo de estruturas\n• **Economia**: Análise de lucros\n• **Geometria**: Problemas de área\n• **Gráficos**: Parábolas\n\n## **Dicas Importantes**\n\n✅ **Sempre verifique se a = 0** (não é equação do 2º grau)\n✅ **Calcule o discriminante primeiro**\n✅ **Use a fórmula de Bhaskara quando necessário**\n✅ **Verifique suas respostas substituindo na equação original**\n\n**💡 Dica**: Pratique com muitos exemplos! A resolução de equações do segundo grau fica mais fácil com a prática.\n\n**Quer que eu resolva uma equação específica ou tem alguma dúvida sobre o processo?**`
            specificActions = [
              { type: 'cta' as const, label: 'Resolver equação específica', module: 'professor', args: { topic: 'resolver_equacao' } },
              { type: 'cta' as const, label: 'Mais exemplos', module: 'professor', args: { topic: 'exemplos_equacoes' } },
              { type: 'cta' as const, label: 'Aula completa sobre equações', module: 'aula_interativa', args: { tema: 'equacoes_segundo_grau' } }
            ]
          } else {
            specificResponse = `🔢 **Matemática - A Linguagem Universal**\n\nA matemática é muito mais que números! É a linguagem que descreve o universo, desde as menores partículas até as maiores galáxias. É uma ferramenta poderosa para resolver problemas e entender o mundo ao nosso redor.\n\n## **Principais Áreas da Matemática**\n\n### **Álgebra**\n• **Equações**: Resolução de problemas matemáticos\n• **Funções**: Relações entre variáveis\n• **Gráficos**: Visualização de dados\n• **Polinômios**: Expressões algébricas complexas\n\n### **Geometria**\n• **Formas**: Triângulos, círculos, polígonos\n• **Espaço**: Geometria 3D e sólidos\n• **Medidas**: Área, perímetro, volume\n• **Transformações**: Movimentos geométricos\n\n### **Trigonometria**\n• **Funções**: Seno, cosseno, tangente\n• **Triângulos**: Resolução de problemas\n• **Ondas**: Fenômenos periódicos\n• **Aplicações**: Engenharia, física\n\n### **Cálculo**\n• **Limites**: Comportamento de funções\n• **Derivadas**: Taxa de variação\n• **Integrais**: Área sob curvas\n• **Aplicações**: Otimização, modelagem\n\n### **Estatística**\n• **Análise de dados**: Interpretação de informações\n• **Probabilidade**: Chances e possibilidades\n• **Gráficos**: Visualização estatística\n• **Aplicações**: Pesquisa, medicina, economia\n\n## **Por que a Matemática é Importante?**\n\n• **Desenvolvimento do raciocínio lógico**\n• **Resolução de problemas complexos**\n• **Base para outras ciências**\n• **Aplicações práticas no dia a dia**\n• **Desenvolvimento de habilidades analíticas**\n\n**💡 Dica**: A matemática não é sobre decorar fórmulas, mas sobre entender conceitos e desenvolver o pensamento lógico!\n\n**Qual área você gostaria de explorar?**`
            specificActions = [
              { type: 'cta' as const, label: 'Álgebra', module: 'professor', args: { topic: 'algebra' } },
              { type: 'cta' as const, label: 'Geometria', module: 'professor', args: { topic: 'geometria' } },
              { type: 'cta' as const, label: 'Trigonometria', module: 'professor', args: { topic: 'trigonometria' } }
            ]
          }
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
          
        case 'história':
          specificResponse = `📜 **História - Conhecendo o Passado para Entender o Presente**\n\nA história é a ciência que estuda o passado da humanidade, analisando eventos, sociedades e transformações ao longo do tempo. É através dela que entendemos como chegamos até aqui e podemos construir um futuro melhor!\n\n## **Principais Períodos Históricos**\n\n### **História Antiga**\n• **Civilizações**: Egito, Mesopotâmia, Grécia, Roma\n• **Impérios**: Persa, Macedônico, Romano\n• **Culturas**: Desenvolvimento da escrita, leis, filosofia\n• **Conquistas**: Alexandre, Júlio César, Augusto\n\n### **História Medieval**\n• **Feudalismo**: Sistema social e econômico\n• **Cristianismo**: Expansão e influência religiosa\n• **Impérios**: Bizantino, Carolíngio, Islâmico\n• **Cruzadas**: Conflitos religiosos e comerciais\n\n### **História Moderna**\n• **Renascimento**: Renovação cultural e científica\n• **Reforma**: Transformações religiosas\n• **Absolutismo**: Centralização do poder\n• **Revoluções**: Inglesa, Americana, Francesa\n\n### **História Contemporânea**\n• **Revolução Industrial**: Transformação econômica\n• **Imperialismo**: Expansão colonial\n• **Guerras Mundiais**: Conflitos globais\n• **Guerra Fria**: Polarização política\n\n## **História do Brasil**\n\n### **Período Colonial**\n• **Descobrimento**: 1500 e os primeiros contatos\n• **Capitanias**: Sistema de administração\n• **Ciclo do Açúcar**: Economia colonial\n• **Escravidão**: Sistema de trabalho\n\n### **Período Imperial**\n• **Independência**: 1822 e processo de separação\n• **Primeiro Reinado**: Dom Pedro I\n• **Regência**: Período de transição\n• **Segundo Reinado**: Dom Pedro II e abolição\n\n### **República**\n• **República Velha**: Primeira República\n• **Era Vargas**: Getúlio Vargas e modernização\n• **Ditadura Militar**: 1964-1985\n• **Redemocratização**: Nova República\n\n## **Como Estudar História**\n\n### **Métodos de Estudo**\n• **Linha do tempo**: Organização cronológica\n• **Mapas**: Localização geográfica dos eventos\n• **Causas e consequências**: Análise de relações\n• **Comparações**: Entre períodos e sociedades\n\n### **Dicas para Provas**\n• **Contextualize**: Entenda o período histórico\n• **Conecte**: Relacione eventos e personagens\n• **Analise**: Vá além da memorização\n• **Pratique**: Faça exercícios e simulados\n\n## **Importância da História**\n\n• **Formação cidadã**: Compreensão da sociedade\n• **Pensamento crítico**: Análise de fontes\n• **Identidade cultural**: Conhecimento das raízes\n• **Prevenção de erros**: Aprender com o passado\n• **Visão de futuro**: Planejamento baseado em experiências\n\n**💡 Dica**: A história não é só memorizar datas! É entender processos, causas e consequências. Sempre pergunte "por que" e "como" os eventos aconteceram.\n\n**Qual período ou tema da história você gostaria de estudar?**`
          specificActions = [
            { type: 'cta' as const, label: 'História do Brasil', module: 'professor', args: { topic: 'historia_brasil' } },
            { type: 'cta' as const, label: 'História Mundial', module: 'professor', args: { topic: 'historia_mundial' } },
            { type: 'cta' as const, label: 'Aula completa', module: 'aula_interativa', args: { tema: 'historia' } }
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
    
    console.log('⚠️ [PROFESSOR] Returning generic response - no specific subject detected')
    
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

// pesquisa_tempo_real module - usa Perplexity AI SDK para pesquisas em tempo real
registerModule({
  id: 'pesquisa_tempo_real',
  name: 'Pesquisa em Tempo Real',
  version: '1.0.0',
  permissions: { requires_auth: false },
  cost_estimate: { tokens: 1500, latency_ms: 3000 },
  async detect({ text, context }): Promise<DetectedIntent> {
    // Detectar se é uma pergunta que requer pesquisa em tempo real
    const lowerText = text.toLowerCase()
    
    // Palavras-chave que indicam necessidade de pesquisa em tempo real
    const realTimeKeywords = [
      'notícias', 'atual', 'hoje', 'agora', 'recente', 'últimas', 'atualidade',
      'tendências', 'mercado', 'economia', 'política', 'tecnologia', 'ciência',
      'eventos', 'acontecimentos', 'situação atual', 'estado atual', 'como está',
      'o que está acontecendo', 'novidades', 'desenvolvimentos', 'atualização',
      'dados atuais', 'informações recentes', 'última hora', 'breaking news'
    ]
    
    const hasRealTimeKeywords = realTimeKeywords.some(keyword => 
      lowerText.includes(keyword)
    )
    
    // Perguntas que claramente precisam de dados atuais
    const realTimeQuestions = [
      'qual é a situação atual', 'como está', 'o que está acontecendo',
      'quais são as últimas', 'me fale sobre as tendências atuais',
      'dados mais recentes', 'informações atualizadas', 'estado atual do',
      'desenvolvimentos recentes', 'novidades sobre', 'atualização sobre'
    ]
    
    const hasRealTimeQuestions = realTimeQuestions.some(question => 
      lowerText.includes(question)
    )
    
    if (hasRealTimeKeywords || hasRealTimeQuestions) {
      return { 
        intent: 'real_time_research', 
        module: 'pesquisa_tempo_real', 
        confidence: 0.9, 
        slots: { query: text } 
      }
    }
    
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classification?.module === 'PESQUISA_TEMPO_REAL') {
          return { 
            intent: 'real_time_research', 
            module: 'pesquisa_tempo_real', 
            confidence: data.classification.confidence || 0.8, 
            slots: { query: text } 
          };
        }
      }
    } catch (error) {
      console.error('Erro na detecção OpenAI:', error);
    }

    // Fallback simples apenas em caso de erro
    return { intent: 'real_time_research', module: 'pesquisa_tempo_real', confidence: 0.3, slots: { query: text } }
  },
  async execute({ slots, context }): Promise<OrchestratorResponse> {
    const query = slots.query || context?.text || ''
    
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
      
      // Fazer chamada para o endpoint de teste do Perplexity (sem autenticação)
      const response = await fetch(`${baseUrl}/api/test-perplexity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          text: `🔍 **Pesquisa em Tempo Real**\n\n${data.response || 'Desculpe, não consegui encontrar informações atualizadas.'}\n\n*Informações pesquisadas em tempo real usando Perplexity AI*`,
          blocks: [
            { 
              type: 'notice', 
              title: '📡 Pesquisa em Tempo Real', 
              body: 'Esta resposta foi gerada com base em informações atuais e em tempo real.' 
            }
          ],
          actions: [
            { type: 'cta', label: 'Nova pesquisa', module: 'pesquisa_tempo_real', args: {} },
            { type: 'cta', label: 'Criar aula sobre o tema', module: 'aula_interativa', args: { tema: query } }
          ],
          trace: { module: 'pesquisa_tempo_real', confidence: 0.9 }
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Erro na pesquisa com Perplexity:', error)
      return {
        text: 'Desculpe, não consegui realizar a pesquisa em tempo real no momento. Posso te ajudar de outra forma?',
        blocks: [],
        actions: [
          { type: 'cta', label: 'Tentar pesquisa novamente', module: 'pesquisa_tempo_real', args: {} },
          { type: 'cta', label: 'Criar aula interativa', module: 'aula_interativa', args: {} }
        ],
        trace: { module: 'pesquisa_tempo_real', confidence: 0.3, errors: ['perplexity_error'] }
      }
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
  async detect({ text, context }): Promise<DetectedIntent> {
    // Sempre usar OpenAI para detecção - maior certeza
    try {
      const response = await fetch(getClassifyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: text,
          history: context?.history || [],
          currentModule: context?.module || 'auto'
        }),
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


