export interface DetectedIntent {
  type: 'aula' | 'enem' | 'redacao' | 'general';
  confidence: number;
  topic?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export function detectIntent(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalize accents
  const intents = [
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
        /conteúdo sobre/i,
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
        /banco de questões/i
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
  ];

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (pattern.test(lowerMessage)) {
        return {
          type: intent.type,
          confidence: intent.confidence,
          topic: intent.extractTopic ? extractTopic(message) : undefined,
          context: intent.type === 'aula' ? 'educational' : intent.type === 'enem' ? 'exam' : 'writing',
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

// Enhanced intent detection with weighted scoring
export function detectIntentAdvanced(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const intentScores = {
    aula: 0,
    enem: 0,
    redacao: 0,
    general: 0
  };

  // Educational keywords with weights
  const educationalKeywords = {
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
    context: bestIntent === 'aula' ? 'educational' : bestIntent === 'enem' ? 'exam' : bestIntent === 'redacao' ? 'writing' : 'general',
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
