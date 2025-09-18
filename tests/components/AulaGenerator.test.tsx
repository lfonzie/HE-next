import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AulaGenerator from '@/components/aulas/AulaGenerator'

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

describe('AulaGenerator', () => {
  const mockProps = {
    formData: { topic: '' },
    onFormDataChange: jest.fn(),
    onGenerate: jest.fn(),
    onKeyPress: jest.fn(),
    isGenerating: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<AulaGenerator {...mockProps} />)
    
    expect(screen.getByText('Gerador de Aulas Personalizado')).toBeInTheDocument()
    expect(screen.getByText('O que você quer aprender hoje?')).toBeInTheDocument()
    expect(screen.getByText('Gerar Aula Interativa')).toBeInTheDocument()
  })

  it('updates form data when topic changes', async () => {
    render(<AulaGenerator {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText(/Exemplo: Como a fotossíntese/)
    fireEvent.change(textarea, { target: { value: 'Test topic' } })
    
    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      topic: 'Test topic'
    })
  })

  it('calls onGenerate when button is clicked', () => {
    const propsWithTopic = {
      ...mockProps,
      formData: { topic: 'Test topic' }
    }
    
    render(<AulaGenerator {...propsWithTopic} />)
    
    const generateButton = screen.getByText('Gerar Aula Interativa')
    fireEvent.click(generateButton)
    
    expect(mockProps.onGenerate).toHaveBeenCalled()
  })

  it('disables button when topic is empty', () => {
    render(<AulaGenerator {...mockProps} />)
    
    const generateButton = screen.getByText('Gerar Aula Interativa')
    expect(generateButton).toBeDisabled()
  })

  it('disables button when generating', () => {
    const propsWithGenerating = {
      ...mockProps,
      isGenerating: true
    }
    
    render(<AulaGenerator {...propsWithGenerating} />)
    
    const generateButton = screen.getByText('Gerando sua aula personalizada...')
    expect(generateButton).toBeDisabled()
  })

  it('calls onKeyPress when Enter is pressed', () => {
    const propsWithTopic = {
      ...mockProps,
      formData: { topic: 'Test topic' }
    }
    
    render(<AulaGenerator {...propsWithTopic} />)
    
    const textarea = screen.getByPlaceholderText(/Exemplo: Como a fotossíntese/)
    fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter' })
    
    expect(mockProps.onKeyPress).toHaveBeenCalled()
  })

  it('shows character count', () => {
    const propsWithTopic = {
      ...mockProps,
      formData: { topic: 'Test' }
    }
    
    render(<AulaGenerator {...propsWithTopic} />)
    
    expect(screen.getByText('4/500')).toBeInTheDocument()
  })

  it('handles speech-to-text button click', () => {
    render(<AulaGenerator {...mockProps} />)
    
    const speechButton = screen.getByLabelText('Ativar entrada por voz')
    fireEvent.click(speechButton)
    
    // Should not throw error
    expect(speechButton).toBeInTheDocument()
  })

  it('handles text-to-speech button click', () => {
    const propsWithTopic = {
      ...mockProps,
      formData: { topic: 'Test topic' }
    }
    
    render(<AulaGenerator {...propsWithTopic} />)
    
    const ttsButton = screen.getByLabelText('Ouvir o texto em voz alta')
    fireEvent.click(ttsButton)
    
    // Should not throw error
    expect(ttsButton).toBeInTheDocument()
  })

  it('shows accessibility features', () => {
    render(<AulaGenerator {...mockProps} />)
    
    expect(screen.getByText('Acessibilidade')).toBeInTheDocument()
    expect(screen.getByLabelText('Ativar entrada por voz')).toBeInTheDocument()
    expect(screen.getByLabelText('Ouvir o texto em voz alta')).toBeInTheDocument()
  })

  it('shows multi-subject support', () => {
    render(<AulaGenerator {...mockProps} />)
    
    expect(screen.getByText('Suporte Multidisciplinar Completo')).toBeInTheDocument()
    expect(screen.getByText('Matemática')).toBeInTheDocument()
    expect(screen.getByText('Ciências')).toBeInTheDocument()
    expect(screen.getByText('História')).toBeInTheDocument()
  })
})


