// app/api/aulas/skeleton/route.js
// Endpoint para gerar esqueleto da aula (estrutura mínima)

import { NextResponse } from 'next/server';

/**
 * Gera esqueleto da aula com estrutura mínima de 14 etapas
 * @param {string} topic - Tópico da aula
 * @returns {Object} Esqueleto da aula
 */
function generateLessonSkeleton(topic) {
  const skeleton = {
    id: `skeleton_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: topic,
    subject: topic,
    level: 'Intermediário',
    duration: 'N/A min',
    points: 0,
    progress: '0/14 etapas, 0%',
    stages: [
      {
        etapa: 1,
        title: 'Abertura: Tema e Objetivos',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 2,
        title: 'Conceitos Fundamentais',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 3,
        title: 'Desenvolvimento dos Processos',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 4,
        title: 'Aplicações Práticas',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 5,
        title: 'Variações e Adaptações',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 6,
        title: 'Conexões Avançadas',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 7,
        title: 'Quiz: Conceitos Básicos',
        type: 'Avaliação',
        completed: false,
        points: 0
      },
      {
        etapa: 8,
        title: 'Aprofundamento',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 9,
        title: 'Exemplos Práticos',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 10,
        title: 'Análise Crítica',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 11,
        title: 'Síntese Intermediária',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 12,
        title: 'Quiz: Análise Situacional',
        type: 'Avaliação',
        completed: false,
        points: 0
      },
      {
        etapa: 13,
        title: 'Aplicações Futuras',
        type: 'Conteúdo',
        completed: false,
        points: 0
      },
      {
        etapa: 14,
        title: 'Encerramento: Síntese Final',
        type: 'Conteúdo',
        completed: false,
        points: 0
      }
    ],
    metadata: {
      subject: topic,
      grade: 'Ensino Médio',
      difficulty: 'Intermediário',
      tags: [topic.toLowerCase()]
    }
  };

  return skeleton;
}

export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ 
        error: 'Tópico é obrigatório' 
      }, { status: 400 });
    }

    const skeleton = generateLessonSkeleton(topic);

    return NextResponse.json({
      success: true,
      skeleton,
      message: 'Esqueleto da aula gerado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao gerar esqueleto da aula:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}
