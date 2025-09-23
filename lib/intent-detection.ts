export interface DetectedIntent {
  type: 'aula' | 'enem' | 'redacao' | 'weather' | 'openlibrary' | 'newsapi' | 'numbersapi' | 'currentsapi' | 'giphy' | 'worldbank' | 'calculator' | 'translator' | 'timer' | 'calendar' | 'imagesearch' | 'general';
  confidence: number;
  topic?: string;
  city?: string;
  searchQuery?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export function detectIntent(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalize accents
  const intents = [
    {
      type: 'weather',
      patterns: [
        /clima em (.+)/i,
        /tempo em (.+)/i,
        /previsão do tempo em (.+)/i,
        /como está o clima em (.+)/i,
        /temperatura em (.+)/i,
        /clima de (.+)/i,
        /tempo de (.+)/i,
        /previsão em (.+)/i,
        /como está o tempo em (.+)/i,
        /temperatura de (.+)/i,
        /previsão (.+)/i
      ],
      confidence: 0.95,
      extractCity: true,
    },
    {
      type: 'aula',
      patterns: [
        /aula sobre/i,
        /explicar/i,
        /quero aprender/i,
        /ensinar/i,
        /como funciona/i,
        /o que é/i,
        /conceito de/i,
        /entender sobre/i,
        /estudar sobre/i,
        /aprender sobre/i,
        /lição sobre/i,
        /curso sobre/i,
        /tutorial sobre/i,
        /guia sobre/i,
        /material sobre/i,
        /criar aula/i,
        /gerar aula/i,
        /fazer aula/i,
        /montar aula/i,
        /preparar aula/i,
        /desenvolver aula/i,
        /construir aula/i,
        /elaborar aula/i,
        /explicação sobre/i,
        /desenvolvimento sobre/i,
        /abordagem sobre/i,
        /metodologia sobre/i
      ],
      confidence: 0.8,
      extractTopic: true,
    },
    {
      type: 'enem',
      patterns: [
        /simulador enem/i,
        /simulado enem/i,
        /enem.*simulado/i,
        /simulado.*enem/i,
        /fazer simulado/i,
        /questoes.*enem/i,
        /prova enem/i,
        /exame nacional/i,
        /vestibular/i,
        /simulado/i,
        /questões do enem/i,
        /prova do enem/i,
        /exame do ensino médio/i,
        /teste enem/i,
        /avaliação enem/i,
        /exercícios enem/i,
        /prática enem/i,
        /preparação enem/i,
        /estudo enem/i,
        /revisão enem/i,
        /simulados/i,
        /questões oficiais/i,
        /banco de questões/i,
        /enem/i
      ],
      confidence: 0.9,
    },
    {
      type: 'redacao',
      patterns: [
        /corrigir redacao/i,
        /avaliar texto/i,
        /redacao.*enem/i,
        /escrever redação/i,
        /texto dissertativo/i,
        /dissertação/i,
        /redação do enem/i,
        /correção de redação/i,
        /avaliação de texto/i,
        /escrever texto/i,
        /produção textual/i,
        /texto argumentativo/i,
        /redação argumentativa/i,
        /dissertação argumentativa/i,
        /tema de redação/i,
        /proposta de redação/i,
        /redação nota mil/i,
        /critérios de correção/i,
        /competências da redação/i,
        /estrutura da redação/i
      ],
      confidence: 0.9,
    },
    {
      type: 'openlibrary',
      patterns: [
        /buscar livro/i,
        /procurar livro/i,
        /encontrar livro/i,
        /biblioteca/i,
        /livro sobre/i,
        /autor/i,
        /isbn/i,
        /catalogo de livros/i,
        /referencia bibliografica/i,
        /fonte literaria/i,
        /openlibrary/i,
        /open library/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'newsapi',
      patterns: [
        /noticias/i,
        /notícias/i,
        /noticia/i,
        /notícia/i,
        /ultimas noticias/i,
        /últimas notícias/i,
        /principais noticias/i,
        /principais notícias/i,
        /jornal/i,
        /jornalismo/i,
        /imprensa/i,
        /mídia/i,
        /midia/i,
        /atualidades/i,
        /news/i,
        /newsapi/i,
        /news api/i,
        /manchetes/i,
        /informacoes/i,
        /informações/i,
        /atualidade/i,
        /acontecimentos/i,
        /eventos/i,
        /fatos/i,
        /novidades/i,
        /hoje/i,
        /agora/i,
        /recente/i,
        /recentes/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'numbersapi',
      patterns: [
        /curiosidade sobre numero/i,
        /fato sobre numero/i,
        /numero/i,
        /matematica/i,
        /matemática/i,
        /curiosidade numerica/i,
        /curiosidade numérica/i,
        /fato numerico/i,
        /fato numérico/i,
        /numbersapi/i,
        /numbers api/i,
        /fato da data/i,
        /fato do ano/i,
        /curiosidade da data/i,
        /curiosidade do ano/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'currentsapi',
      patterns: [
        /noticias globais/i,
        /noticia global/i,
        /tendencias mundiais/i,
        /tendências mundiais/i,
        /noticias internacionais/i,
        /noticia internacional/i,
        /currentsapi/i,
        /currents api/i,
        /noticias em tempo real/i,
        /noticia em tempo real/i,
        /tendencias/i,
        /tendências/i,
        /mundial/i,
        /global/i,
        /internacional/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'giphy',
      patterns: [
        /gif/i,
        /giphy/i,
        /animacao/i,
        /animação/i,
        /gif animado/i,
        /gif animada/i,
        /imagem animada/i,
        /imagem animada/i,
        /meme/i,
        /memes/i,
        /reacao/i,
        /reação/i,
        /emoji animado/i,
        /emoji animada/i,
        /sticker/i,
        /stickers/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'worldbank',
      patterns: [
        /dados mundiais/i,
        /dado mundial/i,
        /indicadores socioeconomicos/i,
        /indicadores socioeconômicos/i,
        /banco mundial/i,
        /worldbank/i,
        /world bank/i,
        /dados economicos/i,
        /dados econômicos/i,
        /pib/i,
        /inflacao/i,
        /inflação/i,
        /desemprego/i,
        /alfabetizacao/i,
        /alfabetização/i,
        /expectativa de vida/i,
        /dados sociais/i,
        /estatisticas mundiais/i,
        /estatísticas mundiais/i,
        /indicadores globais/i
      ],
      confidence: 0.85,
      extractSearchQuery: true,
    },
    {
      type: 'calculator',
      patterns: [
        /calculadora/i,
        /calcular/i,
        /conta/i,
        /matematica/i,
        /matemática/i,
        /formula/i,
        /fórmula/i,
        /equacao/i,
        /equação/i,
        /somar/i,
        /subtrair/i,
        /multiplicar/i,
        /dividir/i,
        /raiz/i,
        /potencia/i,
        /potência/i,
        /porcentagem/i,
        /percentual/i,
        /calculo/i,
        /cálculo/i,
        /operacao/i,
        /operação/i,
        /resultado/i,
        /resolver/i,
        /resolva/i,
        /quanto é/i,
        /quanto da/i,
        /quanto fica/i
      ],
      confidence: 0.9,
      extractSearchQuery: true,
    },
    {
      type: 'translator',
      patterns: [
        /traduzir/i,
        /traducao/i,
        /tradução/i,
        /tradutor/i,
        /traduza/i,
        /como se diz/i,
        /como dizer/i,
        /em ingles/i,
        /em inglês/i,
        /em espanhol/i,
        /em frances/i,
        /em francês/i,
        /em alemao/i,
        /em alemão/i,
        /em italiano/i,
        /em japones/i,
        /em japonês/i,
        /em chines/i,
        /em chinês/i,
        /em portugues/i,
        /em português/i,
        /idioma/i,
        /lingua/i,
        /língua/i,
        /linguagem/i,
        /linguagem/i,
        /interpretar/i,
        /interpretação/i
      ],
      confidence: 0.9,
      extractSearchQuery: true,
    },
    {
      type: 'timer',
      patterns: [
        /cronometro/i,
        /cronômetro/i,
        /timer/i,
        /temporizador/i,
        /cronometrar/i,
        /cronometre/i,
        /tempo de estudo/i,
        /pomodoro/i,
        /pausa/i,
        /intervalo/i,
        /contar tempo/i,
        /medir tempo/i,
        /quanto tempo/i,
        /tempo restante/i,
        /alarme/i,
        /lembrete/i,
        /notificacao/i,
        /notificação/i,
        /agendar/i,
        /marcar tempo/i,
        /contador/i,
        /contagem/i
      ],
      confidence: 0.9,
      extractSearchQuery: true,
    },
    {
      type: 'calendar',
      patterns: [
        /calendario/i,
        /calendário/i,
        /agenda/i,
        /evento/i,
        /eventos/i,
        /compromisso/i,
        /compromissos/i,
        /marcar/i,
        /agendar/i,
        /data/i,
        /datas/i,
        /dia/i,
        /mes/i,
        /mês/i,
        /ano/i,
        /semana/i,
        /proxima semana/i,
        /próxima semana/i,
        /amanha/i,
        /amanhã/i,
        /ontem/i,
        /hoje/i,
        /feriado/i,
        /feriados/i,
        /lembrete/i,
        /lembretes/i,
        /tarefa/i,
        /tarefas/i,
        /deadline/i,
        /prazo/i,
        /prazos/i
      ],
      confidence: 0.9,
      extractSearchQuery: true,
    },
    {
      type: 'imagesearch',
      patterns: [
        /buscar imagem/i,
        /procurar imagem/i,
        /encontrar imagem/i,
        /imagem de/i,
        /foto de/i,
        /fotografia de/i,
        /imagens/i,
        /fotos/i,
        /fotografias/i,
        /galeria/i,
        /galeria de imagens/i,
        /banco de imagens/i,
        /stock de fotos/i,
        /imagens educacionais/i,
        /fotos educacionais/i,
        /imagens academicas/i,
        /imagens acadêmicas/i,
        /ilustracao/i,
        /ilustração/i,
        /ilustracoes/i,
        /ilustrações/i,
        /desenho/i,
        /desenhos/i,
        /grafico/i,
        /gráfico/i,
        /graficos/i,
        /gráficos/i,
        /diagrama/i,
        /diagramas/i,
        /esquema/i,
        /esquemas/i
      ],
      confidence: 0.9,
      extractSearchQuery: true,
    },
  ];

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (pattern.test(lowerMessage)) {
        return {
          type: intent.type,
          confidence: intent.confidence,
          topic: intent.extractTopic ? extractTopic(message) : undefined,
          city: intent.extractCity ? extractCity(message) : undefined,
          searchQuery: intent.extractSearchQuery ? extractSearchQuery(message) : undefined,
          context: intent.type === 'aula' ? 'educational' : intent.type === 'enem' ? 'exam' : intent.type === 'weather' ? 'weather' : intent.type === 'redacao' ? 'writing' : intent.type === 'openlibrary' ? 'books' : intent.type === 'newsapi' ? 'news' : intent.type === 'numbersapi' ? 'numbers' : intent.type === 'currentsapi' ? 'news' : intent.type === 'giphy' ? 'gifs' : intent.type === 'worldbank' ? 'data' : 'general',
          metadata: { source: 'pattern_match' },
        };
      }
    }
  }

  return {
    type: 'general',
    confidence: 0.5,
    metadata: { source: 'fallback' },
  };
}

function extractCity(message: string): string {
  const patterns = [
    /clima em (.+)/i,
    /tempo em (.+)/i,
    /previsão do tempo em (.+)/i,
    /como está o clima em (.+)/i,
    /temperatura em (.+)/i,
    /clima de (.+)/i,
    /tempo de (.+)/i,
    /previsão em (.+)/i,
    /como está o tempo em (.+)/i,
    /temperatura de (.+)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }

  return 'cidade não identificada';
}

function extractTopic(message: string): string {
  const patterns = [
    /aula sobre (.+)/i,
    /explicar (.+)/i,
    /quero aprender sobre (.+)/i,
    /ensinar (.+)/i,
    /como funciona (.+)/i,
    /o que é (.+)/i,
    /conceito de (.+)/i,
    /entender sobre (.+)/i,
    /estudar sobre (.+)/i,
    /aprender sobre (.+)/i,
    /lição sobre (.+)/i,
    /curso sobre (.+)/i,
    /tutorial sobre (.+)/i,
    /guia sobre (.+)/i,
    /material sobre (.+)/i,
    /conteúdo sobre (.+)/i,
    /explicação sobre (.+)/i,
    /desenvolvimento sobre (.+)/i,
    /abordagem sobre (.+)/i,
    /metodologia sobre (.+)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }

  return 'tópico não identificado';
}

function extractSearchQuery(message: string): string {
  // Remove common trigger words and extract the search query
  const cleanedMessage = message
    .replace(/(buscar|procurar|encontrar|pesquisar|sobre|de|da|do|em|na|no|para|com|sobre)\s+/gi, '')
    .replace(/(livro|noticia|notícia|numero|número|dados|gif|animacao|animação|meme|indicador|biblioteca|autor|isbn|catalogo|catálogo|referencia|referência|fonte|literaria|literária|openlibrary|open library|newsapi|news api|numbersapi|numbers api|currentsapi|currents api|giphy|worldbank|world bank|banco mundial|dados mundiais|dado mundial|indicadores socioeconomicos|indicadores socioeconômicos|dados economicos|dados econômicos|pib|inflacao|inflação|desemprego|alfabetizacao|alfabetização|expectativa de vida|dados sociais|estatisticas mundiais|estatísticas mundiais|indicadores globais|noticias globais|notícias globais|noticia global|notícia global|tendencias mundiais|tendências mundiais|noticias internacionais|notícias internacionais|noticia internacional|notícia internacional|noticias em tempo real|notícias em tempo real|noticia em tempo real|notícia em tempo real|tendencias|tendências|mundial|global|internacional|ultimas noticias|últimas notícias|jornal|atualidades|news|manchetes|informacoes|informações|atualidade|acontecimentos|eventos|curiosidade sobre numero|curiosidade sobre número|fato sobre numero|fato sobre número|matematica|matemática|curiosidade numerica|curiosidade numérica|fato numerico|fato numérico|fato da data|fato do ano|curiosidade da data|curiosidade do ano|gif animado|gif animada|imagem animada|reacao|reação|emoji animado|emoji animada|sticker|stickers|memes)\s*/gi, '')
    .trim();

  return cleanedMessage || message.trim();
}

// Enhanced intent detection with weighted scoring
export function detectIntentAdvanced(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const intentScores = {
    weather: 0,
    aula: 0,
    enem: 0,
    redacao: 0,
    openlibrary: 0,
    newsapi: 0,
    numbersapi: 0,
    currentsapi: 0,
    giphy: 0,
    worldbank: 0,
    general: 0
  };

  // Educational keywords with weights
  const educationalKeywords = {
    weather: [
      { word: 'clima', weight: 4 },
      { word: 'tempo', weight: 4 },
      { word: 'previsão', weight: 3 },
      { word: 'temperatura', weight: 3 },
      { word: 'chuva', weight: 2 },
      { word: 'sol', weight: 2 },
      { word: 'nublado', weight: 2 },
      { word: 'vento', weight: 2 },
      { word: 'umidade', weight: 2 },
      { word: 'pressão', weight: 1 },
      { word: 'visibilidade', weight: 1 },
      { word: 'uv', weight: 1 },
      { word: 'meteorologia', weight: 1 }
    ],
    aula: [
      { word: 'aula', weight: 3 },
      { word: 'explicar', weight: 2 },
      { word: 'aprender', weight: 2 },
      { word: 'ensinar', weight: 2 },
      { word: 'conceito', weight: 2 },
      { word: 'entender', weight: 1 },
      { word: 'estudar', weight: 1 },
      { word: 'lição', weight: 1 },
      { word: 'curso', weight: 1 },
      { word: 'tutorial', weight: 1 },
      { word: 'guia', weight: 1 },
      { word: 'material', weight: 1 },
      { word: 'conteúdo', weight: 1 },
      { word: 'explicação', weight: 1 },
      { word: 'desenvolvimento', weight: 1 },
      { word: 'abordagem', weight: 1 },
      { word: 'metodologia', weight: 1 }
    ],
    enem: [
      { word: 'enem', weight: 4 },
      { word: 'simulador', weight: 3 },
      { word: 'simulado', weight: 3 },
      { word: 'prova', weight: 2 },
      { word: 'exame', weight: 2 },
      { word: 'vestibular', weight: 2 },
      { word: 'questões', weight: 2 },
      { word: 'teste', weight: 1 },
      { word: 'avaliação', weight: 1 },
      { word: 'exercícios', weight: 1 },
      { word: 'prática', weight: 1 },
      { word: 'preparação', weight: 1 },
      { word: 'estudo', weight: 1 },
      { word: 'revisão', weight: 1 },
      { word: 'oficiais', weight: 1 },
      { word: 'banco', weight: 1 }
    ],
    redacao: [
      { word: 'redação', weight: 4 },
      { word: 'redacao', weight: 4 },
      { word: 'corrigir', weight: 3 },
      { word: 'avaliar', weight: 2 },
      { word: 'escrever', weight: 2 },
      { word: 'texto', weight: 2 },
      { word: 'dissertativo', weight: 2 },
      { word: 'dissertação', weight: 2 },
      { word: 'argumentativo', weight: 2 },
      { word: 'argumentativa', weight: 2 },
      { word: 'produção', weight: 1 },
      { word: 'tema', weight: 1 },
      { word: 'proposta', weight: 1 },
      { word: 'nota', weight: 1 },
      { word: 'critérios', weight: 1 },
      { word: 'competências', weight: 1 },
      { word: 'estrutura', weight: 1 }
    ],
    openlibrary: [
      { word: 'livro', weight: 4 },
      { word: 'biblioteca', weight: 3 },
      { word: 'autor', weight: 3 },
      { word: 'isbn', weight: 3 },
      { word: 'catalogo', weight: 2 },
      { word: 'catálogo', weight: 2 },
      { word: 'referencia', weight: 2 },
      { word: 'referência', weight: 2 },
      { word: 'fonte', weight: 2 },
      { word: 'literaria', weight: 2 },
      { word: 'literária', weight: 2 },
      { word: 'openlibrary', weight: 2 },
      { word: 'buscar', weight: 1 },
      { word: 'procurar', weight: 1 },
      { word: 'encontrar', weight: 1 }
    ],
    newsapi: [
      { word: 'noticia', weight: 4 },
      { word: 'notícia', weight: 4 },
      { word: 'noticias', weight: 4 },
      { word: 'notícias', weight: 4 },
      { word: 'jornal', weight: 3 },
      { word: 'atualidades', weight: 3 },
      { word: 'news', weight: 3 },
      { word: 'newsapi', weight: 2 },
      { word: 'manchetes', weight: 2 },
      { word: 'informacoes', weight: 2 },
      { word: 'informações', weight: 2 },
      { word: 'atualidade', weight: 2 },
      { word: 'acontecimentos', weight: 1 },
      { word: 'eventos', weight: 1 }
    ],
    numbersapi: [
      { word: 'numero', weight: 4 },
      { word: 'número', weight: 4 },
      { word: 'matematica', weight: 3 },
      { word: 'matemática', weight: 3 },
      { word: 'curiosidade', weight: 3 },
      { word: 'fato', weight: 3 },
      { word: 'numerico', weight: 2 },
      { word: 'numérico', weight: 2 },
      { word: 'numbersapi', weight: 2 },
      { word: 'data', weight: 2 },
      { word: 'ano', weight: 2 }
    ],
    currentsapi: [
      { word: 'global', weight: 4 },
      { word: 'mundial', weight: 4 },
      { word: 'internacional', weight: 3 },
      { word: 'currentsapi', weight: 2 },
      { word: 'tendencias', weight: 2 },
      { word: 'tendências', weight: 2 },
      { word: 'tempo real', weight: 2 },
      { word: 'noticias globais', weight: 2 },
      { word: 'notícias globais', weight: 2 }
    ],
    giphy: [
      { word: 'gif', weight: 4 },
      { word: 'giphy', weight: 3 },
      { word: 'animacao', weight: 3 },
      { word: 'animação', weight: 3 },
      { word: 'meme', weight: 2 },
      { word: 'memes', weight: 2 },
      { word: 'reacao', weight: 2 },
      { word: 'reação', weight: 2 },
      { word: 'sticker', weight: 2 },
      { word: 'stickers', weight: 2 },
      { word: 'emoji', weight: 1 }
    ],
    worldbank: [
      { word: 'dados', weight: 4 },
      { word: 'mundial', weight: 3 },
      { word: 'worldbank', weight: 3 },
      { word: 'banco mundial', weight: 3 },
      { word: 'indicadores', weight: 3 },
      { word: 'socioeconomicos', weight: 2 },
      { word: 'socioeconômicos', weight: 2 },
      { word: 'economicos', weight: 2 },
      { word: 'econômicos', weight: 2 },
      { word: 'pib', weight: 2 },
      { word: 'inflacao', weight: 2 },
      { word: 'inflação', weight: 2 },
      { word: 'desemprego', weight: 2 },
      { word: 'alfabetizacao', weight: 2 },
      { word: 'alfabetização', weight: 2 },
      { word: 'expectativa de vida', weight: 2 },
      { word: 'estatisticas', weight: 1 },
      { word: 'estatísticas', weight: 1 }
    ]
  };

  // Calculate scores for each intent
  Object.entries(educationalKeywords).forEach(([intent, keywords]) => {
    keywords.forEach(({ word, weight }) => {
      if (lowerMessage.includes(word)) {
        intentScores[intent as keyof typeof intentScores] += weight;
      }
    });
  });

  // Find the intent with the highest score
  const maxScore = Math.max(...Object.values(intentScores));
  const bestIntent = Object.entries(intentScores).find(([_, score]) => score === maxScore)?.[0] as keyof typeof intentScores;

  if (maxScore === 0) {
    return {
      type: 'general',
      confidence: 0.5,
      metadata: { source: 'fallback', scores: intentScores },
    };
  }

  const confidence = Math.min(maxScore / 10, 1); // Normalize confidence to 0-1

  return {
    type: bestIntent === 'general' ? 'general' : bestIntent,
    confidence,
    topic: bestIntent === 'aula' ? extractTopic(message) : undefined,
    city: bestIntent === 'weather' ? extractCity(message) : undefined,
    searchQuery: ['openlibrary', 'newsapi', 'numbersapi', 'currentsapi', 'giphy', 'worldbank'].includes(bestIntent) ? extractSearchQuery(message) : undefined,
    context: bestIntent === 'aula' ? 'educational' : bestIntent === 'enem' ? 'exam' : bestIntent === 'weather' ? 'weather' : bestIntent === 'redacao' ? 'writing' : bestIntent === 'openlibrary' ? 'books' : bestIntent === 'newsapi' ? 'news' : bestIntent === 'numbersapi' ? 'numbers' : bestIntent === 'currentsapi' ? 'news' : bestIntent === 'giphy' ? 'gifs' : bestIntent === 'worldbank' ? 'data' : 'general',
    metadata: { source: 'weighted_scoring', scores: intentScores },
  };
}

// Context-aware intent detection
export function detectIntentWithContext(message: string, conversationHistory: string[] = []): DetectedIntent {
  const currentIntent = detectIntentAdvanced(message);
  
  // If confidence is low, check conversation history for context
  if (currentIntent.confidence < 0.6 && conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-3).join(' ').toLowerCase();
    
    // Check if recent conversation provides context
    if (recentMessages.includes('enem') && !recentMessages.includes('redação')) {
      return {
        ...currentIntent,
        type: 'enem',
        confidence: 0.7,
        context: 'exam',
        metadata: { ...currentIntent.metadata, contextBoost: 'conversation_history' }
      };
    }
    
    if (recentMessages.includes('redação') || recentMessages.includes('redacao')) {
      return {
        ...currentIntent,
        type: 'redacao',
        confidence: 0.7,
        context: 'writing',
        metadata: { ...currentIntent.metadata, contextBoost: 'conversation_history' }
      };
    }
    
    if (recentMessages.includes('aula') || recentMessages.includes('explicar')) {
      return {
        ...currentIntent,
        type: 'aula',
        confidence: 0.7,
        context: 'educational',
        metadata: { ...currentIntent.metadata, contextBoost: 'conversation_history' }
      };
    }
  }
  
  return currentIntent;
}
