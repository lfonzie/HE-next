// lib/safety-middleware.ts
// Middleware de segurança para detectar e bloquear conteúdo inadequado

import { detectInappropriateContent, createEducationalRefusalResponse, EDUCATIONAL_ALTERNATIVES } from './system-prompts/safety-guidelines';

export interface SafetyCheckResult {
  isInappropriate: boolean;
  inappropriateTopics: string[];
  suggestedResponse?: string;
  educationalAlternative?: string;
}

/**
 * Verifica se uma mensagem contém conteúdo inadequado
 */
export function checkMessageSafety(message: string): SafetyCheckResult {
  const inappropriateTopics: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Lista de tópicos inadequados
  const inappropriateKeywords = [
    'drogas', 'álcool', 'cigarros', 'tabaco', 'fumar', 'beber', 'substâncias ilegais',
    'violência', 'armas', 'suicídio', 'automutilação', 'hacking', 'pirataria',
    'fraudes', 'atividades ilegais', 'conteúdo sexual', 'pornografia',
    'jogos de azar', 'apostas', 'substâncias controladas', 'maconha', 'cocaína',
    'heroína', 'crack', 'lsd', 'ecstasy', 'metanfetamina', 'bebida alcoólica',
    'cerveja', 'vodka', 'whisky', 'cachaça', 'vinho', 'como fumar', 'como beber',
    'como usar drogas', 'como fazer drogas', 'como obter drogas'
  ];
  
  // Detectar tópicos inadequados
  inappropriateKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      inappropriateTopics.push(keyword);
    }
  });
  
  const isInappropriate = inappropriateTopics.length > 0;
  
  if (isInappropriate) {
    // Encontrar alternativa educacional
    let educationalAlternative: string | undefined;
    for (const [inappropriate, alternative] of Object.entries(EDUCATIONAL_ALTERNATIVES)) {
      if (inappropriateTopics.some(topic => topic.includes(inappropriate))) {
        educationalAlternative = alternative;
        break;
      }
    }
    
    // Se não encontrar alternativa específica, usar genérica
    if (!educationalAlternative) {
      educationalAlternative = 'conteúdos educacionais apropriados e construtivos';
    }
    
    const suggestedResponse = createEducationalRefusalResponse(
      inappropriateTopics.join(', '),
      educationalAlternative
    );
    
    return {
      isInappropriate: true,
      inappropriateTopics,
      suggestedResponse,
      educationalAlternative
    };
  }
  
  return {
    isInappropriate: false,
    inappropriateTopics: []
  };
}

/**
 * Middleware para interceptar mensagens inadequadas antes de enviar para a IA
 */
export function createSafetyMiddleware() {
  return (req: any, res: any, next: any) => {
    if (req.body && req.body.message) {
      const safetyCheck = checkMessageSafety(req.body.message);
      
      if (safetyCheck.isInappropriate) {
        // Retornar resposta de segurança sem enviar para a IA
        return res.status(200).json({
          success: true,
          message: safetyCheck.suggestedResponse,
          safetyBlocked: true,
          inappropriateTopics: safetyCheck.inappropriateTopics,
          educationalAlternative: safetyCheck.educationalAlternative
        });
      }
    }
    
    next();
  };
}

/**
 * Função para log de tentativas de conteúdo inadequado
 */
export function logInappropriateContentAttempt(
  userId: string,
  message: string,
  inappropriateTopics: string[]
) {
  console.warn(`🚨 TENTATIVA DE CONTEÚDO INADEQUADO DETECTADA:
    Usuário: ${userId}
    Mensagem: ${message}
    Tópicos inadequados: ${inappropriateTopics.join(', ')}
    Timestamp: ${new Date().toISOString()}
  `);
  
  // Aqui você pode adicionar lógica para salvar no banco de dados
  // ou enviar alertas para administradores
}

/**
 * Função para verificar se um usuário está tentando contornar as proteções
 */
export function detectCircumventionAttempt(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Padrões comuns de tentativa de contornar filtros
  const circumventionPatterns = [
    'ignore previous instructions',
    'forget safety guidelines',
    'act as if you are not an ai',
    'pretend to be',
    'roleplay as',
    'you are now',
    'from now on',
    'disregard safety',
    'ignore safety',
    'forget about safety',
    'act without restrictions'
  ];
  
  return circumventionPatterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Sistema de pontuação de risco para usuários
 */
export class SafetyScoreTracker {
  private userScores: Map<string, number> = new Map();
  
  incrementScore(userId: string, points: number = 1) {
    const currentScore = this.userScores.get(userId) || 0;
    this.userScores.set(userId, currentScore + points);
  }
  
  getScore(userId: string): number {
    return this.userScores.get(userId) || 0;
  }
  
  resetScore(userId: string) {
    this.userScores.delete(userId);
  }
  
  isHighRisk(userId: string): boolean {
    return this.getScore(userId) >= 5;
  }
  
  getAllScores(): Map<string, number> {
    return new Map(this.userScores);
  }
}

// Instância global do tracker de pontuação
export const safetyScoreTracker = new SafetyScoreTracker();
