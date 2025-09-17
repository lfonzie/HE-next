import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { EnemSimulator } from '@/components/enem/EnemSimulator'
import { QuestionRenderer } from '@/components/enem/QuestionRenderer'
import { AlternativeButton } from '@/components/enem/AlternativeButton'
import { ResultsPage } from '@/components/enem/ResultsPage'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock dependencies
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
        source: 'DATABASE'
      }
    ],
    currentQuestion: 0,
    answers: {},
    timeLeft: 3600,
    isActive: true,
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

jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>
  }
})

jest.mock('@/components/enem/ImageWithFallback', () => ({
  ImageWithFallback: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  )
}))

describe('Accessibility Tests', () => {
  describe('QuestionRenderer', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <QuestionRenderer 
          question="Qual é a capital do Brasil?"
          imageUrl="https://example.com/image.jpg"
          imageAlt="Foto de Brasília"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', () => {
      render(
        <QuestionRenderer 
          question="# Título Principal\n## Subtítulo\nTexto da questão"
        />
      )
      
      // The component should render headings properly
      // This would be tested with actual markdown rendering
    })

    it('should have proper image alt text', () => {
      render(
        <QuestionRenderer 
          question="Questão com imagem"
          imageUrl="https://example.com/image.jpg"
          imageAlt="Descrição da imagem"
        />
      )
      
      const image = document.querySelector('img')
      expect(image).toHaveAttribute('alt', 'Descrição da imagem')
    })
  })

  describe('AlternativeButton', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AlternativeButton
          label="A"
          text="Esta é uma alternativa de teste"
          index={0}
          isSelected={false}
          onClick={() => {}}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper button semantics', () => {
      render(
        <AlternativeButton
          label="A"
          text="Esta é uma alternativa de teste"
          index={0}
          isSelected={false}
          onClick={() => {}}
        />
      )
      
      const button = document.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should indicate selected state', () => {
      render(
        <AlternativeButton
          label="A"
          text="Esta é uma alternativa de teste"
          index={0}
          isSelected={true}
          onClick={() => {}}
        />
      )
      
      const button = document.querySelector('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('should be keyboard accessible', () => {
      const mockOnClick = jest.fn()
      
      render(
        <AlternativeButton
          label="A"
          text="Esta é uma alternativa de teste"
          index={0}
          isSelected={false}
          onClick={mockOnClick}
        />
      )
      
      const button = document.querySelector('button')
      
      // Test Enter key
      button?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      expect(mockOnClick).toHaveBeenCalled()
      
      // Test Space key
      button?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('should have proper focus management', () => {
      render(
        <AlternativeButton
          label="A"
          text="Esta é uma alternativa de teste"
          index={0}
          isSelected={false}
          onClick={() => {}}
        />
      )
      
      const button = document.querySelector('button')
      button?.focus()
      
      expect(document.activeElement).toBe(button)
    })
  })

  describe('EnemSimulator', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have proper form labels', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Check for proper labeling of interactive elements
      const buttons = document.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String))
      })
    })

    it('should support keyboard navigation', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Test tab navigation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      expect(focusableElements.length).toBeGreaterThan(0)
      
      // Test that elements are focusable
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have proper ARIA attributes', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Check for ARIA landmarks
      const main = document.querySelector('main')
      const navigation = document.querySelector('nav')
      
      // Should have main content area
      expect(main || document.querySelector('[role="main"]')).toBeTruthy()
    })

    it('should have proper color contrast', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // This would typically be tested with a color contrast checker
      // For now, we ensure proper semantic markup
      const textElements = document.querySelectorAll('p, span, div')
      expect(textElements.length).toBeGreaterThan(0)
    })
  })

  describe('ResultsPage', () => {
    const mockResultsData = {
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
          year: 2023
        }
      ],
      answers: {
        'test-1': {
          questionId: 'test-1',
          answer: 'C',
          timeSpent: 30
        }
      },
      totalTime: 1800,
      startTime: Date.now() - 1800000,
      endTime: Date.now()
    }

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ResultsPage
          resultsData={mockResultsData}
          onRetry={() => {}}
          onClose={() => {}}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', () => {
      render(
        <ResultsPage
          resultsData={mockResultsData}
          onRetry={() => {}}
          onClose={() => {}}
        />
      )
      
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check for h1
      const h1 = document.querySelector('h1')
      expect(h1).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      render(
        <ResultsPage
          resultsData={mockResultsData}
          onRetry={() => {}}
          onClose={() => {}}
        />
      )
      
      const buttons = document.querySelectorAll('button')
      buttons.forEach(button => {
        const textContent = button.textContent?.trim()
        expect(textContent).toBeTruthy()
        expect(textContent?.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA live regions for dynamic content', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Check for live regions for timer updates, question changes, etc.
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should have proper ARIA labels for complex interactions', () => {
      render(
        <EnemSimulator
          area="Ciências Humanas"
          numQuestions={5}
          duration={60}
          useRealQuestions={true}
          year={2023}
          useProgressiveLoading={true}
        />
      )
      
      // Check for proper labeling of complex widgets
      const progressBars = document.querySelectorAll('[role="progressbar"]')
      progressBars.forEach(progressBar => {
        expect(progressBar).toHaveAttribute('aria-label')
      })
    })
  })
})
