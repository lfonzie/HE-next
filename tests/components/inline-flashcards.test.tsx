import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import InlineFlashcards from '@/components/flashcard-maker/InlineFlashcards'

// Mock fetch
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('InlineFlashcards', () => {
  const mockFlashcards = [
    { term: 'React', definition: 'Uma biblioteca JavaScript para construir interfaces de usuário' },
    { term: 'TypeScript', definition: 'Um superset do JavaScript que adiciona tipagem estática' },
    { term: 'Next.js', definition: 'Um framework React para produção' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders correctly with topic', () => {
    render(<InlineFlashcards topic="JavaScript" />)
    
    expect(screen.getByText('🎴 Gerando Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Criando flashcards personalizados para "JavaScript"...')).toBeInTheDocument()
  })

  it('generates flashcards successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flashcards: mockFlashcards })
    })

    render(<InlineFlashcards topic="JavaScript" />)
    
    await waitFor(() => {
      expect(screen.getByText('Card 1 de 3 - JavaScript')).toBeInTheDocument()
    })
  })

  it('shows error when generation fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<InlineFlashcards topic="JavaScript" />)
    
    await waitFor(() => {
      expect(screen.getByText('❌ Erro')).toBeInTheDocument()
    })
  })

  it('allows manual generation', () => {
    render(<InlineFlashcards topic="" />)
    
    expect(screen.getByText('Gerar Flashcards')).toBeInTheDocument()
    
    const generateButton = screen.getByText('Gerar Flashcards')
    fireEvent.click(generateButton)
    
    expect(global.fetch).toHaveBeenCalled()
  })
})
