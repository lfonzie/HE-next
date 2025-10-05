import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/enem/scores called');
    
    const body = await request.json();
    
    // Validações mais robustas
    const { session_id, responses, items, config } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'responses must be an array' }, { status: 400 });
    }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 });
    }

    if (!config) {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    // Validar estrutura das respostas
    for (const response of responses) {
      if (!response.item_id || !response.selected_answer) {
        return NextResponse.json({ 
          error: 'Invalid response structure: missing item_id or selected_answer' 
        }, { status: 400 });
      }
    }

    // Validar estrutura dos items
    for (const item of items) {
      if (!item.item_id || !item.correct_answer || !item.alternatives) {
        return NextResponse.json({ 
          error: 'Invalid item structure: missing required fields' 
        }, { status: 400 });
      }
    }

    // Enhanced score calculation
    const totalQuestions = items.length;
    const answeredQuestions = responses.length;
    let correctAnswers = 0;
    
    // Calculate time statistics
    const totalTimeSpent = responses.reduce((sum, response) => sum + (response.time_spent || 0), 0);
    const averageTimePerQuestion = answeredQuestions > 0 ? totalTimeSpent / answeredQuestions : 0;
    
    // Calculate difficulty breakdown
    const difficultyBreakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
    const accuracyByTopic: Record<string, { correct: number; total: number }> = {};
    const areaScores: Record<string, { correct: number; total: number }> = {};

    // Count correct answers and calculate breakdowns
    responses.forEach(response => {
      const item = items.find(item => item.item_id === response.item_id);
      if (item) {
        const isCorrect = response.selected_answer === item.correct_answer;
        
        // Count by difficulty - use area as difficulty indicator if estimated_difficulty is not available
        const difficulty = item.estimated_difficulty?.toLowerCase() || 'medium';
        const difficultyKey = difficulty as keyof typeof difficultyBreakdown;
        if (difficultyBreakdown[difficultyKey]) {
          difficultyBreakdown[difficultyKey].total++;
          if (isCorrect) {
            difficultyBreakdown[difficultyKey].correct++;
          }
        }
        
        // Count by area
        const area = item.area || 'Geral';
        if (!areaScores[area]) {
          areaScores[area] = { correct: 0, total: 0 };
        }
        areaScores[area].total++;
        if (isCorrect) {
          areaScores[area].correct++;
        }
        
        // Count by topic - use area as topic if topic is not available
        const topic = item.topic || item.area || 'Geral';
        if (!accuracyByTopic[topic]) {
          accuracyByTopic[topic] = { correct: 0, total: 0 };
        }
        accuracyByTopic[topic].total++;
        if (isCorrect) {
          accuracyByTopic[topic].correct++;
          correctAnswers++;
        }
      }
    });

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const calculatedScore = Math.round(200 + (accuracy / 100) * 800); // 200-1000 range

    // Calculate individual area scores
    const areaScoresFormatted = {
      CN: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
      CH: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
      LC: { raw_score: 0, percentage: 0, correct: 0, total: 0 },
      MT: { raw_score: 0, percentage: 0, correct: 0, total: 0 }
    };

    // Calculate scores for each area
    Object.entries(areaScores).forEach(([area, stats]) => {
      if (areaScoresFormatted[area as keyof typeof areaScoresFormatted]) {
        const areaAccuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        const areaScore = Math.round(200 + (areaAccuracy / 100) * 800);
        
        areaScoresFormatted[area as keyof typeof areaScoresFormatted] = {
          raw_score: areaScore,
          percentage: Math.round(areaAccuracy),
          correct: stats.correct,
          total: stats.total
        };
      }
    });

    const score = {
      score_id: `score_${Date.now()}`,
      session_id: session_id,
      area_scores: areaScoresFormatted,
      total_score: calculatedScore,
      tri_estimated: {
        score: calculatedScore,
        confidence_interval: { lower: Math.max(200, calculatedScore - 50), upper: Math.min(1000, calculatedScore + 50) },
        disclaimer: 'Esta é uma estimativa baseada nas suas respostas. A pontuação oficial do ENEM depende de parâmetros específicos do exame completo.'
      },
      stats: {
        total_time_spent: totalTimeSpent,
        average_time_per_question: averageTimePerQuestion,
        accuracy_by_topic: Object.fromEntries(
          Object.entries(accuracyByTopic).map(([topic, stats]) => [
            topic, 
            stats.total > 0 ? stats.correct / stats.total : 0
          ])
        ),
        difficulty_breakdown: difficultyBreakdown,
        total_questions: totalQuestions,
        answered_questions: answeredQuestions,
        correct_answers: correctAnswers,
        accuracy_percentage: Math.round(accuracy)
      }
    };

    const feedback = {
      strengths: correctAnswers > 0 ? ['Você acertou algumas questões!'] : [],
      weaknesses: correctAnswers === 0 ? ['Tente revisar os conteúdos'] : [],
      recommendations: [
        'Continue praticando para melhorar seu desempenho',
        'Revise os tópicos das questões que você errou',
        'Faça mais simulados para se familiarizar com o formato'
      ],
      similarQuestions: []
    };

    console.log('Returning score:', score);

    return NextResponse.json({
      score,
      feedback,
      success: true
    });

  } catch (error) {
    console.error('Error in POST /api/enem/scores:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate score',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    // Return a simple mock score for GET requests
    const score = {
      score_id: `score_${Date.now()}`,
      session_id: sessionId,
      area_scores: {
        CN: { raw_score: 500, percentage: 50, correct: 0, total: 0 },
        CH: { raw_score: 500, percentage: 50, correct: 0, total: 0 },
        LC: { raw_score: 500, percentage: 50, correct: 0, total: 0 },
        MT: { raw_score: 500, percentage: 50, correct: 0, total: 0 }
      },
      total_score: 500,
      tri_estimated: {
        score: 500,
        confidence_interval: { lower: 400, upper: 600 },
        disclaimer: 'Pontuação simplificada para consulta.'
      },
      stats: {
        total_time_spent: 0,
        average_time_per_question: 0,
        accuracy_by_topic: {},
        difficulty_breakdown: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
        total_questions: 0,
        answered_questions: 0,
        correct_answers: 0,
        accuracy_percentage: 0
      },
      created_at: new Date()
    };

    return NextResponse.json({
      score,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/enem/scores:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch score',
      success: false 
    }, { status: 500 });
  }
}