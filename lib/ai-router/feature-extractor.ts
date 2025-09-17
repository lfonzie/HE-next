// lib/ai-router/feature-extractor.ts
// Extrator de características contextuais para roteamento inteligente

import { ContextualFeatures, SessionContext, UserPreferences } from './types';

export class FeatureExtractor {
  private readonly complexityKeywords = {
    simple: ['simples', 'básico', 'rápido', 'resumo', 'breve'],
    moderate: ['explicar', 'como', 'por que', 'desenvolver', 'analisar'],
    complex: ['complexo', 'detalhado', 'completo', 'aprofundado', 'técnico']
  };

  private readonly domainKeywords = {
    educational: ['aula', 'ensinar', 'aprender', 'estudar', 'explicar', 'conceito', 'matéria'],
    technical: ['código', 'programar', 'debug', 'erro', 'função', 'classe', 'api'],
    conversational: ['oi', 'olá', 'ajuda', 'suporte', 'pergunta', 'dúvida']
  };

  private readonly jsonKeywords = ['json', 'estrutura', 'formato', 'dados', 'objeto', 'array'];
  private readonly toolKeywords = ['ferramenta', 'tool', 'função', 'executar', 'chamar'];

  extractFeatures(
    text: string, 
    context?: Record<string, any>,
    userProfile?: Record<string, any>
  ): ContextualFeatures {
    const normalizedText = text.toLowerCase();
    
    return {
      // Análise linguística
      language: this.detectLanguage(text),
      complexity: this.analyzeComplexity(normalizedText),
      domain: this.detectDomain(normalizedText),
      
      // Características da tarefa
      requiresJsonStrict: this.requiresJsonStrict(normalizedText, context),
      requiresToolUse: this.requiresToolUse(normalizedText, context),
      requiresStreaming: this.requiresStreaming(context),
      contextLength: this.calculateContextLength(text, context),
      
      // Perfil do usuário
      userType: this.detectUserType(userProfile, context),
      sessionHistory: this.buildSessionHistory(context),
      preferences: this.extractUserPreferences(userProfile, context),
      
      // Fatores temporais
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      systemLoad: this.estimateSystemLoad()
    };
  }

  private detectLanguage(text: string): 'pt-BR' | 'en' | 'mixed' {
    const portugueseWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'estavam', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'estavam', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'];

    const words = text.toLowerCase().split(/\s+/);
    const ptCount = words.filter(word => portugueseWords.includes(word)).length;
    const enCount = words.filter(word => englishWords.includes(word)).length;

    if (ptCount > enCount * 2) return 'pt-BR';
    if (enCount > ptCount * 2) return 'en';
    return 'mixed';
  }

  private analyzeComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    let complexityScore = 0;
    
    // Contagem de palavras-chave de complexidade
    for (const [level, keywords] of Object.entries(this.complexityKeywords)) {
      const count = keywords.filter(keyword => text.includes(keyword)).length;
      if (level === 'simple') complexityScore -= count;
      if (level === 'moderate') complexityScore += count * 0.5;
      if (level === 'complex') complexityScore += count * 2;
    }

    // Análise de comprimento e estrutura
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    if (avgWordsPerSentence > 20) complexityScore += 2;
    if (wordCount > 100) complexityScore += 1;

    // Análise de termos técnicos
    const technicalTerms = ['algoritmo', 'implementação', 'arquitetura', 'framework', 'biblioteca', 'método', 'função', 'classe', 'objeto', 'variável', 'parâmetro', 'retorno', 'exceção', 'erro', 'debug', 'teste', 'validação', 'otimização', 'performance', 'escalabilidade'];
    const technicalCount = technicalTerms.filter(term => text.includes(term)).length;
    complexityScore += technicalCount * 0.5;

    if (complexityScore <= 1) return 'simple';
    if (complexityScore <= 4) return 'moderate';
    return 'complex';
  }

  private detectDomain(text: string): 'educational' | 'technical' | 'conversational' {
    const scores = {
      educational: 0,
      technical: 0,
      conversational: 0
    };

    for (const [domain, keywords] of Object.entries(this.domainKeywords)) {
      scores[domain as keyof typeof scores] = keywords.filter(keyword => 
        text.includes(keyword)
      ).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'conversational';

    for (const [domain, score] of Object.entries(scores)) {
      if (score === maxScore) {
        return domain as 'educational' | 'technical' | 'conversational';
      }
    }

    return 'conversational';
  }

  private requiresJsonStrict(text: string, context?: Record<string, any>): boolean {
    // Verificar palavras-chave JSON
    const hasJsonKeywords = this.jsonKeywords.some(keyword => text.includes(keyword));
    
    // Verificar contexto do módulo
    const moduleRequiresJson = context?.module && 
      ['aula_interativa', 'enem', 'professor'].includes(context.module);

    return hasJsonKeywords || moduleRequiresJson || false;
  }

  private requiresToolUse(text: string, context?: Record<string, any>): boolean {
    // Verificar palavras-chave de ferramentas
    const hasToolKeywords = this.toolKeywords.some(keyword => text.includes(keyword));
    
    // Verificar contexto do módulo
    const moduleRequiresTools = context?.module && 
      ['ti', 'debug', 'codigo'].includes(context.module);

    return hasToolKeywords || moduleRequiresTools || false;
  }

  private requiresStreaming(context?: Record<string, any>): boolean {
    // Streaming é preferível para respostas longas ou interativas
    return context?.module === 'aula_interativa' || 
           context?.requiresStreaming === true ||
           false;
  }

  private calculateContextLength(text: string, context?: Record<string, any>): number {
    let length = text.length;
    
    // Adicionar contexto da sessão se disponível
    if (context?.sessionHistory) {
      length += JSON.stringify(context.sessionHistory).length;
    }
    
    // Adicionar contexto do módulo
    if (context?.module) {
      length += context.module.length * 10; // Estimativa
    }

    return length;
  }

  private detectUserType(userProfile?: Record<string, any>, context?: Record<string, any>): 'student' | 'teacher' | 'admin' {
    if (userProfile?.role) {
      return userProfile.role as 'student' | 'teacher' | 'admin';
    }
    
    if (context?.userType) {
      return context.userType as 'student' | 'teacher' | 'admin';
    }

    // Inferir baseado no contexto
    if (context?.module === 'professor' || context?.module === 'aula_interativa') {
      return 'teacher';
    }
    
    if (context?.module === 'enem' || context?.module === 'atendimento') {
      return 'student';
    }

    return 'student'; // Default
  }

  private buildSessionHistory(context?: Record<string, any>): SessionContext {
    return {
      module: context?.module || 'atendimento',
      previousInteractions: context?.interactionCount || 0,
      averageResponseTime: context?.avgResponseTime || 1000,
      userSatisfaction: context?.userSatisfaction || 0.8
    };
  }

  private extractUserPreferences(userProfile?: Record<string, any>, context?: Record<string, any>): UserPreferences {
    return {
      preferredResponseStyle: userProfile?.responseStyle || context?.responseStyle || 'detailed',
      maxResponseTime: userProfile?.maxResponseTime || context?.maxResponseTime || 5000,
      costSensitivity: userProfile?.costSensitivity || context?.costSensitivity || 'medium'
    };
  }

  private getTimeOfDay(): 'peak' | 'off-peak' {
    const hour = new Date().getHours();
    // Horário de pico: 9h-17h (horário comercial)
    return (hour >= 9 && hour <= 17) ? 'peak' : 'off-peak';
  }

  private getDayOfWeek(): 'weekday' | 'weekend' {
    const day = new Date().getDay();
    return (day >= 1 && day <= 5) ? 'weekday' : 'weekend';
  }

  private estimateSystemLoad(): 'low' | 'medium' | 'high' {
    // Esta seria uma implementação mais sofisticada em produção
    // Por enquanto, retorna baseado no horário
    const hour = new Date().getHours();
    
    if (hour >= 22 || hour <= 6) return 'low';
    if (hour >= 9 && hour <= 17) return 'high';
    return 'medium';
  }
}

// Instância singleton
export const featureExtractor = new FeatureExtractor();
