import { renderHook, act } from '@testing-library/react'
import { useAulaCache } from '@/hooks/useAulaCache'

describe('useAulaCache', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('initializes with empty cache', () => {
    const { result } = renderHook(() => useAulaCache())

    expect(result.current.stats.size).toBe(0)
    expect(result.current.stats.hits).toBe(0)
    expect(result.current.stats.misses).toBe(0)
  })

  it('sets and gets lesson data', () => {
    const { result } = renderHook(() => useAulaCache())

    const lessonData = {
      id: 'test-lesson',
      title: 'Test Lesson',
      stages: []
    }

    act(() => {
      result.current.setLesson('test-lesson', lessonData)
    })

    expect(result.current.hasLesson('test-lesson')).toBe(true)
    expect(result.current.getLesson('test-lesson')).toEqual(lessonData)
    expect(result.current.stats.size).toBe(1)
  })

  it('returns null for non-existent lesson', () => {
    const { result } = renderHook(() => useAulaCache())

    expect(result.current.getLesson('non-existent')).toBeNull()
    expect(result.current.hasLesson('non-existent')).toBe(false)
    expect(result.current.stats.misses).toBe(2) // One for get, one for has
  })

  it('sets and gets suggestions', () => {
    const { result } = renderHook(() => useAulaCache())

    const suggestions = [
      { text: 'Suggestion 1', category: 'Test', level: 'Basic' },
      { text: 'Suggestion 2', category: 'Test', level: 'Advanced' }
    ]

    act(() => {
      result.current.setSuggestions(suggestions)
    })

    expect(result.current.hasSuggestions()).toBe(true)
    expect(result.current.getSuggestions()).toEqual(suggestions)
  })

  it('sets and gets progress', () => {
    const { result } = renderHook(() => useAulaCache())

    const progress = {
      currentStage: 2,
      completedStages: [0, 1],
      totalPoints: 100
    }

    act(() => {
      result.current.setProgress('test-lesson', progress)
    })

    expect(result.current.getProgress('test-lesson')).toEqual(progress)
  })

  it('clears specific lesson', () => {
    const { result } = renderHook(() => useAulaCache())

    const lessonData = {
      id: 'test-lesson',
      title: 'Test Lesson',
      stages: []
    }

    act(() => {
      result.current.setLesson('test-lesson', lessonData)
      result.current.setProgress('test-lesson', { currentStage: 1 })
    })

    expect(result.current.stats.size).toBe(2)

    act(() => {
      result.current.clearLesson('test-lesson')
    })

    expect(result.current.hasLesson('test-lesson')).toBe(false)
    expect(result.current.stats.size).toBe(1) // Progress still there
  })

  it('clears entire cache', () => {
    const { result } = renderHook(() => useAulaCache())

    act(() => {
      result.current.setLesson('lesson1', { id: 'lesson1', title: 'Lesson 1' })
      result.current.setLesson('lesson2', { id: 'lesson2', title: 'Lesson 2' })
      result.current.setSuggestions([{ text: 'Test', category: 'Test', level: 'Test' }])
    })

    expect(result.current.stats.size).toBe(3)

    act(() => {
      result.current.clearCache()
    })

    expect(result.current.stats.size).toBe(0)
    expect(result.current.hasLesson('lesson1')).toBe(false)
    expect(result.current.hasLesson('lesson2')).toBe(false)
    expect(result.current.hasSuggestions()).toBe(false)
  })

  it('tracks cache statistics correctly', () => {
    const { result } = renderHook(() => useAulaCache())

    const lessonData = { id: 'test', title: 'Test' }

    act(() => {
      result.current.setLesson('test', lessonData)
    })

    // Test hits
    act(() => {
      result.current.getLesson('test')
      result.current.hasLesson('test')
    })

    expect(result.current.stats.hits).toBe(2)

    // Test misses
    act(() => {
      result.current.getLesson('non-existent')
    })

    expect(result.current.stats.misses).toBe(1)
  })

  it('handles custom TTL', () => {
    const { result } = renderHook(() => useAulaCache())

    const lessonData = { id: 'test', title: 'Test' }

    act(() => {
      result.current.setLesson('test', lessonData, 1000) // 1 second TTL
    })

    expect(result.current.hasLesson('test')).toBe(true)

    // Wait for TTL to expire
    setTimeout(() => {
      expect(result.current.hasLesson('test')).toBe(false)
    }, 1100)
  })

  it('updates stats when operations are performed', () => {
    const { result } = renderHook(() => useAulaCache())

    const initialSize = result.current.stats.size

    act(() => {
      result.current.setLesson('test', { id: 'test', title: 'Test' })
    })

    expect(result.current.stats.size).toBe(initialSize + 1)
    expect(result.current.stats.lastCleanup).toBeGreaterThan(0)
  })
})


