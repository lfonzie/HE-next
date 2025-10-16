import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useParams } from 'next/navigation'
import AulasV2LessonPage from '@/app/(dashboard)/aulas-v2/[id]/page'

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('AulasV2LessonPage - Slide 14 Flashcards Module', () => {
  const mockLesson = {
    id: 'test-lesson',
    title: 'Test Lesson',
    subject: 'Matemática',
    slides: [
      {
        slideNumber: 14,
        type: 'closing',
        title: 'Conclusão',
        content: 'Parabéns por completar a aula!',
        imageUrl: null,
        requiresImage: false,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({ id: 'test-lesson' })
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockLesson)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  it('should display flashcards module on slide 14', () => {
    render(<AulasV2LessonPage />)
    
    // Wait for component to render and check for flashcards module
    expect(screen.getByText('Flashcards do Tema')).toBeInTheDocument()
    expect(screen.getByText(/Pratique os conceitos aprendidos nesta aula/)).toBeInTheDocument()
    expect(screen.getByText('Acessar Flashcards')).toBeInTheDocument()
  })

  it('should open flashcards in new tab when button is clicked', () => {
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    })

    render(<AulasV2LessonPage />)
    
    const flashcardsButton = screen.getByText('Acessar Flashcards')
    flashcardsButton.click()
    
    expect(mockOpen).toHaveBeenCalledWith('/flashcards', '_blank')
  })

  it('should not display flashcards module on other slides', () => {
    const lessonWithSlide13 = {
      ...mockLesson,
      slides: [
        {
          slideNumber: 13,
          type: 'content',
          title: 'Síntese',
          content: 'Resumo dos conceitos',
          imageUrl: null,
          requiresImage: false,
        },
      ],
    }

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(lessonWithSlide13)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    render(<AulasV2LessonPage />)
    
    expect(screen.queryByText('Flashcards do Tema')).not.toBeInTheDocument()
  })
})
