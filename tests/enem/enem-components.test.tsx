import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { vi } from 'vitest';
import { EnemConfiguration } from '@/components/enem/EnemConfiguration';
import { EnemQuestionCard } from '@/components/enem/EnemQuestionCard';
import { EnemNavigation } from '@/components/enem/EnemNavigation';
import { EnemResults } from '@/components/enem/EnemResults';

// Mock the stores
vi.mock('@/lib/stores/enem-config-store', () => ({
  useEnemConfigStore: vi.fn(() => ({
    config: {
      area: 'matematica',
      mode: 'MIXED',
      total_questions: 20,
      duration_sec: 3600,
      years: [2023],
      difficulty: ['MEDIUM'],
      skill_tags: [],
      fallback_threshold: 0.7
    },
    areas: {
      matematica: {
        name: 'Matemática e suas Tecnologias',
        description: 'Questões de Matemática',
        disciplines: ['Matemática'],
        competencies: ['Compreender conceitos'],
        skills: ['Álgebra', 'Geometria']
      }
    },
    modes: {
      MIXED: {
        name: 'Modo Misto',
        description: 'Combina questões reais e IA',
        pros: ['Melhor dos dois mundos'],
        cons: ['Complexidade maior'],
        recommended_for: 'Estudantes'
      }
    },
    showAdvancedFilters: false,
    setConfig: vi.fn(),
    toggleAdvancedFilters: vi.fn(),
    validateConfig: vi.fn(() => ({ isValid: true, errors: [] })),
    loadPreset: vi.fn()
  }))
}));

vi.mock('@/lib/stores/enem-ui-store', () => ({
  useEnemUIStore: vi.fn(() => ({
    showInfoToast: vi.fn()
  }))
}));

vi.mock('@/lib/stores/enem-simulation-store', () => ({
  useEnemSimulationStore: vi.fn(() => ({
    progress: {
      currentQuestionIndex: 0,
      totalQuestions: 20,
      answeredQuestions: 5,
      timeRemaining: 1800,
      isActive: true
    },
    batchInfo: {
      batchNumber: 0,
      totalBatches: 7,
      questionsInBatch: 3,
      isGenerating: false,
      progress: 100
    },
    getCurrentQuestion: vi.fn(() => ({
      id: 'q1',
      area: 'matematica',
      year: 2023,
      disciplina: 'Matemática',
      skill_tag: ['álgebra'],
      stem: 'Test question',
      a: 'Option A',
      b: 'Option B',
      c: 'Option C',
      d: 'Option D',
      e: 'Option E',
      correct: 'A',
      rationale: 'Test rationale',
      difficulty: 'MEDIUM',
      source: 'DATABASE'
    })),
    getBatchStatus: vi.fn(() => ({
      isGenerating: false,
      progress: 100,
      error: undefined,
      isAvailable: true
    }))
  }))
}));

describe('ENEM Components Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EnemConfiguration', () => {
    it('should render configuration form', () => {
      render(<EnemConfiguration />);
      
      expect(screen.getByText('Configuração do Simulador ENEM')).toBeInTheDocument();
      expect(screen.getByText('Área do Conhecimento')).toBeInTheDocument();
      expect(screen.getByText('Tipo de Questões')).toBeInTheDocument();
      expect(screen.getByText('Configurações Básicas')).toBeInTheDocument();
    });

    it('should show area selection', () => {
      render(<EnemConfiguration />);
      
      expect(screen.getByText('Matemática e suas Tecnologias')).toBeInTheDocument();
      expect(screen.getByText('Questões de Matemática')).toBeInTheDocument();
    });

    it('should show mode selection', () => {
      render(<EnemConfiguration />);
      
      expect(screen.getByText('Modo Misto')).toBeInTheDocument();
      expect(screen.getByText('Combina questões reais e IA')).toBeInTheDocument();
    });

    it('should show presets', () => {
      render(<EnemConfiguration />);
      
      expect(screen.getByText('Rápido')).toBeInTheDocument();
      expect(screen.getByText('Padrão')).toBeInTheDocument();
      expect(screen.getByText('Completo')).toBeInTheDocument();
    });

    it('should handle preset selection', async () => {
      const mockLoadPreset = vi.fn();
      vi.mocked(require('@/lib/stores/enem-config-store').useEnemConfigStore).mockReturnValue({
        config: {
          area: 'matematica',
          mode: 'MIXED',
          total_questions: 20,
          duration_sec: 3600,
          years: [2023],
          difficulty: ['MEDIUM'],
          skill_tags: [],
          fallback_threshold: 0.7
        },
        areas: {},
        modes: {},
        showAdvancedFilters: false,
        setConfig: vi.fn(),
        toggleAdvancedFilters: vi.fn(),
        validateConfig: vi.fn(() => ({ isValid: true, errors: [] })),
        loadPreset: mockLoadPreset
      });

      render(<EnemConfiguration />);
      
      const quickPreset = screen.getByText('Rápido');
      fireEvent.click(quickPreset);
      
      expect(mockLoadPreset).toHaveBeenCalledWith('quick');
    });
  });

  describe('EnemQuestionCard', () => {
    const mockQuestion = {
      id: 'q1',
      area: 'matematica',
      year: 2023,
      disciplina: 'Matemática',
      skill_tag: ['álgebra'],
      stem: 'Qual é o valor de x na equação 2x + 5 = 13?',
      a: 'x = 4',
      b: 'x = 3',
      c: 'x = 5',
      d: 'x = 6',
      e: 'x = 2',
      correct: 'A',
      rationale: 'Resolvendo a equação: 2x + 5 = 13, temos 2x = 8, logo x = 4.',
      difficulty: 'MEDIUM' as const,
      source: 'DATABASE' as const
    };

    it('should render question card', () => {
      render(
        <EnemQuestionCard
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={20}
          onAnswerSelect={vi.fn()}
        />
      );
      
      expect(screen.getByText('Questão 1 de 20')).toBeInTheDocument();
      expect(screen.getByText('Qual é o valor de x na equação 2x + 5 = 13?')).toBeInTheDocument();
      expect(screen.getByText('x = 4')).toBeInTheDocument();
      expect(screen.getByText('x = 3')).toBeInTheDocument();
    });

    it('should handle answer selection', () => {
      const mockOnAnswerSelect = vi.fn();
      
      render(
        <EnemQuestionCard
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={20}
          onAnswerSelect={mockOnAnswerSelect}
        />
      );
      
      const optionA = screen.getByText('x = 4');
      fireEvent.click(optionA);
      
      expect(mockOnAnswerSelect).toHaveBeenCalledWith('A');
    });

    it('should show rationale when toggled', () => {
      render(
        <EnemQuestionCard
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={20}
          onAnswerSelect={vi.fn()}
          showRationale={true}
          onToggleRationale={vi.fn()}
        />
      );
      
      expect(screen.getByText('Explicação')).toBeInTheDocument();
      expect(screen.getByText('Resolvendo a equação: 2x + 5 = 13, temos 2x = 8, logo x = 4.')).toBeInTheDocument();
    });

    it('should show timer when provided', () => {
      render(
        <EnemQuestionCard
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={20}
          onAnswerSelect={vi.fn()}
          timeRemaining={300}
          isActive={true}
        />
      );
      
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });
  });

  describe('EnemNavigation', () => {
    const mockQuestionStatuses = [
      { index: 0, isAnswered: true, isCorrect: true, isCurrent: true },
      { index: 1, isAnswered: false, isCurrent: false },
      { index: 2, isAnswered: true, isCorrect: false, isCurrent: false }
    ];

    it('should render navigation controls', () => {
      render(
        <EnemNavigation
          currentQuestion={0}
          totalQuestions={20}
          answeredQuestions={5}
          timeRemaining={1800}
          isActive={true}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          onGoToQuestion={vi.fn()}
          questionStatuses={mockQuestionStatuses}
        />
      );
      
      expect(screen.getByText('Progresso:')).toBeInTheDocument();
      expect(screen.getByText('5/20 questões')).toBeInTheDocument();
      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Próxima')).toBeInTheDocument();
    });

    it('should handle navigation', () => {
      const mockOnNext = vi.fn();
      const mockOnPrevious = vi.fn();
      
      render(
        <EnemNavigation
          currentQuestion={0}
          totalQuestions={20}
          answeredQuestions={5}
          timeRemaining={1800}
          isActive={true}
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
          onGoToQuestion={vi.fn()}
          questionStatuses={mockQuestionStatuses}
        />
      );
      
      const nextButton = screen.getByText('Próxima');
      fireEvent.click(nextButton);
      
      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should show question grid when toggled', () => {
      render(
        <EnemNavigation
          currentQuestion={0}
          totalQuestions={20}
          answeredQuestions={5}
          timeRemaining={1800}
          isActive={true}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          onGoToQuestion={vi.fn()}
          questionStatuses={mockQuestionStatuses}
          showQuestionGrid={true}
          onToggleQuestionGrid={vi.fn()}
        />
      );
      
      expect(screen.getByText('Grade de Questões')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('EnemResults', () => {
    const mockStats = {
      correctAnswers: 15,
      incorrectAnswers: 3,
      skippedAnswers: 2,
      averageTimePerQuestion: 90,
      accuracy: 83.3,
      timeSpent: 1800,
      difficultyBreakdown: {
        easy: { correct: 5, total: 5 },
        medium: { correct: 8, total: 10 },
        hard: { correct: 2, total: 5 }
      },
      skillBreakdown: {
        'álgebra': { correct: 8, total: 10 },
        'geometria': { correct: 7, total: 10 }
      }
    };

    it('should render results', () => {
      render(
        <EnemResults
          stats={mockStats}
          totalQuestions={20}
          timeSpent={1800}
          onRestart={vi.fn()}
        />
      );
      
      expect(screen.getByText('Resultado do Simulado')).toBeInTheDocument();
      expect(screen.getByText('83.3%')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show performance level', () => {
      render(
        <EnemResults
          stats={mockStats}
          totalQuestions={20}
          timeSpent={1800}
          onRestart={vi.fn()}
        />
      );
      
      expect(screen.getByText('Bom')).toBeInTheDocument();
    });

    it('should show difficulty breakdown', () => {
      render(
        <EnemResults
          stats={mockStats}
          totalQuestions={20}
          timeSpent={1800}
          onRestart={vi.fn()}
        />
      );
      
      expect(screen.getByText('Desempenho por Dificuldade')).toBeInTheDocument();
      expect(screen.getByText('Fácil')).toBeInTheDocument();
      expect(screen.getByText('Médio')).toBeInTheDocument();
      expect(screen.getByText('Difícil')).toBeInTheDocument();
    });

    it('should show skills analysis', () => {
      render(
        <EnemResults
          stats={mockStats}
          totalQuestions={20}
          timeSpent={1800}
          onRestart={vi.fn()}
        />
      );
      
      expect(screen.getByText('Pontos Fortes')).toBeInTheDocument();
      expect(screen.getByText('Áreas para Melhorar')).toBeInTheDocument();
    });

    it('should handle restart', () => {
      const mockOnRestart = vi.fn();
      
      render(
        <EnemResults
          stats={mockStats}
          totalQuestions={20}
          timeSpent={1800}
          onRestart={mockOnRestart}
        />
      );
      
      const restartButton = screen.getByText('Fazer Novo Simulado');
      fireEvent.click(restartButton);
      
      expect(mockOnRestart).toHaveBeenCalled();
    });
  });
});
