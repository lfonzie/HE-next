import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QuestionRenderer } from '@/components/enem/QuestionRenderer'

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

describe('QuestionRenderer', () => {
  const mockQuestion = 'Esta é uma questão de teste com **texto em negrito** e *texto em itálico*.'

  it('renders question text correctly', () => {
    render(<QuestionRenderer question={mockQuestion} />)
    
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-content')).toHaveTextContent(mockQuestion)
  })

  it('renders image when imageUrl is provided', () => {
    const imageUrl = 'https://example.com/image.jpg'
    const imageAlt = 'Test image'
    
    render(
      <QuestionRenderer 
        question={mockQuestion} 
        imageUrl={imageUrl} 
        imageAlt={imageAlt} 
      />
    )
    
    const image = screen.getByTestId('question-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', imageUrl)
    expect(image).toHaveAttribute('alt', imageAlt)
  })

  it('does not render image when imageUrl is not provided', () => {
    render(<QuestionRenderer question={mockQuestion} />)
    
    expect(screen.queryByTestId('question-image')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-question-class'
    
    render(
      <QuestionRenderer 
        question={mockQuestion} 
        className={customClass} 
      />
    )
    
    const container = screen.getByTestId('markdown-content').closest('.prose')
    expect(container).toHaveClass(customClass)
  })

  it('handles empty question text', () => {
    render(<QuestionRenderer question="" />)
    
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('')
  })

  it('handles markdown formatting', () => {
    const markdownQuestion = `
# Título Principal
## Subtítulo
- Item 1
- Item 2
**Texto em negrito**
*Texto em itálico*
    `
    
    render(<QuestionRenderer question={markdownQuestion} />)
    
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-content')).toHaveTextContent(markdownQuestion)
  })
})
