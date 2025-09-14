// Utilitários para construir slides seguindo o padrão do HubEdu antigo
// Estrutura fixa de 8 slides com perguntas nas posições 4 e 7

export interface Slide {
  id?: string;
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content?: string;
  question?: string;
  options?: string[];
  correctOption?: number;
  helpMessage?: string;
  correctAnswer?: string;
  payload?: { hash?: string; title?: string };
  // Nova estrutura de 2 cards
  card1?: {
    title: string;
    content: string;
  };
  card2?: {
    title: string;
    content: string;
    imageUrl?: string;
    options?: string[];
    correctOption?: number;
    helpMessage?: string;
    correctAnswer?: string;
  };
}

/**
 * Remove slides duplicados baseado no tipo e conteúdo
 */
export function dedupeSlides(slides: Slide[]): Slide[] {
  const seen = new Set<string>();
  return slides.filter((slide, index) => {
    // Criar uma chave única baseada no índice, tipo e conteúdo
    const contentHash = slide.card1?.content?.substring(0, 50) || slide.content?.substring(0, 50) || '';
    const key = `${index}:${slide.type}:${contentHash}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Força o padrão de 8 slides com perguntas nas posições 4 e 7
 * Seguindo a lógica do HubEdu antigo
 */
export function forcarPadrao34e8(slides: Slide[]): Slide[] {
  return slides.map((slide, index) => {
    const idx = index + 1; // 1-based
    const deveSerPergunta = idx === 4 || idx === 7; // Slide 4 e 7 são perguntas
    
    if (deveSerPergunta) {
      return { 
        ...slide, 
        type: 'question' as const,
        // Garantir que tenha estrutura de pergunta se não tiver
        question: slide.question || slide.content || 'Pergunta de verificação',
        options: slide.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctOption: slide.correctOption ?? 0,
        helpMessage: slide.helpMessage || 'Analise as opções cuidadosamente',
        correctAnswer: slide.correctAnswer || 'Explicação da resposta correta',
        // Estrutura de 2 cards para perguntas
        card1: slide.card1 || {
          title: 'Pergunta',
          content: slide.question || slide.content || 'Pergunta de verificação'
        },
        card2: slide.card2 || {
          title: 'Opções de Resposta',
          content: 'Escolha a resposta que melhor representa seu entendimento:',
          options: slide.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          correctOption: slide.correctOption ?? 0,
          helpMessage: slide.helpMessage || 'Analise as opções cuidadosamente',
          correctAnswer: slide.correctAnswer || 'Explicação da resposta correta'
        }
      };
    }
    
    // Se era uma pergunta mas não deveria ser, converter para explicação
    if (slide.type === 'question') {
      return { 
        ...slide, 
        type: 'explanation' as const,
        content: slide.content || slide.question || 'Conteúdo explicativo',
        // Estrutura de 2 cards para explicações
        card1: slide.card1 || {
          title: 'Conteúdo Principal',
          content: slide.content || slide.question || 'Conteúdo explicativo'
        },
        card2: slide.card2 || {
          title: 'Detalhes Adicionais',
          content: 'Informações complementares sobre o tema abordado.'
        }
      };
    }
    
    return slide;
  });
}

/**
 * Garante que perguntas apareçam exatamente nos slides 4 e 7
 * Slide 8 é sempre resumo/conclusão
 */
export function enforceQuestionPositions(slides: Slide[]): Slide[] {
  return slides.map((slide, idx) => {
    const n = idx + 1; // 1-based
    const isQuestionSlot = n === 4 || n === 7; // Slide 4 e 7 são perguntas
    const isLastSlide = n === 8; // Slide 8 é resumo/conclusão
    
    if (isQuestionSlot) {
      return { 
        ...slide, 
        type: 'question' as const,
        // Garantir estrutura mínima de pergunta
        question: slide.question || slide.content || 'Pergunta de verificação',
        options: slide.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctOption: slide.correctOption ?? 0,
        helpMessage: slide.helpMessage || 'Analise as opções cuidadosamente',
        correctAnswer: slide.correctAnswer || 'Explicação da resposta correta',
        // Estrutura de 2 cards para perguntas
        card1: slide.card1 || {
          title: 'Pergunta',
          content: slide.question || slide.content || 'Pergunta de verificação'
        },
        card2: slide.card2 || {
          title: 'Opções de Resposta',
          content: 'Escolha a resposta que melhor representa seu entendimento:',
          options: slide.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          correctOption: slide.correctOption ?? 0,
          helpMessage: slide.helpMessage || 'Analise as opções cuidadosamente',
          correctAnswer: slide.correctAnswer || 'Explicação da resposta correta'
        }
      };
    }
    
    if (isLastSlide) {
      return { 
        ...slide, 
        type: 'explanation' as const,
        content: slide.content || 'Resumo e conclusão da aula',
        // Estrutura de 2 cards para slide final
        card1: slide.card1 || {
          title: 'Resumo do Conteúdo',
          content: slide.content || 'Resumo e conclusão da aula'
        },
        card2: slide.card2 || {
          title: 'Conclusão',
          content: 'Parabéns! Você concluiu esta aula interativa. Continue praticando e explorando!'
        }
      };
    }
    
    // Se era uma pergunta mas não deveria ser, converter para explicação
    if (slide.type === 'question') {
      return { 
        ...slide, 
        type: 'explanation' as const,
        content: slide.content || slide.question || 'Conteúdo explicativo',
        // Estrutura de 2 cards para explicações
        card1: slide.card1 || {
          title: 'Conteúdo Principal',
          content: slide.content || slide.question || 'Conteúdo explicativo'
        },
        card2: slide.card2 || {
          title: 'Detalhes Adicionais',
          content: 'Informações complementares sobre o tema abordado.'
        }
      };
    }
    
    return slide;
  });
}

/**
 * Cria uma estrutura padrão de 8 slides se não existir
 */
export function createDefault8SlidesStructure(): Slide[] {
  return [
    { 
      id: 'slide-1', 
      type: 'explanation', 
      content: 'Introdução ao tópico',
      card1: { title: 'Introdução', content: 'Vamos começar explorando os conceitos fundamentais deste tópico importante.' },
      card2: { title: 'Objetivos', content: 'Ao final desta aula, você terá uma compreensão sólida dos principais conceitos e aplicações práticas.' }
    },
    { 
      id: 'slide-2', 
      type: 'explanation', 
      content: 'Conceitos fundamentais',
      card1: { title: 'Conceitos Básicos', content: 'Vamos explorar os conceitos fundamentais que formam a base deste tópico.' },
      card2: { title: 'Exemplos Práticos', content: 'Vamos ver como estes conceitos se manifestam em situações reais do dia a dia.' }
    },
    { 
      id: 'slide-3', 
      type: 'explanation', 
      content: 'Desenvolvimento do conteúdo',
      card1: { title: 'Teoria', content: 'Agora vamos aprofundar nosso conhecimento explorando aspectos mais complexos.' },
      card2: { title: 'Aplicações', content: 'Vamos ver como aplicar este conhecimento em diferentes contextos e situações.' }
    },
    { 
      id: 'slide-4', 
      type: 'question', 
      question: 'Pergunta de verificação', 
      options: ['A', 'B', 'C', 'D'], 
      correctOption: 0,
      card1: { title: 'Pergunta', content: 'Agora vamos testar nosso entendimento com uma pergunta prática.' },
      card2: { 
        title: 'Opções de Resposta', 
        content: 'Escolha a resposta que melhor representa seu entendimento:',
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctOption: 0,
        helpMessage: 'Pense no que aprendemos até agora.',
        correctAnswer: 'A resposta correta é a Opção A.'
      }
    },
    { 
      id: 'slide-5', 
      type: 'explanation', 
      content: 'Aplicações práticas',
      card1: { title: 'Exemplos Reais', content: 'Vamos explorar exemplos reais de como este tema é aplicado em diferentes áreas.' },
      card2: { title: 'Casos de Uso', content: 'Estes casos demonstram a versatilidade e importância do tema em diversas situações.' }
    },
    { 
      id: 'slide-6', 
      type: 'explanation', 
      content: 'Exemplos e exercícios',
      card1: { title: 'Exercício Prático', content: 'Agora vamos praticar com um exercício que combina teoria e aplicação prática.' },
      card2: { title: 'Solução Comentada', content: 'Vamos analisar a solução passo a passo, entendendo o raciocínio por trás de cada etapa.' }
    },
    { 
      id: 'slide-7', 
      type: 'question', 
      question: 'Segunda pergunta', 
      options: ['A', 'B', 'C', 'D'], 
      correctOption: 0,
      card1: { title: 'Segunda Pergunta', content: 'Vamos testar novamente nosso conhecimento com uma pergunta mais avançada.' },
      card2: { 
        title: 'Opções de Resposta', 
        content: 'Analise cuidadosamente cada opção:',
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctOption: 0,
        helpMessage: 'Considere o que aprendemos sobre análise e aplicação.',
        correctAnswer: 'A resposta correta é a Opção A.'
      }
    },
    { 
      id: 'slide-8', 
      type: 'explanation', 
      content: 'Resumo e conclusão',
      card1: { title: 'Resumo do Conteúdo', content: 'Parabéns! Você concluiu a aula. Vamos fazer um resumo dos principais pontos aprendidos.' },
      card2: { title: 'Conclusão', content: 'Este tema é fundamental para desenvolver habilidades importantes. Continue praticando e explorando!' }
    }
  ];
}

/**
 * Processa uma lista de slides para seguir o padrão de 8 slides do HubEdu
 */
export function processSlidesForHubEduPattern(slides: Slide[]): Slide[] {
  // Se não há slides, criar estrutura padrão
  if (!slides || slides.length === 0) {
    return createDefault8SlidesStructure();
  }
  
  // Remover duplicatas
  const deduplicated = dedupeSlides(slides);
  
  // Garantir que temos pelo menos 8 slides
  let processedSlides = [...deduplicated];
  while (processedSlides.length < 8) {
    processedSlides.push({
      id: `slide-${processedSlides.length + 1}`,
      type: 'explanation',
      content: 'Conteúdo adicional',
      card1: {
        title: 'Conteúdo Principal',
        content: 'Conteúdo adicional sobre o tema abordado.'
      },
      card2: {
        title: 'Detalhes Adicionais',
        content: 'Informações complementares para enriquecer o aprendizado.'
      }
    });
  }
  
  // Limitar a 8 slides
  processedSlides = processedSlides.slice(0, 8);
  
  // Garantir que todos os slides tenham estrutura de 2 cards
  processedSlides = processedSlides.map((slide, index) => {
    const slideNumber = index + 1;
    
    // Se não tem estrutura de cards, criar uma
    if (!slide.card1 || !slide.card2) {
      return {
        ...slide,
        card1: slide.card1 || {
          title: slide.type === 'question' ? 'Pergunta' : 'Conteúdo Principal',
          content: slide.content || slide.question || 'Conteúdo do primeiro card'
        },
        card2: slide.card2 || {
          title: slide.type === 'question' ? 'Opções de Resposta' : 'Detalhes Adicionais',
          content: slide.type === 'question' ? 'Escolha a resposta correta:' : 'Informações complementares sobre o tema.',
          ...(slide.type === 'question' && {
            options: slide.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
            correctOption: slide.correctOption ?? 0,
            helpMessage: slide.helpMessage || 'Analise as opções cuidadosamente',
            correctAnswer: slide.correctAnswer || 'Explicação da resposta correta'
          })
        }
      };
    }
    
    return slide;
  });
  
  // Aplicar padrão de perguntas nas posições 4 e 7
  return enforceQuestionPositions(processedSlides);
}