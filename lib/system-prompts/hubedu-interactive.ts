// lib/system-prompts/hubedu-interactive.ts

export const HUBEDU_INTERACTIVE_BASE_PROMPT = `🎯 Você é um professor digital que cria AULAS INTERATIVAS em 8 SLIDES.

Regras:
- Cada slide é AUTÔNOMO, com título e conteúdo curto (máx. 120 palavras).  
- Slides 1,2,3,5,6 → Explicações.  
- Slides 4 e 7 → Perguntas de múltipla escolha (4 opções, só UMA correta).  
- Slide 8 → Encerramento (resumo + dica final).  
- Se usar exemplos, mantenha simples e contextualizados ao tema.  
- Não cite que é "slide", apenas apresente título e texto.

Formato de saída JSON:
{
  "slide": N,
  "title": "Título do Slide",
  "type": "explanation | question | closing",
  "content": "Texto explicativo ou enunciado",
  "options": ["A) ...","B) ...","C) ...","D) ..."],   // só para type=question
  "answer": "C",                                     // só para type=question
  "image_prompt": "Sugestão de imagem para IA/Unsplash"
}`;

export const HUBEDU_INCREMENTAL_PROMPT = `Continue a geração da aula interativa sobre {TEMA}, mas traga apenas o SLIDE {N}.
Use o mesmo formato JSON anterior.`;

export const HUBEDU_SLIDE_PROMPTS = {
  1: {
    type: "explanation",
    context: "introdução ao tema",
    prompt: `Crie o slide 1 (introdução) sobre {TEMA}. Este slide deve apresentar o conceito de forma clara e motivadora, explicando o que é e por que é importante. Use exemplos simples e contextualizados. Máximo 120 palavras.`
  },
  2: {
    type: "explanation", 
    context: "explicação aprofundando com exemplo prático",
    prompt: `Crie o slide 2 sobre {TEMA}. Aprofunde o conceito apresentado no slide 1 com um exemplo prático detalhado. Mostre como o conceito funciona na prática. Máximo 120 palavras.`
  },
  3: {
    type: "explanation",
    context: "explicação detalhando conceitos ou variações", 
    prompt: `Crie o slide 3 sobre {TEMA}. Detalhe conceitos específicos ou variações do tema principal. Explore aspectos mais técnicos ou diferentes aplicações. Máximo 120 palavras.`
  },
  4: {
    type: "question",
    context: "pergunta interativa (4 alternativas, só uma correta)",
    prompt: `Crie o slide 4 sobre {TEMA}. Esta é uma pergunta de múltipla escolha com 4 alternativas (A, B, C, D), sendo apenas uma correta. A pergunta deve testar o entendimento dos conceitos apresentados nos slides anteriores.`
  },
  5: {
    type: "explanation",
    context: "explicação ampliando o conhecimento",
    prompt: `Crie o slide 5 sobre {TEMA}. Amplie o conhecimento apresentando aspectos mais avançados ou conexões com outros temas. Máximo 120 palavras.`
  },
  6: {
    type: "explanation",
    context: "explicação com aplicação real ou interdisciplinar",
    prompt: `Crie o slide 6 sobre {TEMA}. Apresente aplicações reais do conceito ou conexões interdisciplinares. Mostre como o tema se relaciona com outras áreas do conhecimento. Máximo 120 palavras.`
  },
  7: {
    type: "question",
    context: "pergunta interativa (4 alternativas, só uma correta)",
    prompt: `Crie o slide 7 sobre {TEMA}. Esta é uma segunda pergunta de múltipla escolha com 4 alternativas (A, B, C, D), sendo apenas uma correta. A pergunta deve testar conhecimentos mais avançados ou aplicações práticas.`
  },
  8: {
    type: "closing",
    context: "encerramento (resumo + dica final)",
    prompt: `Crie o slide 8 sobre {TEMA}. Este é o slide de encerramento que deve fazer um resumo dos pontos principais aprendidos e oferecer uma dica final para continuar o aprendizado. Máximo 120 palavras.`
  }
};

export const HUBEDU_IMAGE_PROMPT_EXAMPLES = {
  mathematics: {
    1: "conceitos matemáticos básicos com exemplos visuais",
    2: "exemplo prático de aplicação matemática",
    3: "variações e conceitos avançados em matemática",
    4: "problema matemático para resolução",
    5: "aplicações avançadas de matemática",
    6: "matemática aplicada em outras disciplinas",
    7: "exercício matemático desafiador",
    8: "estudante resolvendo problemas matemáticos"
  },
  science: {
    1: "conceitos científicos fundamentais",
    2: "experimento científico prático",
    3: "processos científicos detalhados",
    4: "questão científica para análise",
    5: "aplicações científicas avançadas",
    6: "ciência interdisciplinar",
    7: "desafio científico complexo",
    8: "cientista trabalhando em laboratório"
  },
  history: {
    1: "período histórico importante",
    2: "evento histórico específico",
    3: "contexto histórico detalhado",
    4: "questão histórica para análise",
    5: "impacto histórico profundo",
    6: "história interdisciplinar",
    7: "desafio histórico complexo",
    8: "estudante estudando história"
  },
  language: {
    1: "conceitos linguísticos básicos",
    2: "exemplo prático de uso da língua",
    3: "regras e estruturas linguísticas",
    4: "exercício de língua portuguesa",
    5: "aplicações avançadas da linguagem",
    6: "linguagem em diferentes contextos",
    7: "desafio linguístico complexo",
    8: "estudante lendo e escrevendo"
  }
};

export const generateImagePrompt = (theme: string, slideNumber: number, slideType: string): string => {
  const themeLower = theme.toLowerCase();
  
  // Determine category based on theme
  let category = 'general';
  if (themeLower.includes('matemática') || themeLower.includes('matematica') || themeLower.includes('fração') || themeLower.includes('geometria')) {
    category = 'mathematics';
  } else if (themeLower.includes('ciência') || themeLower.includes('ciencia') || themeLower.includes('biologia') || themeLower.includes('química') || themeLower.includes('física')) {
    category = 'science';
  } else if (themeLower.includes('história') || themeLower.includes('historia') || themeLower.includes('revolução') || themeLower.includes('guerra')) {
    category = 'history';
  } else if (themeLower.includes('português') || themeLower.includes('portugues') || themeLower.includes('literatura') || themeLower.includes('gramática')) {
    category = 'language';
  }

  const examples = HUBEDU_IMAGE_PROMPT_EXAMPLES[category as keyof typeof HUBEDU_IMAGE_PROMPT_EXAMPLES];
  
  if (examples && examples[slideNumber as keyof typeof examples]) {
    return examples[slideNumber as keyof typeof examples];
  }

  // Fallback prompts based on slide type
  switch (slideType) {
    case 'explanation':
      return `${theme} conceitos e exemplos práticos`;
    case 'question':
      return `${theme} exercício ou problema para resolução`;
    case 'closing':
      return `estudante aprendendo sobre ${theme}`;
    default:
      return `${theme} conteúdo educacional`;
  }
};
