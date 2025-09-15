import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AlternativeButton } from '@/components/enem/AlternativeButton'

describe('AlternativeButton', () => {
  const mockProps = {
    label: 'A',
    text: 'Esta é uma alternativa de teste',
    index: 0,
    isSelected: false,
    onClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders alternative button correctly', () => {
    render(<AlternativeButton {...mockProps} />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('A)')).toBeInTheDocument()
    expect(screen.getByText('Esta é uma alternativa de teste')).toBeInTheDocument()
  })

  it('applies selected styling when isSelected is true', () => {
    render(<AlternativeButton {...mockProps} isSelected={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('applies outline styling when isSelected is false', () => {
    render(<AlternativeButton {...mockProps} isSelected={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-input')
  })

  it('calls onClick when clicked', () => {
    render(<AlternativeButton {...mockProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<AlternativeButton {...mockProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('cleans text from duplicate labels', () => {
    const propsWithDuplicateLabel = {
      ...mockProps,
      text: 'A) Esta é uma alternativa com label duplicado'
    }
    
    render(<AlternativeButton {...propsWithDuplicateLabel} />)
    
    expect(screen.getByText('A)')).toBeInTheDocument()
    expect(screen.getByText('Esta é uma alternativa com label duplicado')).toBeInTheDocument()
  })

  it('handles long text with appropriate styling', () => {
    const longText = 'Esta é uma alternativa muito longa que deve ser tratada adequadamente para quebrar linhas e manter a legibilidade em dispositivos móveis e desktop'
    
    render(<AlternativeButton {...mockProps} text={longText} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('whitespace-normal', 'break-words')
  })

  it('applies responsive styling', () => {
    render(<AlternativeButton {...mockProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-sm', 'sm:text-base')
    expect(button).toHaveClass('min-h-[44px]', 'sm:min-h-[48px]')
  })

  it('handles empty text gracefully', () => {
    render(<AlternativeButton {...mockProps} text="" />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('A)')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-alternative-class'
    
    render(<AlternativeButton {...mockProps} className={customClass} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass(customClass)
  })
})

describe('AlternativeButton utility functions', () => {
  const { cleanAlternativeText, getAlternativeLabel } = require('@/components/enem/AlternativeButton')

  describe('cleanAlternativeText', () => {
    it('removes A) prefix', () => {
      expect(cleanAlternativeText('A) Texto da alternativa')).toBe('Texto da alternativa')
    })

    it('removes B. prefix', () => {
      expect(cleanAlternativeText('B. Texto da alternativa')).toBe('Texto da alternativa')
    })

    it('removes C prefix', () => {
      expect(cleanAlternativeText('C Texto da alternativa')).toBe('Texto da alternativa')
    })

    it('handles text without prefix', () => {
      expect(cleanAlternativeText('Texto da alternativa')).toBe('Texto da alternativa')
    })

    it('handles empty text', () => {
      expect(cleanAlternativeText('')).toBe('')
    })
  })

  describe('getAlternativeLabel', () => {
    it('returns correct labels for indices', () => {
      expect(getAlternativeLabel(0)).toBe('A')
      expect(getAlternativeLabel(1)).toBe('B')
      expect(getAlternativeLabel(2)).toBe('C')
      expect(getAlternativeLabel(3)).toBe('D')
      expect(getAlternativeLabel(4)).toBe('E')
    })
  })
})
