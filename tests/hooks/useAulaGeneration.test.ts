import { renderHook, act } from '@testing-library/react'
import { useAulaGeneration } from '@/hooks/useAulaGeneration'

// Mock fetch
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

describe('useAulaGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAulaGeneration())

    expect(result.current.formData).toEqual({ topic: '' })
    expect(result.current.formErrors).toEqual({})
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.generatedLesson).toBeNull()
    expect(result.current.generationProgress).toBe(0)
  })

  it('updates form data', () => {
    const { result } = renderHook(() => useAulaGeneration())

    act(() => {
      result.current.setFormData({ topic: 'Test topic' })
    })

    expect(result.current.formData).toEqual({ topic: 'Test topic' })
  })

  it('validates form correctly', () => {
    const { result } = renderHook(() => useAulaGeneration())

    // Test empty topic
    act(() => {
      result.current.setFormData({ topic: '' })
    })

    let isValid = false
    act(() => {
      isValid = result.current.validateForm()
    })

    expect(isValid).toBe(false)
    expect(result.current.formErrors.topic).toBe('Por favor, descreva o tópico da aula')

    // Test short topic
    act(() => {
      result.current.setFormData({ topic: 'Hi' })
    })

    act(() => {
      isValid = result.current.validateForm()
    })

    expect(isValid).toBe(false)
    expect(result.current.formErrors.topic).toBe('Descreva o tópico com mais detalhes (mínimo 5 caracteres)')

    // Test valid topic
    act(() => {
      result.current.setFormData({ topic: 'Valid topic for testing' })
    })

    act(() => {
      isValid = result.current.validateForm()
    })

    expect(isValid).toBe(true)
    expect(result.current.formErrors.topic).toBeUndefined()
  })

  it('handles suggestion click', async () => {
    const { result } = renderHook(() => useAulaGeneration())

    // Mock successful API responses
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          skeleton: {
            id: 'test-lesson-id',
            title: 'Test Lesson',
            stages: Array.from({ length: 14 }, (_, i) => ({
              etapa: `Stage ${i + 1}`,
              type: 'Conteúdo',
              activity: { component: 'AnimationSlide' },
              route: '/content'
            })),
            metadata: { status: 'loading' }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          slides: [
            { number: 1, title: 'Slide 1', content: 'Content 1', type: 'content' },
            { number: 2, title: 'Slide 2', content: 'Content 2', type: 'content' }
          ]
        })
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          slide: { number: 3, title: 'Slide 3', content: 'Content 3', type: 'content' }
        })
      })

    const suggestion = {
      text: 'Test suggestion',
      category: 'Test',
      level: 'Test Level'
    }

    await act(async () => {
      await result.current.handleSuggestionClick(suggestion)
    })

    expect(result.current.formData.topic).toBe('Test suggestion')
    expect(result.current.formErrors).toEqual({})
  })

  it('handles key press', () => {
    const { result } = renderHook(() => useAulaGeneration())

    const mockEvent = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: jest.fn()
    } as any

    act(() => {
      result.current.setFormData({ topic: 'Valid topic' })
    })

    act(() => {
      result.current.handleKeyPress(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('does not handle key press when generating', () => {
    const { result } = renderHook(() => useAulaGeneration())

    const mockEvent = {
      key: 'Enter',
      shiftKey: false,
      preventDefault: jest.fn()
    } as any

    act(() => {
      result.current.setFormData({ topic: 'Valid topic' })
      // Simulate generating state
      result.current.generationState.isGenerating = true
    })

    act(() => {
      result.current.handleKeyPress(mockEvent)
    })

    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('resets generation state', () => {
    const { result } = renderHook(() => useAulaGeneration())

    act(() => {
      result.current.setFormData({ topic: 'Test topic' })
      result.current.formErrors.topic = 'Some error'
    })

    act(() => {
      result.current.resetGeneration()
    })

    expect(result.current.formData).toEqual({ topic: '' })
    expect(result.current.formErrors).toEqual({})
    expect(result.current.generatedLesson).toBeNull()
  })

  it('handles API errors gracefully', async () => {
    const { result } = renderHook(() => useAulaGeneration())

    // Mock API error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    act(() => {
      result.current.setFormData({ topic: 'Valid topic' })
    })

    await act(async () => {
      await result.current.generateLesson()
    })

    expect(result.current.isGenerating).toBe(false)
    expect(result.current.generationProgress).toBe(0)
  })

  it('handles invalid topic override', async () => {
    const { result } = renderHook(() => useAulaGeneration())

    await act(async () => {
      await result.current.generateLesson('')
    })

    expect(result.current.isGenerating).toBe(false)
  })
})


