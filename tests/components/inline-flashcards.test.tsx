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
      expect(screen.getByText('3 flashcards sobre JavaScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
    })
  })

  it('shows error when generation fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<InlineFlashcards topic="JavaScript" />)
    
    await waitFor(() => {
      expect(screen.getByText('❌ Erro')).toBeInTheDocument()
    })
  })

  it('shows manual generation button when shouldLoad is false', () => {
    render(<InlineFlashcards topic="" shouldLoad={false} />)
    
    // Verificar se o botão de gerar está presente
    const generateButton = screen.getByText('Gerar Flashcards')
    expect(generateButton).toBeInTheDocument()
    
    // Verificar se o título está correto
    expect(screen.getByText('🎴 Flashcards do Tema')).toBeInTheDocument()
  })
})
