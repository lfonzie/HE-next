"use client";

import { useState, useCallback } from 'react';
import { detectSubject } from '@/utils/professor-interactive/subjectDetection';

interface InteractiveStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
  expectedAnswer?: string;
  helpMessage?: string;
  correctAnswer?: string;
  options?: string[];
  correctOption?: number;
}

interface InteractiveLesson {
  title: string;
  subject: string;
  introduction: string;
  steps: InteractiveStep[];
  finalTest: {
    question: string;
    expectedAnswer: string;
    helpMessage: string;
    correctAnswer: string;
    options?: string[];
    correctOption?: number;
  };
  summary: string;
  nextSteps: string[];
}

export function useLessonGeneration() {
  const [lesson, setLesson] = useState<InteractiveLesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = useCallback(async (query: string, subject?: string) => {
    try {
      setError(null);
      
      // Detect subject if not provided
      const detectedSubject = subject || await detectSubject(query);
      
      const response = await fetch('/api/module-professor-interactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          subject: detectedSubject
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.lesson) {
        setLesson(data.lesson);
        return data.lesson;
      } else {
        throw new Error('Resposta da API inválida');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Falha ao gerar aula interativa: ${errorMessage}`);
      throw error;
    }
  }, []);

  const generateMockLesson = useCallback((query: string, subject: string = 'Geral') => {
    const mockLesson: InteractiveLesson = {
      title: `Aula Interativa: ${query}`,
      subject: subject,
      introduction: `Vamos explorar o tema "${query}" de forma interativa e envolvente!`,
      steps: [
        {
          type: 'explanation',
          content: `Este é o primeiro passo para entender "${query}". Aqui você aprenderá os conceitos fundamentais.`,
          question: `Qual é o conceito principal relacionado a "${query}"?`,
          expectedAnswer: 'Conceito fundamental',
          helpMessage: 'Pense nos elementos básicos que compõem este tema.',
          correctAnswer: 'O conceito principal é...',
          options: ['Conceito fundamental', 'Aplicação prática', 'Exemplo específico', 'Definição técnica'],
          correctOption: 0
        },
        {
          type: 'question',
          content: `Agora vamos praticar com "${query}". Este exercício ajudará você a consolidar o conhecimento.`,
          question: `Como você aplicaria "${query}" em uma situação prática?`,
          expectedAnswer: 'Aplicação prática',
          helpMessage: 'Considere como este conceito pode ser usado no mundo real.',
          correctAnswer: 'A aplicação prática seria...',
          options: ['Aplicação prática', 'Teoria abstrata', 'Exemplo histórico', 'Definição formal'],
          correctOption: 0
        },
        {
          type: 'example',
          content: `Vamos ver um exemplo prático de "${query}" para consolidar o aprendizado.`,
          question: `Qual característica deste exemplo é mais importante?`,
          expectedAnswer: 'Característica principal',
          helpMessage: 'Identifique o aspecto mais relevante do exemplo.',
          correctAnswer: 'A característica principal é...',
          options: ['Característica principal', 'Detalhe secundário', 'Contexto histórico', 'Aplicação futura'],
          correctOption: 0
        }
      ],
      finalTest: {
        question: `Qual é a importância de "${query}"?`,
        expectedAnswer: 'Importância fundamental',
        helpMessage: 'Pense nos benefícios e impactos deste conceito.',
        correctAnswer: 'A importância é fundamental porque...',
        options: ['Importância fundamental', 'Relevância secundária', 'Aplicação limitada', 'Uso específico'],
        correctOption: 0
      },
      summary: `Você completou a aula interativa sobre "${query}"! Parabéns pelo progresso.`,
      nextSteps: [
        'Continue praticando com exercícios similares',
        'Explore tópicos relacionados',
        'Aplique o conhecimento em projetos práticos'
      ]
    };

    setLesson(mockLesson);
    return mockLesson;
  }, []);

  const clearLesson = useCallback(() => {
    setLesson(null);
    setError(null);
  }, []);

  return {
    lesson,
    error,
    generateLesson,
    generateMockLesson,
    clearLesson
  };
}
