// app/api/safety/test/route.ts
// API para testar as proteções de segurança

import { NextRequest, NextResponse } from 'next/server';
import { checkMessageSafety, detectCircumventionAttempt, safetyScoreTracker } from '@/lib/safety-middleware';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }
    
    // Verificar segurança da mensagem
    const safetyCheck = checkMessageSafety(message);
    
    // Verificar tentativas de contornar proteções
    const isCircumventionAttempt = detectCircumventionAttempt(message);
    
    // Incrementar pontuação se houver problemas
    if (userId) {
      if (safetyCheck.isInappropriate) {
        safetyScoreTracker.incrementScore(userId, 2);
      }
      if (isCircumventionAttempt) {
        safetyScoreTracker.incrementScore(userId, 3);
      }
    }
    
    const response = {
      message: message,
      safetyCheck: {
        isInappropriate: safetyCheck.isInappropriate,
        inappropriateTopics: safetyCheck.inappropriateTopics,
        suggestedResponse: safetyCheck.suggestedResponse,
        educationalAlternative: safetyCheck.educationalAlternative
      },
      circumventionCheck: {
        isAttempt: isCircumventionAttempt,
        warning: isCircumventionAttempt ? 
          'Tentativa de contornar proteções de segurança detectada. Mantenha o foco em conteúdos educacionais apropriados.' : 
          null
      },
      userSafetyScore: userId ? safetyScoreTracker.getScore(userId) : null,
      isHighRisk: userId ? safetyScoreTracker.isHighRisk(userId) : false,
      timestamp: new Date().toISOString()
    };
    
    // Se conteúdo inadequado, retornar resposta de segurança
    if (safetyCheck.isInappropriate) {
      return NextResponse.json({
        ...response,
        blocked: true,
        safeResponse: safetyCheck.suggestedResponse
      });
    }
    
    // Se tentativa de contornar proteções, retornar aviso
    if (isCircumventionAttempt) {
      return NextResponse.json({
        ...response,
        warning: true,
        safeResponse: 'Não posso ignorar as diretrizes de segurança. Vamos focar em conteúdos educacionais apropriados e construtivos.'
      });
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erro no teste de segurança:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Retornar estatísticas de segurança
  const allScores = safetyScoreTracker.getAllScores();
  const highRiskUsers = Array.from(allScores.entries())
    .filter(([_, score]) => score >= 5)
    .map(([userId, score]) => ({ userId, score }));
  
  return NextResponse.json({
    totalUsers: allScores.size,
    highRiskUsers,
    averageScore: allScores.size > 0 ? 
      Array.from(allScores.values()).reduce((a, b) => a + b, 0) / allScores.size : 0,
    timestamp: new Date().toISOString()
  });
}
