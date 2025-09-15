import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EnemSimulator } from '@/components/enem/EnemSimulator'

// Mock the useEnem hook
jest.mock('@/hooks/useEnem', () => ({
  useEnem: () => ({
    questions: [
      {
        id: 'test-1',
        stem: 'Qual é a capital do Brasil?',
        alternatives: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte'],
        correct: 'C',
        rationale: 'Brasília é a capital federal do Brasil desde 1960.',
        difficulty: 'EASY',
        area: 'Geografia',
        disciplina: 'Geografia do Brasil',
        skill_tag: ['geografia'],
        year: 2023,
        source: 'DATABASE',
        image_url: 'https://example.com/brasilia.jpg',
        image_alt: 'Foto de Brasília'
      },
      {
        id: 'test-2',
        stem: '### Questão de Matemática\n\nCalcule: **2 + 2 = ?**',
        alternatives: ['3', '4', '5', '6', '7'],
        correct: 'B',
        rationale: 'A soma de 2 + 2 é igual a 4.',
        difficulty: 'EASY',
        area: 'Matemática',
        disciplina: 'Aritmética',
        skill_tag: ['matemática'],
        year: 2023,
        source: 'AI'
      }
    ],
    currentQuestion: 0,
    answers: {},
    timeLeft: 3600,
    isActive: false,
    isFinished: false,
    score: undefined,
    isLoading: false,
    useProgressiveLoading: true,
    setUseProgressiveLoading: jest.fn(),
    loadQuestions: jest.fn(),
    loadRealQuestions: jest.fn(),
    loadQuestionsProgressive: jest.fn(),
    startSimulation: jest.fn(),
    pauseSimulation: jest.fn(),
    resumeSimulation: jest.fn(),
    finishSimulation: jest.fn(),
    selectAnswer: jest.fn(),
    nextQuestion: jest.fn(),
    prevQuestion: jest.fn(),
    resetSimulation: jest.fn(),
    setTimeLeft: jest.fn(),
    progressiveLoading: {
      canStart: true,
      isLoading: false,
      progress: 100
    },
    getCurrentProgressiveQuestion: jest.fn(),
    getAvailableProgressiveQuestions: jest.fn(),
    canNavigateToProgressiveQuestion: jest.fn()
  })
}))

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>
  }
})

// Mock ImageWithFallback
jest.mock('@/components/enem/ImageWithFallback', () => ({
  ImageWithFallback: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="question-image" />
  )
}))

describe('ENEM Simulator Integration', () => {
  const mockProps = {
    area: 'Ciências Humanas',
    numQuestions: 2,
    duration: 60,
    useRealQuestions: true,
    year: 2023,
    useProgressiveLoading: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders simulator with initial state', () => {
    render(<EnemSimulator {...mockProps} />)
    
    expect(screen.getByText('Simulado ENEM')).toBeInTheDocument()
    expect(screen.getByText('Iniciar Simulado')).toBeInTheDocument()
  })

  it('displays question with markdown formatting', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    // Mock active state
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 1
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
      expect(screen.getByText('### Questão de Matemática')).toBeInTheDocument()
      expect(screen.getByText('Calcule: **2 + 2 = ?**')).toBeInTheDocument()
    })
  })

  it('renders alternatives with proper labels', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 0
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('A)')).toBeInTheDocument()
      expect(screen.getByText('São Paulo')).toBeInTheDocument()
      expect(screen.getByText('B)')).toBeInTheDocument()
      expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
      expect(screen.getByText('C)')).toBeInTheDocument()
      expect(screen.getByText('Brasília')).toBeInTheDocument()
    })
  })

  it('handles alternative selection', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    const mockSelectAnswer = jest.fn()
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 0,
      selectAnswer: mockSelectAnswer
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      const brasiliaButton = screen.getByText('Brasília').closest('button')
      expect(brasiliaButton).toBeInTheDocument()
      
      fireEvent.click(brasiliaButton!)
      expect(mockSelectAnswer).toHaveBeenCalledWith('c')
    })
  })

  it('displays image when available', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 0
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      const image = screen.getByTestId('question-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/brasilia.jpg')
      expect(image).toHaveAttribute('alt', 'Foto de Brasília')
    })
  })

  it('shows source badge for different question types', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 1
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('IA')).toBeInTheDocument()
    })
  })

  it('handles navigation between questions', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    const mockNextQuestion = jest.fn()
    const mockPrevQuestion = jest.fn()
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      currentQuestion: 0,
      nextQuestion: mockNextQuestion,
      prevQuestion: mockPrevQuestion
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      const nextButton = screen.getByText('Próxima')
      const prevButton = screen.getByText('Anterior')
      
      expect(nextButton).toBeInTheDocument()
      expect(prevButton).toBeInTheDocument()
      expect(prevButton).toBeDisabled()
      
      fireEvent.click(nextButton)
      expect(mockNextQuestion).toHaveBeenCalled()
    })
  })

  it('displays timer correctly', () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isActive: true,
      timeLeft: 1800 // 30 minutes
    })

    render(<EnemSimulator {...mockProps} />)
    
    expect(screen.getByText('30:00')).toBeInTheDocument()
  })

  it('handles simulation completion', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isFinished: true,
      score: 750
    })

    render(<EnemSimulator {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Simulado Concluído!')).toBeInTheDocument()
      expect(screen.getByText('Sua pontuação: 750/1000')).toBeInTheDocument()
    })
  })

  it('handles error states gracefully', async () => {
    const { useEnem } = require('@/hooks/useEnem')
    const mockUseEnem = useEnem as jest.Mock
    
    mockUseEnem.mockReturnValue({
      ...mockUseEnem(),
      isLoading: true
    })

    render(<EnemSimulator {...mockProps} />)
    
    expect(screen.getByText('Carregando questões...')).toBeInTheDocument()
  })
})
